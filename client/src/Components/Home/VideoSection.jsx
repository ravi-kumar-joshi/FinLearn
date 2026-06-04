import React, { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ─── ImageKit Config ─────────────────────────────────────────────────────────
const IK_ENDPOINT =
  import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/tz5jjsqeb';

const VIDEO_PATH = 'FinancialBasics_Intro.mp4';
const THUMB_PATH = 'heroleftimg.png';

const ikUrl = (path, transforms = '') =>
  `${IK_ENDPOINT}/${transforms ? `tr:${transforms}/` : ''}${path}`;

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const PlayIcon = memo(({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
));

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 32 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.25, ease: 'easeIn' } },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

// ─── VideoModal ───────────────────────────────────────────────────────────────
const VideoModal = memo(({ onClose }) => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Keyboard: Escape to close
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Platform tour video"
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      <motion.div
        className="relative w-full max-w-5xl z-10"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:top-4 sm:right-4 z-20 w-10 h-10
                     bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20
                     rounded-full flex items-center justify-center
                     transition-all duration-200 hover:scale-110 hover:rotate-90"
          aria-label="Close video"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Player shell */}
        <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-[0_32px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          {/* Loading spinner */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 pointer-events-none">
              <div className="w-12 h-12 rounded-full border-[3px] border-purple-500/30 border-t-purple-500 animate-spin" />
              <p className="mt-3 text-white/60 text-sm font-medium tracking-wide">Loading…</p>
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
                <span className="text-2xl" role="img" aria-label="Warning">⚠️</span>
              </div>
              <p className="text-white font-semibold mb-1">Couldn't load the video</p>
              <p className="text-white/50 text-sm">
                Make sure <code className="text-purple-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">{VIDEO_PATH}</code> exists in your ImageKit account.
              </p>
            </div>
          )}

          {/* Native video — controls handle everything */}
          <video
            ref={videoRef}
            className="w-full h-full"
            src={ikUrl(VIDEO_PATH)}
            controls
            autoPlay
            playsInline
            preload="metadata"
            onLoadedMetadata={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
});

// ─── ThumbnailCard ────────────────────────────────────────────────────────────
const ThumbnailCard = memo(({ onClick }) => (
  <motion.div
    className="relative w-full max-w-3xl mx-auto"
    variants={scaleIn}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
  >
    {/* Ambient glow */}
    <div
      className="absolute -inset-4 rounded-[2rem] opacity-40 blur-3xl pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #a855f7 0%, #ec4899 60%, transparent 100%)' }}
      aria-hidden="true"
    />

    {/* Card */}
    <button
      onClick={onClick}
      className="relative w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20
                 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/60
                 group cursor-pointer"
      aria-label="Play FinLearn platform tour"
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-purple-900 to-pink-900">
        <img
          src={ikUrl(THUMB_PATH, 'w-960,h-540,q-85')}
          alt="FinLearn platform preview"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />

        {/* Cinematic overlay — subtle bottom-heavy gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10
                        group-hover:from-black/70 group-hover:via-black/30 transition-all duration-500" />

        {/* "TOUR" badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5
                        bg-black/30 backdrop-blur-md border border-white/20
                        text-white text-xs font-semibold tracking-widest uppercase
                        px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
          Platform Tour
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.07, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Pulse ring */}
            <motion.span
              className="absolute inset-0 rounded-full bg-white/20"
              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              aria-hidden="true"
            />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full
                            bg-white/95 shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                            group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-pink-600
                            flex items-center justify-center
                            transition-all duration-300">
              <PlayIcon className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 group-hover:text-white
                                   transition-colors duration-300 ml-1" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-white/95 backdrop-blur-sm px-4 sm:px-5 py-3 sm:py-3.5
                      flex items-center gap-3 border-t border-gray-100/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700
                        flex items-center justify-center shadow-md shrink-0"
             aria-hidden="true">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7a2 2 0 00-2-2H5A2 2 0 003 7v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4V6.5l-4 4z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-semibold text-gray-900 text-sm truncate leading-tight">
            FinLearn — Platform Walkthrough
          </p>
          <p className="text-xs text-gray-400 mt-0.5">See how it works</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-purple-600 font-semibold
                           bg-purple-50 px-2.5 py-1 rounded-full">
            <PlayIcon className="w-3 h-3" />
            Watch Now
          </span>
          {/* Mobile: just icon */}
          <span className="sm:hidden w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
            <PlayIcon className="w-3.5 h-3.5 text-purple-600 ml-0.5" />
          </span>
        </div>
      </div>
    </button>
  </motion.div>
));

// ─── VideoSection ─────────────────────────────────────────────────────────────
const VideoSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal  = useCallback(() => setIsOpen(true),  []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <section
        id="PlatformTour"
        className="py-16 sm:py-24 px-5 sm:px-8
                   bg-gradient-to-br from-purple-50 via-white to-pink-50
                   overflow-hidden"
      >
        <div className="max-w-5xl mx-auto">
          {/* Heading block */}
          <motion.div
            className="text-center mb-10 sm:mb-12"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2
                            bg-white/80 backdrop-blur-sm border border-purple-200/70
                            text-purple-600 text-xs font-semibold tracking-widest uppercase
                            px-4 py-1.5 rounded-full shadow-sm mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" aria-hidden="true" />
              2-Minute Tour
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-3">
              Explore the FinLearn Experience
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
              See how we make financial literacy approachable, structured, and genuinely effective.
            </p>
          </motion.div>

          {/* Thumbnail */}
          <ThumbnailCard onClick={openModal} />
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && <VideoModal onClose={closeModal} />}
      </AnimatePresence>
    </>
  );
};

export default VideoSection;