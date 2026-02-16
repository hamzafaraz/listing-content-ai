import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key if available (bypasses RLS), otherwise fall back to Anon Key
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
        const { project_name, input_data, generated_output } = body;

        if (!project_name || !generated_output) {
            return NextResponse.json({ error: { message: 'Missing required fields' } }, { status: 400 });
        }

        const { data, error } = await supabase.from('projects').insert({
            user_id: userId,
            project_name,
            input_data,
            generated_output,
            created_at: new Date().toISOString()
        }).select().single();

        if (error) {
            console.error('Supabase Save Error:', error);
            return NextResponse.json({ error: { message: error.message } }, { status: 500 });
        }

        return NextResponse.json({ success: true, project: data });

    } catch (error: any) {
        console.error('Save API Error:', error);
        return NextResponse.json(
            { error: { message: error.message || 'Internal server error' } },
            { status: 500 }
        );
    }
}
