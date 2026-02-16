'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterEffectProps {
    text: string;
    speed?: number;
    className?: string;
}

export default function TypewriterEffect({ text, speed = 100, className }: TypewriterEffectProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                setIndex((prev) => prev + 1);
            } else {
                // Reset to loop
                setTimeout(() => {
                    setDisplayedText('');
                    setIndex(0);
                }, 2000); // Wait 2 seconds before restarting
            }
        }, speed);

        return () => clearTimeout(timeout);
    }, [index, text, speed]);

    return (
        <motion.h1
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {displayedText}
            <span className="animate-pulse">|</span>
        </motion.h1>
    );
}
