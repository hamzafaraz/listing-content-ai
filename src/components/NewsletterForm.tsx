"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            // 1. Save to Supabase
            const { error: dbError } = await supabase.from('subscribers').insert({ email });
            if (dbError) {
                if (dbError.code === '23505') throw new Error('You are already subscribed!');
                throw dbError;
            }

            // 2. Send Welcome Email
            const emailRes = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    firstName: 'Designer',
                    subject: 'Welcome to the ListingContentAI Waitlist! 🚀',
                    message: 'Thank you for joining. We will keep you updated on new features and AI tips for Amazon listings.'
                })
            });

            if (!emailRes.ok) throw new Error('Failed to send welcome email');

            setStatus('success');
            setMessage('Thanks for subscribing! Check your email.');
            setEmail('');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage(err.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
                <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={status === 'loading' || status === 'success'}
                />
                <button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    className="bg-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                    {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {status === 'success' ? 'Joined!' : 'Join'}
                </button>
            </div>
            {message && (
                <p className={`mt-3 text-sm font-semibold ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                    {message}
                </p>
            )}
        </form>
    );
}
