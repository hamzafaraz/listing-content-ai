'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
    {
        question: "What inputs do I need to provide?",
        answer: "You need: client messages/requirements, product ASIN or URL, product images from client, and optionally competitor listing screenshots or ASINs."
    },
    {
        question: "How long does it take to generate content?",
        answer: "Approximately 3 minutes to analyze your inputs and generate complete content for all 7 listing images including text, visual guidance, and AI prompts."
    },
    {
        question: "What size are the AI image prompts optimized for?",
        answer: "All AI generation prompts are specifically optimized for 2000×2000 pixels, which is ideal for Amazon listing images and ensures high-quality output."
    },
    {
        question: "Can I edit the generated content?",
        answer: "Absolutely! All generated content is fully editable. You can customize text, adjust visual guidance, and modify AI prompts to match your exact needs."
    },
    {
        question: "Which AI image generators work with these prompts?",
        answer: "Our prompts are optimized for Midjourney, DALL-E, Stable Diffusion, and most other AI image generation tools. They produce high-quality, professional product visuals."
    },
    {
        question: "Do you store my project data?",
        answer: "We process your inputs to generate content but do not permanently store your client information, product images, or generated content on our servers."
    },
    {
        question: "Can I download the generated content?",
        answer: "Yes! You can download a complete formatted report containing all text content, visual guidance, and AI prompts for all 7 images."
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border-2 rounded-xl border-gray-100 overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-purple-600 shadow-md ring-2 ring-purple-100' : 'hover:border-purple-300'}`}
                        >
                            <button
                                className="w-full px-6 py-5 text-left flex justify-between items-center bg-white focus:outline-none"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="w-6 h-6 text-purple-600" />
                                ) : (
                                    <ChevronDown className="w-6 h-6 text-gray-400" />
                                )}
                            </button>
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="px-6 pb-6 text-gray-600 bg-gray-50/50">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
