import React from 'react';
import { motion } from 'framer-motion';

/**
 * ProgressBar Component
 * Displays a horizontal progress bar with optional color customization
 */
const ProgressBar = ({ value = 0, color = '#6366f1', trackColor = '#e5e7eb', height = 8 }) => {
    const percentage = Math.min(Math.max(value, 0), 100);

    return (
        <div
            style={{
                width: '100%',
                height: height,
                background: trackColor,
                borderRadius: height / 2,
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                    height: '100%',
                    background: color,
                    borderRadius: height / 2,
                }}
            />
        </div>
    );
};

export default ProgressBar;
