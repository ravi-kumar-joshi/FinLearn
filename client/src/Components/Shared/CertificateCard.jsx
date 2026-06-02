import React from 'react';
import { motion } from 'framer-motion';
import finlearnLogo from '../../asset/apple-touch-icon.png';
import { getSiteUrl } from '../../utils/certificateShare';

/**
 * Certificate visual — inline styles required for html-to-image export.
 * Shared version used across the app.
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
            /* Outer gold frame */
            <div
                ref={ref}
                style={{
                    width: '100%', aspectRatio: '11 / 7.8', padding: '6px',
                    borderRadius: '4px', boxSizing: 'border-box', display: 'block',
                    fontFamily: 'Georgia,"Times New Roman",serif',
                    background: 'linear-gradient(135deg,#b8962e 0%,#f0d060 30%,#c9a84c 60%,#f5e07a 80%,#a07830 100%)',
                }}
            >
                {/* Paper */}
                <motion.div style={{
                    width: '100%', height: '100%', background: '#faf8f3', borderRadius: '2px',
                    position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'space-between', padding: '36px 56px 28px',
                    boxShadow: 'inset 0 0 80px rgba(0,0,0,0.03)',
                }}>
                    {/* Paper texture */}
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(180,160,100,0.05) 24px,rgba(180,160,100,0.05) 25px)' }} />
                    {/* Inner border */}
                    <div style={{ position: 'absolute', inset: '14px', border: '1px solid rgba(201,168,76,0.35)', borderRadius: '2px', pointerEvents: 'none' }} />

                    {/* HEADER */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ height: '1px', width: '56px', background: 'linear-gradient(to right,transparent,#c9a84c)' }} />
                            <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.28em', color: '#8b6914', textTransform: 'uppercase' }}>FinLearn Academy</p>
                            <div style={{ height: '1px', width: '56px', background: 'linear-gradient(to left,transparent,#c9a84c)' }} />
                        </div>
                        <h2 style={{ margin: '0 0 8px', fontSize: '1.9rem', fontWeight: 400, color: '#1a1a2e', letterSpacing: '0.06em' }}>Certificate of Completion</h2>
                        <div style={{ height: '1px', width: '80px', background: 'linear-gradient(90deg,transparent,#c9a84c,transparent)' }} />
                    </div>

                    {/* BODY */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.82rem', fontStyle: 'italic', color: '#5a5a72' }}>This is to certify that</p>
                        <h1 style={{ margin: 0, fontSize: nameSize, fontWeight: 700, color: '#0f0e2a', letterSpacing: '-0.01em', textAlign: 'center', lineHeight: 1.2 }}>{studentName}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '220px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#ddd0a8' }} />
                            <span style={{ color: '#c9a84c', fontSize: '0.8rem' }}>✦</span>
                            <div style={{ flex: 1, height: '1px', background: '#ddd0a8' }} />
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', fontStyle: 'italic', color: '#5a5a72' }}>has successfully completed the course</p>
                        <h3 style={{ margin: 0, fontSize: courseSize, fontWeight: 600, fontStyle: 'italic', color: '#1a1a2e', maxWidth: '65%', textAlign: 'center', lineHeight: 1.4 }}>&ldquo;{courseName}&rdquo;</h3>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', border: '1px solid #c9a84c', borderRadius: '999px', background: 'rgba(201,168,76,0.06)' }}>
                            <span style={{ color: '#c9a84c', fontSize: '0.7rem' }}>⚡</span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8b6914', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{totalXP ?? 0} XP Earned</span>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                        <div style={{ height: '1px', background: '#e8dfcc', marginBottom: '18px' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ margin: '0 0 5px', fontSize: '0.8rem', fontWeight: 600, color: '#1a1a2e' }}>{dateStr}</p>
                                <div style={{ height: '1px', width: '120px', background: '#c9a84c', marginBottom: '5px' }} />
                                <p style={{ margin: 0, fontSize: '0.55rem', color: '#8b8b9a', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Date Awarded</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#f0d060)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 14px rgba(180,140,50,0.28)' }}>
                                    <img src={finlearnLogo} alt="FinLearn Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                                </div>
                                <p style={{ margin: 0, fontSize: '0.5rem', color: '#c9a84c', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Verified Seal</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: '0 0 5px', fontSize: '0.8rem', fontWeight: 600, fontStyle: 'italic', color: '#1a1a2e' }}>{instructor || 'FinLearn Team'}</p>
                                <div style={{ height: '1px', width: '120px', background: '#c9a84c', marginBottom: '5px', marginLeft: 'auto' }} />
                                <p style={{ margin: 0, fontSize: '0.55rem', color: '#8b8b9a', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Issued By</p>
                            </div>
                        </div>
                        <p style={{ margin: '14px 0 0', textAlign: 'center', fontSize: '0.55rem', color: '#b0a898', letterSpacing: '0.06em' }}>
                            VERIFICATION ID: {verifyId} · {getSiteUrl()}/verify/{verifyId}
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }
);
CertificateCard.displayName = 'CertificateCard';

export default CertificateCard;
