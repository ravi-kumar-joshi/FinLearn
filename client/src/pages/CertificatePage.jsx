import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Components/Dashboard/Navbar';
import SideBar from '../Components/Dashboard/SideBar';
import {
    Download, Share2, ArrowLeft, Copy, Check, X,
    Linkedin, MessageCircle, Facebook, Twitter,
    Loader2
} from 'lucide-react';
import httpAction from '../utils/httpAction';
import apis from '../utils/apis';
import toast from 'react-hot-toast';
import finlearnLogo from '../asset/apple-touch-icon.png';
import { useSidebarOpen } from '../hooks/useSidebarOpen';
import {
    CERTIFICATE_PLATFORMS,
    getSiteUrl,
    openCertificateShare,
    copyCertificateCaption,
    nativeShareCertificate,
} from '../utils/certificateShare';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://finlearn-1.onrender.com';

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
                <div style={{
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
                </div>
            </div>
        );
    }
);
CertificateCard.displayName = 'CertificateCard';


const CertificateScaler = React.forwardRef(({ children }, ref) => {
    const wrapperRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const REFERENCE_WIDTH = 780; // px — matches typical certificate render width

        const compute = () => {
            if (!wrapperRef.current) return;
            const available = wrapperRef.current.offsetWidth;
            setScale(Math.min(1, available / REFERENCE_WIDTH));
        };

        compute();
        const ro = new ResizeObserver(compute);
        if (wrapperRef.current) ro.observe(wrapperRef.current);
        return () => ro.disconnect();
    }, []);

    // aspect ratio of 11:7.8 → height = width * (7.8/11)
    const REFERENCE_WIDTH = 780;
    const REFERENCE_HEIGHT = Math.round(REFERENCE_WIDTH * (7.8 / 11));

    return (
        /* Outer wrapper — takes full available width, reserves correct height */
        <div
            ref={wrapperRef}
            style={{
                width: '100%',
                height: Math.round(REFERENCE_HEIGHT * scale),
                position: 'relative',
                overflow: 'visible',
            }}
        >
            {/* Inner wrapper — rendered at reference size, scaled via transform */}
            <div
                style={{
                    width: REFERENCE_WIDTH,
                    height: REFERENCE_HEIGHT,
                    transformOrigin: 'top left',
                    transform: `scale(${scale})`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            >
                {/* Clone children injecting the real ref onto the certificate */}
                {React.cloneElement(children, { ref })}
            </div>
        </div>
    );
});
CertificateScaler.displayName = 'CertificateScaler';

const PLATFORM_ICONS = {
    linkedin: Linkedin,
    twitter: Twitter,
    facebook: Facebook,
    whatsapp: MessageCircle,
};

const PLATFORM_HINTS = {
    linkedin: 'Opens post composer with your caption',
    twitter: 'Opens tweet with pre-filled text',
    facebook: 'Opens share dialog with your story',
    whatsapp: 'Opens chat with certificate message',
};

const ShareModal = ({ open, onClose, onSharePlatform, sharingPlatform, onCopyCaption }) => {
    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
                style={{ background: 'rgba(10,10,20,0.55)', backdropFilter: 'blur(8px)' }}
                onClick={onClose}
            >
                <motion.div
                    key="panel"
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    onClick={e => e.stopPropagation()}
                    /* On mobile: full-width bottom sheet with safe-area padding.
                       On sm+: centered card, max-w constrained. */
                    className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100">
                        <div className="pr-3">
                            <h3 className="font-bold text-gray-900 text-base" style={{ fontFamily: 'Georgia, serif' }}>
                                Share Your Achievement
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                Opens the platform post page with your certificate message ready to publish
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                        >
                            <X size={14} className="text-gray-500" />
                        </button>
                    </div>

                    <motion.div className="px-5 sm:px-6 py-4 space-y-2.5">
                        {CERTIFICATE_PLATFORMS.map(({ key, label, color }) => {
                            const Icon = PLATFORM_ICONS[key];
                            const busy = sharingPlatform === key;
                            return (
                                <motion.button
                                    key={key}
                                    type="button"
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!!sharingPlatform}
                                    onClick={() => onSharePlatform(key)}
                                    /* Increased min-height for comfortable touch targets */
                                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group min-h-14"
                                >
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ background: color }}
                                    >
                                        {busy ? <Loader2 size={16} className="text-white animate-spin" /> : <Icon size={16} className="text-white" />}
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 leading-none">{label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{PLATFORM_HINTS[key]}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </motion.button>
                            );
                        })}
                    </motion.div>

                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
                        <button
                            type="button"
                            onClick={onCopyCaption}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors min-h-12"
                        >
                            <Copy size={14} />
                            Copy post caption
                        </button>
                        <p className="text-xs text-center text-gray-400 leading-relaxed">
                            Your post opens on the platform with course details and a verify link. Download the certificate image to attach it manually if you like.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

