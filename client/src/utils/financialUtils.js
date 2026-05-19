/**
 * financialUtils.js
 * ─────────────────────────────────────────────────────────────
 * Shared utilities for the Indian-rupee financial calculator suite.
 *
 * Exports
 *   clamp(v, min, max)          — safe number clamping
 *   fmtINR(v)                   — ₹ short form  (Cr / L / K)
 *   fmtFull(v)                  — ₹ full form with 2 dp
 *   makeSliderStyle(accent)     — injects range-input CSS for an accent color
 */

/* ── pure helpers ──────────────────────────────────────────── */

export const clamp = (v, min, max) =>
  Math.min(Math.max(Number(v) || 0, min), max);

export const fmtINR = (v) => {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)} K`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
};

export const fmtFull = (v) =>
  `₹${Math.round(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* ── slider CSS factory ────────────────────────────────────── */
/**
 * makeSliderStyle(accent, className)
 * Generates a <style> string for a filled range slider.
 *
 * @param {string} accent     – any valid CSS color, e.g. "#f97316" or "#0d9488"
 * @param {string} className  – the CSS class name to scope styles to (no dot)
 */
export const makeSliderStyle = (accent, className) => `
  .${className} {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    outline: none;
    cursor: pointer;
  }
  .${className}::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px; height: 16px;
    border-radius: 50%;
    background: ${accent};
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px ${accent};
    cursor: pointer;
    transition: box-shadow 0.15s;
  }
  .${className}::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 4px ${accent}33;
  }
  .${className}::-moz-range-thumb {
    width: 16px; height: 16px;
    border-radius: 50%;
    background: ${accent};
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px ${accent};
    cursor: pointer;
  }
`;
