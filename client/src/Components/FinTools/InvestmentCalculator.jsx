
import React, { useState, useMemo } from "react";
import {
  TrendingUp, Calendar, Percent, RotateCcw,
  ChevronDown, ChevronUp, Info,
} from "lucide-react";

const fmt = (n, decimals = 0) =>
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const fmtCr = (n) => {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(2)} L`;
  return `₹${fmt(n)}`;
};

const PRESETS = [
  { label: "SIP — 12% / 10yr", monthly: 5000, initial: 0,       rate: 12, years: 10 },
  { label: "FD — 7% / 5yr",    monthly: 0,    initial: 100000,  rate: 7,  years: 5  },
  { label: "Equity — 15% / 20yr", monthly: 10000, initial: 50000, rate: 15, years: 20 },
];

const InvestmentCalculator = ({ onClose }) => {
  const [initialInvestment, setInitialInvestment]   = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualReturn, setAnnualReturn]               = useState("");
  const [years, setYears]                             = useState("");
  const [showTable, setShowTable]                     = useState(false);
  const [showTips, setShowTips]                       = useState(false);

  // ── Core calculations ─────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const P  = parseFloat(initialInvestment)   || 0;
    const m  = parseFloat(monthlyContribution) || 0;
    const r  = parseFloat(annualReturn)         || 0;
    const T  = parseInt(years)                  || 0;

    if (T === 0) return null;

    const monthlyRate = r / 100 / 12;
    const months      = T * 12;

    // Future value of lump sum
    const fvLump = P * Math.pow(1 + monthlyRate, months);

    // Future value of monthly SIP — guard for 0% rate
    const fvSIP  = monthlyRate === 0
      ? m * months
      : m * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    const futureValue        = fvLump + fvSIP;
    const totalContributions = P + m * months;
    const totalReturn        = futureValue - totalContributions;
    const roi = totalContributions > 0 ? (totalReturn / totalContributions) * 100 : 0;
    const cagr = totalContributions > 0
      ? (Math.pow(futureValue / totalContributions, 1 / T) - 1) * 100
      : 0;

    // Year-by-year table
    const yearlyData = Array.from({ length: T }, (_, i) => {
      const yr = i + 1;
      const mo = yr * 12;
      const fvL = P * Math.pow(1 + monthlyRate, mo);
      const fvS = monthlyRate === 0 ? m * mo : m * ((Math.pow(1 + monthlyRate, mo) - 1) / monthlyRate);
      const val = fvL + fvS;
      const inv = P + m * mo;
      return { year: yr, value: val, invested: inv, gain: val - inv };
    });

    return { futureValue, totalContributions, totalReturn, roi, cagr, yearlyData };
  }, [initialInvestment, monthlyContribution, annualReturn, years]);

  const applyPreset = (p) => {
    setInitialInvestment(p.initial || "");
    setMonthlyContribution(p.monthly || "");
    setAnnualReturn(p.rate);
    setYears(p.years);
  };

  const reset = () => {
    setInitialInvestment(""); setMonthlyContribution("");
    setAnnualReturn("");      setYears("");
  };

  const hasResult = calc !== null;
  const contribPct = hasResult && calc.futureValue > 0
    ? Math.round((calc.totalContributions / calc.futureValue) * 100)
    : 0;
  const returnPct  = 100 - contribPct;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-4 sm:px-5 sm:py-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4 sm:mb-5 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 leading-tight">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500 shrink-0" />
            Investment Growth Calculator
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            See how your investments grow with compound interest
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:scale-95"
          >
            <RotateCcw size={12} />
            <span className="hidden xs:inline">Reset</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Presets ── */}
      <div className="flex gap-2 flex-wrap mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="text-[11px] sm:text-xs px-2.5 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all font-medium active:scale-95"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* ── Inputs ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">Investment Details</h3>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Initial Investment */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Initial Investment (Lump Sum)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number" min="0" placeholder="e.g. 50000"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent text-xs sm:text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Monthly SIP */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Monthly SIP / Contribution
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number" min="0" placeholder="e.g. 5000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent text-xs sm:text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Annual Return */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Expected Annual Return
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number" min="0" max="100" step="0.1" placeholder="e.g. 12"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent text-xs sm:text-sm outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {[7, 10, 12, 15].map((r) => (
                  <button key={r} onClick={() => setAnnualReturn(String(r))}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all font-medium ${
                      annualReturn === String(r)
                        ? "bg-violet-500 text-white border-violet-500"
                        : "border-gray-200 text-gray-500 hover:border-violet-300"
                    }`}
                  >{r}%</button>
                ))}
                <span className="text-[10px] text-gray-400 self-center">Nifty 50 avg ~12%</span>
              </div>
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Time Period
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number" min="1" max="50" placeholder="e.g. 10"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent text-xs sm:text-sm outline-none transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">yrs</span>
              </div>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {[5, 10, 15, 20, 30].map((y) => (
                  <button key={y} onClick={() => setYears(String(y))}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all font-medium ${
                      years === String(y)
                        ? "bg-violet-500 text-white border-violet-500"
                        : "border-gray-200 text-gray-500 hover:border-violet-300"
                    }`}
                  >{y}yr</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="space-y-3 sm:space-y-4">

          {/* Future value hero */}
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs sm:text-sm text-gray-500 font-medium">Future Investment Value</span>
              <TrendingUp className="w-4 h-4 text-violet-500" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-violet-600 tabular-nums">
              {hasResult ? fmtCr(calc.futureValue) : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {hasResult ? `after ${years} year${years > 1 ? "s" : ""}` : "Enter values to calculate"}
            </p>
          </div>

          {/* Stat grid */}
          {hasResult && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { label: "Total Invested",  value: `₹${fmt(calc.totalContributions)}`, color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100"    },
                { label: "Total Returns",   value: `₹${fmt(calc.totalReturn)}`,        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                { label: "ROI",             value: `${calc.roi.toFixed(1)}%`,           color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100"  },
                { label: "Est. CAGR",       value: `${calc.cagr.toFixed(1)}%`,          color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"   },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-3`}>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{s.label}</p>
                  <p className={`text-base sm:text-lg font-bold ${s.color} tabular-nums mt-0.5`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Split bar */}
          {hasResult && calc.futureValue > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Growth Composition</h4>
              <div className="w-full h-4 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${contribPct}%` }} />
                <div className="h-full bg-violet-500 transition-all duration-700" style={{ width: `${returnPct}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                  Invested ({contribPct}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                  Returns ({returnPct}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Year-by-Year Table ── */}
      {hasResult && calc.yearlyData.length > 0 && (
        <div className="mt-4 sm:mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowTable((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>Year-by-Year Breakdown</span>
            {showTable ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showTable && (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] sm:text-xs">
                <thead>
                  <tr className="bg-gray-50 border-t border-gray-100">
                    {["Year", "Total Invested", "Portfolio Value", "Gain", "Growth"].map((h) => (
                      <th key={h} className="px-3 sm:px-4 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {calc.yearlyData.map((row) => (
                    <tr key={row.year} className="hover:bg-violet-50/40 transition-colors">
                      <td className="px-3 sm:px-4 py-2.5 font-medium text-gray-600">Yr {row.year}</td>
                      <td className="px-3 sm:px-4 py-2.5 tabular-nums text-gray-600">₹{fmt(row.invested)}</td>
                      <td className="px-3 sm:px-4 py-2.5 tabular-nums font-semibold text-violet-600">{fmtCr(row.value)}</td>
                      <td className="px-3 sm:px-4 py-2.5 tabular-nums text-emerald-600 font-medium">+₹{fmt(row.gain)}</td>
                      <td className="px-3 sm:px-4 py-2.5 tabular-nums text-gray-500">
                        {row.invested > 0 ? ((row.gain / row.invested) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tips ── */}
      <div className="mt-4 sm:mt-5 bg-violet-50 border border-violet-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowTips((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-semibold text-violet-800 hover:bg-violet-100/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info size={14} />
            📈 Investment Tips for Indian Investors
          </span>
          {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showTips && (
          <ul className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-1.5 text-xs sm:text-sm text-violet-900">
            {[
              "Start early — even ₹500/month SIP at 20 beats ₹5,000/month at 35",
              "Nifty 50 index funds have historically returned ~12% CAGR",
              "ELSS mutual funds save tax under Section 80C (up to ₹1.5L/yr)",
              "Diversify: 60% equity, 30% debt, 10% gold is a common thumb rule",
              "Never withdraw SIP during market dips — stay invested long-term",
              "Review your portfolio once a year, not every week",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-3">
        Calculations assume fixed annual return compounded monthly. Actual returns may vary. Consult a SEBI-registered advisor.
      </p>
    </div>
  );
};

export default InvestmentCalculator;