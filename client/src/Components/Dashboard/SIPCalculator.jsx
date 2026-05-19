/**
 * SIP Calculator Component
 *
 * Optimized & redesigned to match BudgetCalculator quality.
 * - Manual number inputs (not just sliders) with validation
 * - Indian Rupee formatting (Cr / L / K)
 * - Breakdown bar + yearly growth table
 * - Savings-rate style tips & warnings
 * - Reset button, onClose prop support
 *
 * @component
 */

import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  RefreshCw,
  TrendingUp,
  IndianRupee,
  Calendar,
  Percent,
  Info,
} from "lucide-react";

/* ── helpers ─────────────────────────────────────────────── */

const clamp = (v, min, max) => Math.min(Math.max(Number(v) || 0, min), max);

const fmtINR = (v) => {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)} K`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
};

const fmtFull = (v) =>
  `₹${Math.round(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* ── sub-components ──────────────────────────────────────── */

/* Slider track fill style — injected once */
const sliderStyle = `
  .sip-range {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 9999px;
    outline: none;
    cursor: pointer;
  }
  .sip-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6366f1;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #6366f1;
    cursor: pointer;
    transition: box-shadow 0.15s;
  }
  .sip-range::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 4px rgba(99,102,241,0.2);
  }
  .sip-range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6366f1;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #6366f1;
    cursor: pointer;
  }
`;

const InputRow = ({ icon, label, value, onChange, min, max, unit, placeholder }) => {
  const Icon = icon;
  const clamped = clamp(value, min, max);
  const fillPct = ((clamped - min) / (max - min)) * 100;
  const trackStyle = {
    background: `linear-gradient(to right, #6366f1 ${fillPct}%, #e5e7eb ${fillPct}%)`,
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 shrink-0">
        <Icon className="w-4 h-4 text-indigo-500" />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
        <div className="relative">
          {unit === "₹" && (
            <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          )}
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onChange(clamp(e.target.value, min, max))}
            className={`w-full py-2 border border-gray-300 rounded-lg text-sm
              focus:ring-2 focus:ring-indigo-400 focus:border-transparent
              ${unit === "₹" ? "pl-8 pr-3" : "pl-3 pr-8"}`}
          />
          {unit !== "₹" && (
            <span className="absolute right-3 top-2 text-sm text-gray-400 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </div>
      {/* slider with visible filled track */}
      <div className="w-28 hidden sm:block">
        <input
          type="range"
          min={min}
          max={max}
          step={unit === "₹" ? 500 : unit === "%" ? 0.5 : 1}
          value={clamped}
          onChange={(e) => onChange(Number(e.target.value))}
          className="sip-range"
          style={trackStyle}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

/* ── main component ──────────────────────────────────────── */

const SIPCalculator = ({ onClose }) => {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [showTable, setShowTable] = useState(false);

  /* ── calculation ── */
  const { invested, returns, total, yearlyData } = useMemo(() => {
    const safeMonthly = clamp(monthly, 500, 200000);
    const safeRate = clamp(rate, 1, 30);
    const safeYears = clamp(years, 1, 40);

    const r = safeRate / 100 / 12;
    const n = safeYears * 12;
    const fv = r === 0
      ? safeMonthly * n
      : safeMonthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const inv = safeMonthly * n;

    // Build yearly table
    const table = [];
    for (let y = 1; y <= safeYears; y++) {
      const months = y * 12;
      const yearFV = r === 0
        ? safeMonthly * months
        : safeMonthly * (((Math.pow(1 + r, months) - 1) / r) * (1 + r));
      const yearInv = safeMonthly * months;
      table.push({
        year: y,
        invested: yearInv,
        value: yearFV,
        returns: yearFV - yearInv,
      });
    }

    return { invested: inv, returns: fv - inv, total: fv, yearlyData: table };
  }, [monthly, rate, years]);

  const investedPct = total > 0 ? (invested / total) * 100 : 50;
  const gainPct = invested > 0 ? ((returns / invested) * 100).toFixed(1) : 0;
  const safeYears = clamp(years, 1, 40);

  const reset = () => {
    setMonthly(5000);
    setRate(12);
    setYears(10);
    setShowTable(false);
  };

  /* ── render ── */
  return (
    <div className="max-w-4xl mx-auto">
      <style>{sliderStyle}</style>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SIP Calculator</h2>
          <p className="text-gray-600 text-sm mt-1">
            Estimate returns on your Systematic Investment Plan
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={reset}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </button>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Inputs ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-5">
            <TrendingUp className="w-5 h-5 text-indigo-500 mr-2" />
            Investment Details
          </h3>

          <div className="space-y-5">
            <InputRow
              icon={IndianRupee}
              label="Monthly Investment"
              value={monthly}
              onChange={setMonthly}
              min={500}
              max={200000}
              unit="₹"
              placeholder="5000"
            />
            <InputRow
              icon={Percent}
              label="Expected Annual Return"
              value={rate}
              onChange={setRate}
              min={1}
              max={30}
              unit="%"
              placeholder="12"
            />
            <InputRow
              icon={Calendar}
              label="Time Period"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              unit="yr"
              placeholder="10"
            />
          </div>

          {/* quick summary inside input card */}
          <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            {[
              { label: "Invested", value: fmtINR(invested), color: "text-indigo-600" },
              { label: "Returns", value: fmtINR(returns), color: "text-emerald-600" },
              { label: "Gain", value: `${gainPct}%`, color: "text-amber-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-lg py-2 px-1">
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-sm font-bold ${color} mt-0.5`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Results ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
          {/* total value */}
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5 text-center">
            <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-1">
              Total Maturity Value
            </p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700">{fmtINR(total)}</p>
            <p className="text-xs text-indigo-400 mt-1">{fmtFull(total)}</p>
          </div>

          {/* breakdown bar */}
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Portfolio Breakdown</p>
            <div className="flex rounded-full overflow-hidden h-5 mb-3">
              <div
                className="bg-indigo-500 transition-all duration-700 flex items-center justify-center"
                style={{ width: `${investedPct}%` }}
              >
                {investedPct > 20 && (
                  <span className="text-white text-xs font-semibold">
                    {investedPct.toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="bg-emerald-400 flex-1 flex items-center justify-center">
                {(100 - investedPct) > 15 && (
                  <span className="text-white text-xs font-semibold">
                    {(100 - investedPct).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 mr-1 align-middle" />
                <span className="text-gray-500 text-xs">Amount Invested</span>
                <p className="font-bold text-gray-800 mt-0.5">{fmtINR(invested)}</p>
              </div>
              <div className="text-right">
                <span className="inline-block w-3 h-3 rounded-full bg-emerald-400 mr-1 align-middle" />
                <span className="text-gray-500 text-xs">Est. Returns</span>
                <p className="font-bold text-emerald-600 mt-0.5">{fmtINR(returns)}</p>
              </div>
            </div>
          </div>

          {/* toggle yearly table */}
          <button
            onClick={() => setShowTable((p) => !p)}
            className="flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-1"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            {showTable ? "Hide" : "Show"} Year-wise Breakdown
          </button>

          {showTable && (
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-y-auto max-h-52">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {["Year", "Invested", "Value", "Returns"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyData.map((row) => (
                      <tr key={row.year} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-600">Yr {row.year}</td>
                        <td className="px-3 py-1.5 text-indigo-600 font-medium">{fmtINR(row.invested)}</td>
                        <td className="px-3 py-1.5 text-gray-900 font-semibold">{fmtINR(row.value)}</td>
                        <td className="px-3 py-1.5 text-emerald-600 font-medium">{fmtINR(row.returns)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary / Tip Banner ── */}
      <div className="mt-6 bg-linear-to-r from-indigo-50 to-emerald-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Maturity Value after {safeYears} years</p>
            <p className="text-3xl font-bold text-indigo-700">{fmtINR(total)}</p>
            <p className="text-sm text-gray-600 mt-1">
              {returns >= invested ? "🚀 Returns exceed principal!" : "📈 Growing steadily"}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Wealth Gain</p>
              <p className="text-2xl font-bold text-emerald-600">{gainPct}%</p>
            </div>
          </div>
        </div>

        {/* conditional tips – mirroring BudgetCalculator pattern */}
        {rate < 8 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>💡 Tip:</strong> A return rate below 8% is conservative. Equity mutual funds
              historically average 12–15% p.a. over the long term.
            </p>
          </div>
        )}

        {rate >= 8 && gainPct < 100 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800">
              Increase your SIP duration or monthly amount to double your invested capital in returns.
            </p>
          </div>
        )}

        {gainPct >= 100 && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>🎉 Excellent!</strong> Your estimated returns ({gainPct}%) are more than your
              total investment — the power of compounding at work!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SIPCalculator;