/* Quick share bar on the certificate page */
function QuickShareBar({ onShare, sharingPlatform, onNativeShare, canNativeShare }) {
    return (
        <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">
                Share on social media
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CERTIFICATE_PLATFORMS.map(({ key, label, color }) => {
                    const Icon = PLATFORM_ICONS[key];
                    const busy = sharingPlatform === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            disabled={!!sharingPlatform}
                            onClick={() => onShare(key)}
                            /* min-h ensures comfortable tap target on mobile */
                            className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all disabled:opacity-50 min-h-[76px] justify-center"
                        >
                            <span
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: color }}
                            >
                                {busy ? (
                                    <Loader2 size={18} className="text-white animate-spin" />
                                ) : (
                                    <Icon size={18} className="text-white" />
                                )}
                            </span>
                            <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</span>
                        </button>
                    );
                })}
            </div>
            {canNativeShare && (
                <button
                    type="button"
                    onClick={onNativeShare}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors min-h-12"
                >
                    <Share2 size={15} />
                    Share via device
                </button>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const CertificatePage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
    const [loading, setLoading] = useState(true);
    const [courseData, setCourseData] = useState(null);
    const [user, setUser] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(false);

    const [sharingPlatform, setSharingPlatform] = useState(null);
    const [_copiedCaption, setCopiedCaption] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);

    const certificateRef = useRef(null);

    useEffect(() => {
        setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
    }, []);

    /* ── Fetch data ── */
    useEffect(() => {
        (async () => {
            try {
                const [userRes, courseRes] = await Promise.all([
                    httpAction({ url: apis().getUserProfile }),
                    httpAction({ url: `${API_BASE_URL}/courses/${courseId}`, method: 'GET' }),
                ]);
                if (userRes?.status) setUser(userRes.user);
                if (courseRes?.success && courseRes.course)
                    setCourseData({ course: courseRes.course, progress: courseRes.progress });
            } catch {
                toast.error('Failed to load certificate');
            } finally {
                setLoading(false);
            }
        })();
    }, [courseId]);

    /* ── Derived ── */
    const studentName = user?.name || 'Learner';
    const courseName = courseData?.course?.title || 'Course';
    const totalXP = courseData?.progress?.totalXPEarned ?? 0;
    const completionDate = courseData?.progress?.completedAt;
    const isCompleted = courseData?.progress?.isCompleted;
    const verifyId = `FL-${courseId?.slice(-6).toUpperCase() ?? 'XXXXXX'}`;
    const instructor = courseData?.course?.instructor;
    const sharePayload = useCallback(() => ({
        studentName,
        courseName,
        totalXP,
        verifyId,
    }), [studentName, courseName, totalXP, verifyId]);

    const handleSharePlatform = useCallback(async (platformKey) => {
        if (sharingPlatform) return;
        setSharingPlatform(platformKey);
        try {
            openCertificateShare(platformKey, sharePayload());
            setShareOpen(false);
            const label = CERTIFICATE_PLATFORMS.find((p) => p.key === platformKey)?.label || 'platform';
            toast.success(`Opening ${label} with your certificate post…`);
        } catch (err) {
            console.error('[share]', err);
            toast.error('Could not open share window. Allow pop-ups and try again.');
        } finally {
            setTimeout(() => setSharingPlatform(null), 600);
        }
    }, [sharingPlatform, sharePayload]);

    const handleCopyCaption = useCallback(async () => {
        try {
            await copyCertificateCaption('linkedin', sharePayload());
            setCopiedCaption(true);
            toast.success('Post caption copied!');
            setTimeout(() => setCopiedCaption(false), 2500);
        } catch {
            toast.error('Could not copy — try again.');
        }
    }, [sharePayload]);

    const handleNativeShare = useCallback(async () => {
        try {
            const ok = await nativeShareCertificate(sharePayload());
            if (!ok) {
                toast.error('Sharing is not supported on this device.');
                return;
            }
            toast.success('Shared!');
        } catch (err) {
            if (err?.name !== 'AbortError') toast.error('Share cancelled or failed.');
        }
    }, [sharePayload]);

    /* ── Standalone download (separate from share) ── */
    const handleDownload = async () => {
        if (!certificateRef.current) return;
        try {
            setDownloading(true);
            const dataUrl = await toPng(certificateRef.current, {
                cacheBust: true, pixelRatio: 3, backgroundColor: '#faf8f3',
            });
            const link = document.createElement('a');
            link.download = `${courseName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-finlearn-certificate.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Certificate downloaded!');
        } catch {
            toast.error('Download failed — please try again.');
        } finally {
            setDownloading(false);
        }
    };

    /* ── Copy verify ID ── */
    const handleCopyId = () => {
        navigator.clipboard?.writeText(verifyId).then(() => {
            setCopiedId(true);
            toast.success('Verification ID copied!');
            setTimeout(() => setCopiedId(false), 2500);
        });
    };

    /* ════════════ LOADING ════════════ */
    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-100" />
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm text-stone-400 tracking-wide">Loading certificate…</p>
            </div>
        </div>
    );

    /* ════════════ NOT COMPLETED ════════════ */
    if (!isCompleted) return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-6 px-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-2xl">🔒</div>
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                    Complete the course first
                </h2>
                <p className="text-sm text-gray-400">Finish all modules to unlock your certificate.</p>
            </div>
            <motion.button
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/dashboard/course/${courseId}`)}
                className="px-7 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
                Resume Course →
            </motion.button>
        </div>
    );

    /* ════════════ MAIN ════════════ */
    return (
        <div className="min-h-screen bg-stone-50">

            <Navbar onMenuClick={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />

            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className={[
                'pt-16 transition-[margin] duration-300 ease-in-out',
                sidebarOpen ? 'lg:ml-64' : 'lg:ml-16',
            ].join(' ')}>
                {/* Safe-area padding on sides for notched/punch-hole phones */}
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
                    style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>

                    {/* Back */}
                    <motion.button
                        type="button" whileHover={{ x: -2 }}
                        onClick={() => navigate(`/dashboard/course/${courseId}`)}
                        className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm mb-7 sm:mb-10"
                    >
                        <ArrowLeft size={14} />
                        <span>Back to course</span>
                    </motion.button>

                    {/* ── HERO ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="text-center mb-7 sm:mb-10"
                    >
                        <p className="text-xs uppercase tracking-widest text-amber-600 font-semibold mb-3"
                            style={{ letterSpacing: '0.22em' }}>
                            FinLearn Academy
                        </p>
                        {/* Hero heading: smaller on xs so it never wraps oddly */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 wrap-break-word"
                            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}>
                            Congratulations, {studentName.split(' ')[0]} 🎉
                        </h1>
                        <p className="text-stone-400 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
                            You've earned a verified certificate for completing{' '}
                            <span className="text-stone-600 font-medium">{courseName}</span>
                        </p>
                    </motion.div>

                    {/* ── CERTIFICATE ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.18, duration: 0.5 }}
                        className="mb-6 rounded-md overflow-hidden"
                        style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 20px 50px rgba(0,0,0,0.1)' }}
                    >
                        {/*
                            CertificateScaler: visually scales the card to fit any viewport
                            while the actual CertificateCard DOM node (captured by toPng)
                            remains at full reference size for crisp PNG export.
                        */}
                        <CertificateScaler ref={certificateRef}>
                            <CertificateCard
                                studentName={studentName}
                                courseName={courseName}
                                completionDate={completionDate}
                                totalXP={totalXP}
                                verifyId={verifyId}
                                instructor={instructor}
                            />
                        </CertificateScaler>
                    </motion.div>

                    <QuickShareBar
                        onShare={handleSharePlatform}
                        sharingPlatform={sharingPlatform}
                        onNativeShare={handleNativeShare}
                        canNativeShare={canNativeShare}
                    />

                    {/* ── ACTION BUTTONS ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5"
                    >
                        <motion.button
                            type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                            onClick={handleDownload} disabled={downloading}
                            className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 min-h-[52px] w-full"
                        >
                            <Download size={15} />
                            {downloading ? 'Generating…' : 'Download Certificate'}
                        </motion.button>

                        <motion.button
                            type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setShareOpen(true)}
                            className="flex items-center justify-center gap-2.5 py-3.5 px-6 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-sm font-semibold rounded-xl transition-colors min-h-[52px] w-full"
                        >
                            <Share2 size={15} />
                            Share on Social Media
                        </motion.button>
                    </motion.div>

                    {/* ── VERIFICATION STRIP ── */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.42 }}
                        className="flex items-center gap-2 sm:gap-3 bg-white border border-gray-100 rounded-xl px-3 sm:px-4 py-3 shadow-sm"
                    >
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                        <span className="text-xs text-gray-400 shrink-0">Verification ID</span>
                        {/* truncate prevents ID from blowing out narrow screens */}
                        <span className="text-xs font-mono font-bold text-gray-700 flex-1 truncate min-w-0">{verifyId}</span>
                        <button
                            onClick={handleCopyId}
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors shrink-0 min-h-9 px-1"
                        >
                            {copiedId
                                ? <><Check size={13} className="text-emerald-500" /> Copied</>
                                : <><Copy size={13} /> Copy ID</>
                            }
                        </button>
                    </motion.div>

                </div>
            </main>

            <ShareModal
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                onSharePlatform={handleSharePlatform}
                sharingPlatform={sharingPlatform}
                onCopyCaption={handleCopyCaption}
            />
        </div>
    );
};

export default CertificatePage;