'use client';

import { motion } from 'framer-motion';

export default function TrustedBy() {
    return (
        <section className="py-16 bg-gray-50 border-y border-gray-200 overflow-hidden flex items-center justify-center">
            <motion.div
                animate={{
                    opacity: [0.6, 1, 0.6],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="text-center px-4"
            >
                <h3 className="text-xl md:text-2xl font-bold text-gray-500 uppercase tracking-widest">
                    Trusted by 1000+ Designers & Agencies
                </h3>
            </motion.div>
        </section>
    );
}
