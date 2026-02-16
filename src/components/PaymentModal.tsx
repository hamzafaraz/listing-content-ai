'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: string;
    price: string;
}

export default function PaymentModal({ isOpen, onClose, plan, price }: PaymentModalProps) {
    const { user } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user) {
            setError("Please sign in to submit a request.");
            setLoading(false);
            return;
        }

        try {
            // 1. Insert into subscriptions table as pending
            // checking if a subscription already exists for this user to update or insert
            const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('id')
                .eq('user_id', user.id)
                .single();

            let result;

            const payload = {
                user_id: user.id,
                plan_id: plan,
                status: 'pending_approval',
                price: price,
                customer_name: formData.name,
                email: formData.email,
                customer_whatsapp: formData.whatsapp,
                created_at: new Date().toISOString(),
            };

            if (existingSub) {
                result = await supabase
                    .from('subscriptions')
                    .update(payload)
                    .eq('id', existingSub.id);
            } else {
                result = await supabase
                    .from('subscriptions')
                    .insert([payload]);
            }

            if (result.error) throw result.error;

            setSubmitted(true);
        } catch (err: any) {
            console.error('Error submitting payment request:', err);
            setError('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 font-bold" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Request Submitted!</h3>
                    <p className="text-gray-600 mb-6">
                        Thank you, <span className="font-bold">{formData.name}</span>.<br />
                        We have received your request for the <span className="text-purple-600 font-bold">{plan}</span> plan.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-500 mb-8 border border-gray-100">
                        Our team will review your request and activate your account shortly. You will be notified via email/WhatsApp.
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Payment Request</h3>
                        <p className="text-sm text-gray-500">Manual Payment Verification</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">

                    {/* Plan Info */}
                    <div className="bg-purple-50 p-4 rounded-xl flex justify-between items-center mb-6 border border-purple-100">
                        <span className="font-bold text-gray-700">{plan}</span>
                        <span className="font-black text-purple-700 text-lg">{price}</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition outline-none text-gray-900"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition outline-none text-gray-900"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp / Phone</label>
                            <input
                                type="tel"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition outline-none text-gray-900"
                                placeholder="+92 300 1234567"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 gradient-bg text-white font-bold py-4 rounded-xl hover:opacity-90 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        Your request will be sent to our team for approval.
                    </p>
                </form>
            </div>
        </div>
    );
}
