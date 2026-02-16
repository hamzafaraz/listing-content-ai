
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({
                hasAccess: false,
                plan: 'Free Demo',
                limit: 1,
                usage: 0
            });
        }

        // 1. Get Subscription Status
        // First try to get with the new column
        let { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('status, plan_id, last_reset_count')
            .eq('user_id', userId)
            .maybeSingle();

        // If that fails (likely due to missing column), try without it
        if (subError) {
            const { data: retryData, error: retryError } = await supabase
                .from('subscriptions')
                .select('status, plan_id')
                .eq('user_id', userId)
                .maybeSingle();
            subData = retryData as any;
        }

        let limit = 1;
        let planName = 'Free Demo';
        let hasAccess = false;
        let lastResetCount = (subData as any)?.last_reset_count || 0;

        if (subData && subData.status === 'active') {
            const pid = (subData.plan_id || '').toLowerCase();
            if (pid.includes('agency')) {
                limit = 50;
                planName = 'Agency Plan';
            } else if (pid.includes('professional')) {
                limit = 35;
                planName = 'Professional Plan';
            } else if (pid.includes('starter')) {
                limit = 20;
                planName = 'Starter Plan';
            } else {
                limit = 20; // Default for active but unknown plan
                planName = 'Starter Plan';
            }
            hasAccess = true;
        }

        // 2. Get Usage Count
        const { count, error: countError } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        const totalProjects = count || 0;
        const currentUsage = Math.max(totalProjects - lastResetCount, 0);

        // If generic free user, check limit
        if (!hasAccess) {
            if (currentUsage < 1) {
                hasAccess = true;
            }
        }

        return NextResponse.json({
            hasAccess,
            plan: planName,
            limit,
            usage: currentUsage
        });

    } catch (error: any) {
        console.error('Subscription Check Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
