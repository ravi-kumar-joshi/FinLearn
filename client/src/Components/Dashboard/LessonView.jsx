import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, ExternalLink, CheckCircle2 } from 'lucide-react';

function videoEmbedSrc(url) {
    if (!url || typeof url !== 'string') return null;
    const u = url.trim();
    try {
        const parsed = new URL(u);
        if (parsed.hostname.includes('youtube.com')) {
            const v = parsed.searchParams.get('v');
            if (v) return `https://www.youtube.com/embed/${v}`;
        }
        if (parsed.hostname === 'youtu.be') {
            const id = parsed.pathname.replace(/^\//, '');
            if (id) return `https://www.youtube.com/embed/${id}`;
        }
    } catch {
        /* plain string */
    }
    return u.startsWith('http') ? u : null;
}

const LessonView = ({ lesson, isCompleted, onComplete }) => {
    const xp = lesson?.xpReward ?? 20;

    const isLikelyHtml = useMemo(() => {
        const c = lesson?.content;
        return typeof c === 'string' && /<[a-z][\s\S]*>/i.test(c);
    }, [lesson?.content]);

    const embedSrc = useMemo(() => videoEmbedSrc(lesson?.videoUrl), [lesson?.videoUrl]);

    if (!lesson) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 760 }}>
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 10 }}>
                    {lesson.title}
                </h1>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={15} /> {lesson.duration ?? 15} min
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap size={15} color="#f59e0b" fill="#fbbf24" /> +{xp} XP
                    </span>
                </div>
            </div>

            {embedSrc && (
                <div
                    style={{
                        marginBottom: 24,
                        borderRadius: 12,
                        overflow: 'hidden',
                        aspectRatio: '16/9',
                        background: '#000',
                    }}
                >
                    <iframe
                        title={`Video: ${lesson.title}`}
                        src={embedSrc}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}

            {lesson.content &&
                (isLikelyHtml ? (
                    <div
                        style={{
                            fontSize: 15,
                            lineHeight: 1.65,
                            color: '#374151',
                            marginBottom: 24,
                        }}
                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                    />
                ) : (
                    <div
                        style={{
                            fontSize: 15,
                            lineHeight: 1.65,
                            color: '#374151',
                            whiteSpace: 'pre-wrap',
                            marginBottom: 24,
                        }}
                    >
                        {lesson.content}
                    </div>
                ))}

            {Array.isArray(lesson.resources) && lesson.resources.length > 0 && (
                <div
                    style={{
                        marginBottom: 24,
                        padding: 16,
                        background: '#f9fafb',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                    }}
                >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
                        Resources
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: '#4b5563', fontSize: 14 }}>
                        {lesson.resources.map((r, i) => (
                            <li key={`${r.url}-${i}`} style={{ marginBottom: 6 }}>
                                <a
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                >
                                    {r.title || r.url}
                                    <ExternalLink size={14} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!isCompleted ? (
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onComplete}
                    style={{
                        padding: '12px 28px',
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    Mark lesson complete
                </motion.button>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontWeight: 600 }}>
                    <CheckCircle2 size={20} />
                    Completed
                </div>
            )}
        </motion.div>
    );
};

export default LessonView;
