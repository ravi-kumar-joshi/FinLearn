import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Maximize, Minimize, Pause } from 'lucide-react';

// ─── ImageKit Config ────────────────────────────────────────────────────────
const IK_ENDPOINT =
  import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/tz5jjsq';

const VIDEO_PATH   = 'FinancialBasics_Intro.mp4';
const THUMB_PATH   = 'heroleftimg.png';

const ikUrl  = (path, transforms = '') =>
  `${IK_ENDPOINT}/${transforms ? `tr:${transforms}/` : ''}${path}`;

// ─── Inline SVG icons (no extra deps) ───────────────────────────────────────
const PlayIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const VideoIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 10.5V7a2 2 0 00-2-2H5A2 2 0 003 7v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4V6.5l-4 4z" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

// ─── Component ───────────────────────────────────────────────────────────────
const VideoSection = () => {
  const [isOpen,         setIsOpen]         = useState(false);
  const [isPlaying,      setIsPlaying]      = useState(false);
  const [isMuted,        setIsMuted]        = useState(false);
  const [isFullscreen,   setIsFullscreen]   = useState(false);
  const [progress,       setProgress]       = useState(0);   // 0-100
  const [currentTime,    setCurrentTime]    = useState(0);
  const [duration,       setDuration]       = useState(0);
  const [isLoading,      setIsLoading]      = useState(true);
  const [hasError,       setHasError]       = useState(false);
  const [speed,          setSpeed]          = useState(1);
  const [showControls,   setShowControls]   = useState(true);

  const videoRef       = useRef(null);
  const hideTimerRef   = useRef(null);

  // ── auto-hide controls ────────────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    setShowControls(true);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimerRef.current);
  }, [isPlaying, resetHideTimer]);

  // ── open / close ─────────────────────────────────────────────────────────
  const openModal = () => {
    setIsOpen(true);
    setHasError(false);
    setIsLoading(true);
  };

  const closeModal = useCallback(() => {
    const vid = videoRef.current;
    if (vid) { vid.pause(); vid.currentTime = 0; }
    setIsOpen(false);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  // ── playback helpers ──────────────────────────────────────────────────────
  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    isPlaying ? vid.pause() : vid.play().catch(console.error);
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const el = videoRef.current?.parentElement;
    if (!isFullscreen) {
      el?.requestFullscreen?.().catch(console.error);
    } else {
      document.exitFullscreen?.().catch(console.error);
    }
    setIsFullscreen(!isFullscreen);
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    if (videoRef.current) videoRef.current.playbackRate = next;
    setSpeed(next);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos  = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    const vid  = videoRef.current;
    if (vid && duration > 0) {
      vid.currentTime = pos * duration;
    }
  };

  // ── video element events ──────────────────────────────────────────────────
  const onLoadedMetadata = () => {
    setDuration(videoRef.current?.duration ?? 0);
    setIsLoading(false);
    // autoplay
    videoRef.current?.play().catch(console.error);
  };

  const onTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;
    setCurrentTime(vid.currentTime);
    if (vid.duration > 0) setProgress((vid.currentTime / vid.duration) * 100);
  };

  const onEnded = () => { setIsPlaying(false); setProgress(100); };

  const onError = () => { setIsLoading(false); setHasError(true); };

  // ── keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break;
        case 'm':           toggleMute();       break;
        case 'f':           toggleFullscreen(); break;
        case 'Escape':      closeModal();       break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isPlaying, isMuted, isFullscreen]);

  // ── fullscreen change sync ────────────────────────────────────────────────
  useEffect(() => {
    const sync = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Section ── */}
      <section
        className="py-16 px-6 lg:px-8 bg-linear-to-br from-purple-100 via-pink-50 to-purple-100"
        id="WatchVideo"
      >
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-purple-200 text-purple-600 text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              Course Preview
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Watch How FinLearn Makes Finance Simple
              
            </h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              A quick walkthrough of our courses and learning experience
            </p>
          </motion.div>

          {/* Outer glow ring — purely decorative */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-3xl">

              {/* Soft blurred glow behind the card */}
              <div className="absolute -inset-3 rounded-4xl bg-linear-to-br from-purple-400 via-pink-300 to-purple-400 opacity-30 blur-2xl pointer-events-none" />

              {/* Thumbnail card */}
              <motion.div
                className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border border-white/40"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                onClick={openModal}
                whileHover={{ scale: 1.02 }}
              >
                {/* Thumbnail — 16:9 but taller crop so it feels compact */}
                <div className="aspect-video relative overflow-hidden bg-linear-to-br from-purple-400 to-pink-400">
                  <img
                    src={ikUrl(THUMB_PATH, 'w-900,h-506,q-80')}
                    alt="Course Demo Thumbnail"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-all duration-300" />

                  {/* "PREVIEW" badge */}
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
                    ▶ PREVIEW
                  </div>

                  {/* Animated play button — slightly smaller for the tighter card */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl
                                 group-hover:bg-linear-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300"
                      animate={{
                        scale: [1, 1.06, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(168,85,247,.5)',
                          '0 0 0 16px rgba(168,85,247,0)',
                          '0 0 0 0 rgba(168,85,247,0)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      onClick={(e) => { e.stopPropagation(); openModal(); }}
                      aria-label="Play demo video"
                    >
                      <PlayIcon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300 ml-0.5" />
                    </motion.button>
                  </div>
                </div>

                {/* Info bar — slim strip below the video */}
                <div className="bg-white/95 backdrop-blur-sm px-5 py-3 flex items-center gap-3 border-t border-gray-100">
                  <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
                    <VideoIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">Financial Basics — Intro</p>
                    <p className="text-xs text-gray-500">Course Preview</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-purple-600 tabular-nums">
                      {duration > 0 ? formatTime(duration) : '—'}
                    </span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-teal-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={`relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl
                          ${isFullscreen ? 'max-w-full' : 'max-w-5xl'}`}
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit={{    scale: 0.85, opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/20 hover:bg-white/30
                           backdrop-blur-sm rounded-full flex items-center justify-center
                           transition-all hover:rotate-90"
                aria-label="Close video"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Player */}
              <div
                className="aspect-video relative bg-black"
                onMouseMove={resetHideTimer}
                onClick={() => { if (!isLoading) togglePlay(); }}
              >
                {/* ✅ Native <video> — works with any CDN/ImageKit URL */}
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  src={ikUrl(VIDEO_PATH)}
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={onLoadedMetadata}
                  onTimeUpdate={onTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={onEnded}
                  onError={onError}
                  onWaiting={() => setIsLoading(true)}
                  onCanPlay={() => setIsLoading(false)}
                />

                {/* Error */}
                {hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center p-8">
                      <p className="text-red-400 text-xl font-bold mb-3">⚠️ Could not load video</p>
                      <p className="text-gray-300 text-sm">
                        Check that <code className="bg-gray-700 px-2 py-0.5 rounded">{VIDEO_PATH}</code> exists
                        in your ImageKit account and the URL endpoint is correct.
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading spinner */}
                {isLoading && !hasError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white text-sm">Loading video…</p>
                    </div>
                  </div>
                )}

                {/* Controls overlay */}
                <AnimatePresence>
                  {(showControls && !isLoading && !hasError) && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Seek bar */}
                      <div className="mb-3">
                        <div
                          className="w-full h-1.5 bg-gray-600 rounded-full cursor-pointer group"
                          onClick={handleSeek}
                        >
                          <div
                            className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full relative"
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full
                                            opacity-0 group-hover:opacity-100 transition-opacity shadow" />
                          </div>
                        </div>
                        <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center justify-between">
                        {/* Left */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlay}
                            className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full
                                       flex items-center justify-center transition-all hover:scale-110"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                          >
                            {isPlaying
                              ? <Pause  className="w-4 h-4 text-white" />
                              : <PlayIcon className="w-4 h-4 text-white ml-0.5" />}
                          </button>

                          <button
                            onClick={toggleMute}
                            className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full
                                       flex items-center justify-center transition-all hover:scale-110"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                          >
                            {isMuted
                              ? <VolumeX className="w-4 h-4 text-white" />
                              : <Volume2 className="w-4 h-4 text-white" />}
                          </button>
                        </div>

                        {/* Centre title */}
                        <span className="hidden sm:block text-white text-sm font-medium">
                          Financial Basics — Course Preview
                        </span>

                        {/* Right */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={cycleSpeed}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg
                                       text-white text-xs font-semibold transition-all hover:scale-105 min-w-12 text-center"
                          >
                            {speed}×
                          </button>

                          <button
                            onClick={toggleFullscreen}
                            className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full
                                       flex items-center justify-center transition-all hover:scale-110"
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                          >
                            {isFullscreen
                              ? <Minimize className="w-4 h-4 text-white" />
                              : <Maximize className="w-4 h-4 text-white" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoSection;