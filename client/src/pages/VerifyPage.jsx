
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ExternalLink, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5050' : '/api';
const SITE_URL = 'https://finlearn.app';

const VerifyPage = () => {
    const { verifyId } = useParams();
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/certificates/og-meta/${verifyId}`);
                if (!res.ok) throw new Error('Not found');

                const data = await res.json();
                if (data.success) setMeta(data.meta);
                else setError(true);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [verifyId]);

    /* ── Loading ── */
    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-amber-100" />
                <div className="absolute inset-0 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            </div>
        </div>
    );

    /* ── Error ── */
    if (error || !meta) return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4 px-4">
            <AlertTriangle size={40} className="text-amber-400" />
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                Certificate not found
            </h2>
            <p className="text-sm text-gray-400 text-center max-w-xs">
                The verification ID <span className="font-mono font-bold text-gray-600">{verifyId}</span> does not match any issued certificate.
            </p>
            <Link to="/" className="text-sm font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
                ← Back to FinLearn
            </Link>
        </div>
    );

    return (
        <>
            {/*
                Social crawlers read these when someone shares the link.
                NOTE: For LinkedIn and Facebook crawlers (which don't run JS),
                you also need the SSR Express route from certificateRoutes.js
                to serve these tags in the raw HTML response.
            */}

            <div className="min-h-screen bg-stone-50">
                {/* Minimal header */}
                <header className="border-b border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="text-sm font-bold text-gray-900 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                        FinLearn Academy
                    </Link>
                    <span className="text-xs text-gray-400">Certificate Verification</span>
                </header>

                <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

                    {/* Verified badge */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-700">Verified Certificate</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
                            style={{ fontFamily: 'Georgia, serif' }}>
                            {meta.title}
                        </h1>
                        <p className="text-stone-400 text-sm">{meta.description}</p>
                    </div>

                    {/* Certificate image */}
                    {meta.imageUrl && (
                        <div className="rounded-lg overflow-hidden mb-8"
                            style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 20px 50px rgba(0,0,0,0.1)' }}>
                            <img
                                src={meta.imageUrl}
                                alt="Certificate of Completion"
                                className="w-full h-auto block"
                            />
                        </div>
                    )}

                    {/* Verification info */}
                    <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm mb-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-400">Verification ID</p>
                            <p className="text-sm font-mono font-bold text-gray-800">{verifyId}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            Authentic
                        </span>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-3">
                            Want to earn your own certificate?
                        </p>
                        <a
                            href={SITE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            Explore FinLearn Academy
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </main>
            </div>
        </>
    );
};

export default VerifyPage;