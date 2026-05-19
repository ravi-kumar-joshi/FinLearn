import React from 'react';
import { motion } from 'framer-motion';

export default function Panel({ title, children, className = "" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6 ${className}`}
        >
            {title && <h3 className="text-lg font-semibold mb-3 text-gray-900">{title}</h3>}
            {children}
        </motion.div>
    );
}