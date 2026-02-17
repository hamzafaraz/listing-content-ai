import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
        }

        const body = await req.json();
        const { projectId, generated_output } = body;

        if (!projectId || !generated_output) {
            return NextResponse.json({ error: { message: 'Missing required fields' } }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('projects')
            .update({
                generated_output,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId)
            .eq('user_id', userId) // Security check
            .select()
            .single();

        if (error) {
            console.error('Supabase Update Error:', error);
            return NextResponse.json({ error: { message: error.message } }, { status: 500 });
        }

        return NextResponse.json({ success: true, project: data });

    } catch (error: any) {
        console.error('Update API Error:', error);
        return NextResponse.json(
            { error: { message: error.message || 'Internal server error' } },
            { status: 500 }
        );
    }
}
