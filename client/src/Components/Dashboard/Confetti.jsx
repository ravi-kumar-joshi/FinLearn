import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

/**
 * Confetti Component
 * Triggers confetti animation when active prop is true
 */
const Confetti = ({ active = false }) => {
    useEffect(() => {
        if (active) {
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });

            // Optional: second burst from sides
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    spread: 90,
                    origin: { x: 0, y: 0.5 },
                });
                confetti({
                    particleCount: 50,
                    spread: 90,
                    origin: { x: 1, y: 0.5 },
                });
            }, 250);
        }
    }, [active]);

    return null;
};

export default Confetti;
