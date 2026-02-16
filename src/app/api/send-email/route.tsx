import { EmailTemplate } from '@/components/EmailTemplate';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { to, firstName, message, subject } = await req.json();

        const { data, error } = await resend.emails.send({
            from: 'ListingContentAI <onboarding@resend.dev>', // Use default Resend domain for testing
            to: [to],
            subject: subject || 'Welcome to ListingContentAI!',
            react: <EmailTemplate firstName={firstName} message={message} />,
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
