import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (to bypass RLS for checking limits)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
        }

        // 1. Check Subscription Status & Determine Limit
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status, plan_id')
            .eq('user_id', userId)
            .single();

        let limit = 2; // Default Free Limit
        let isPremium = false;

        if (subscription && subscription.status === 'active') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pid = ((subscription as any).plan_id || '').toLowerCase();
            if (pid.includes('agency')) limit = 50;
            else if (pid.includes('professional')) limit = 35;
            else if (pid.includes('starter')) limit = 20;
            else limit = 20; // Default paid

            isPremium = true;
        }

        // 2. Check Usage Count against Dynamic Limit
        const { count, error } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) {
            console.error('Usage check error object:', error);
            // Safe error stringify for Supabase PostgrestError or native Error
            const errorMessage = (error as any).message || (error as any).error_description || JSON.stringify(error);
            const errorCode = (error as any).code || '';
            const errorDetails = (error as any).details || '';

            throw new Error(`Usage check failed: ${errorCode} ${errorMessage} ${errorDetails}`);
        }

        const currentUsage = count || 0;

        if (currentUsage >= limit) {
            return NextResponse.json(
                { error: { message: `Usage limit reached (${currentUsage}/${limit}). Please upgrade your plan.` } },
                { status: 403 }
            );
        }

        const { messages, max_tokens, system } = await req.json();

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: { message: 'Anthropic API key not configured' } },
                { status: 500 }
            );
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Switch to Haiku (Compatible with current tier)
                max_tokens: max_tokens || 4000,
                messages: messages,
                system: system
            })
        });

        const data = await response.json();

        if (data.error) {
            return NextResponse.json(data, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error in API route:', error);
        return NextResponse.json(
            { error: { message: error.message || 'Internal server error' } },
            { status: 500 }
        );
    }
}
