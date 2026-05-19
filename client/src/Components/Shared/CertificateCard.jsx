import React from 'react';
import finlearnLogo from '../../asset/apple-touch-icon.png';
import { getSiteUrl } from '../../utils/certificateShare';

/**
 * Certificate visual — inline styles required for html-to-image export.
 */
const CertificateCard = React.forwardRef(
    ({ studentName, courseName, completionDate, totalXP, verifyId, instructor }, ref) => {
        const dateStr = completionDate
            ? new Date(completionDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
            })
            : new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
            });

        const nameSize = studentName.length > 24 ? '2rem' : '2.75rem';
        const courseSize = courseName.length > 50 ? '0.88rem' : '1.1rem';

        return (
            <div
                ref={ref}
                style={{
                    width: '100%', aspectRatio: '11 / 7.8', padding: '6px',
                    borderRadius: '4px', boxSizing: 'border-box', display: 'block',
                    fontFamily: 'Georgia,"Times New Roman",serif',
                    background: 'linear-gradient(135deg,#b8962e 0%,#f0d060 30%,#c9a84c 60%,#f5e07a 80%,#a07830 100%)',
                }}
            >
                <motion.div style={{
                    width: '100%', height: '100%', background: '#faf8f3', borderRadius: '2px',
                    position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'space-between', padding: '36px 56px 28px',
                    boxShadow: 'inset 0 0 80px rgba(0,0,0,0.03)',
                }}>