import { useState, useMemo } from "react";

/* ── helpers ─────────────────────────────────────────────── */
const clamp = (v, min, max) => Math.min(Math.max(Number(v) || 0, min), max);

const fmtINR = (v) => {
  if (!isFinite(v) || isNaN(v)) return "₹0";
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)} K`;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
};

const fmtFull = (v) =>
  isFinite(v) && !isNaN(v)
    ? "₹" + Math.round(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "₹0.00";

const PRESETS = [
  { label: "🌱 Starter", monthly: 1000, rate: 12, years: 5 },
  { label: "📈 Steady", monthly: 5000, rate: 13, years: 15 },
  { label: "🚀 Aggressive", monthly: 25000, rate: 15, years: 20 },
  { label: "🏆 Wealth", monthly: 50000, rate: 14, years: 30 },
];

/* ── main component ──────────────────────────────────────── */
export default function SIPCalculator({ onClose }) {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate]       = useState(12);
  const [years, setYears]     = useState(10);
  const [showTable, setShowTable] = useState(false);

  const safeMonthly = clamp(monthly, 500, 500000);
  const safeRate    = clamp(rate, 0.1, 50);
  const safeYears   = clamp(years, 1, 40);

  const { invested, returns, total, yearlyData } = useMemo(() => {
    const r = safeRate / 100 / 12;
    const n = safeYears * 12;
    const fv = r === 0
      ? safeMonthly * n
      : safeMonthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const inv = safeMonthly * n;
    const table = [];
    for (let y = 1; y <= safeYears; y++) {
      const m = y * 12;
      const yFV = r === 0
        ? safeMonthly * m
        : safeMonthly * (((Math.pow(1 + r, m) - 1) / r) * (1 + r));
      table.push({ year: y, invested: safeMonthly * m, value: yFV, returns: yFV - safeMonthly * m });
    }
    return { invested: inv, returns: fv - inv, total: fv, yearlyData: table };
  }, [safeMonthly, safeRate, safeYears]);

  const investedPct = total > 0 ? (invested / total) * 100 : 50;
  const returnsPct  = 100 - investedPct;
  const gainPct     = invested > 0 ? ((returns / invested) * 100).toFixed(1) : "0.0";

  const reset = () => { setMonthly(5000); setRate(12); setYears(10); setShowTable(false); };

  /* slider fill helper */
  const sliderBg = (val, min, max) => {
    const pct = ((clamp(val, min, max) - min) / (max - min)) * 100;
    return `linear-gradient(to right, #4f46e5 ${pct}%, #ddd6fe ${pct}%)`;
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#f3f2ff] p-4 sm:p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        .sip-card { background: #fff; border-radius: 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }

        .sip-input {
          width: 100%; padding: 11px 14px 11px 44px;
          border: 1.5px solid #ddd6fe; border-radius: 12px;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          background: #f3f2ff; color: #1e1b4b;
          transition: border-color .2s, box-shadow .2s; outline: none;
        }
        .sip-input.no-prefix { padding-left: 14px; padding-right: 44px; }
        .sip-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.15); background: #fff; }
        .sip-input::placeholder { color: #a5b4fc; }
        .sip-input::-webkit-outer-spin-button,
        .sip-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .sip-input[type=number] { -moz-appearance: textfield; }

        .sip-range {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 6px; border-radius: 9999px;
          outline: none; cursor: pointer;
        }
        .sip-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: #4f46e5; border: 2px solid #fff;
          box-shadow: 0 0 0 2px #4f46e5; cursor: pointer;
          transition: box-shadow .15s;
        }
        .sip-range::-webkit-slider-thumb:hover { box-shadow: 0 0 0 5px rgba(79,70,229,.25); }
        .sip-range::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #4f46e5; border: 2px solid #fff;
          box-shadow: 0 0 0 2px #4f46e5; cursor: pointer;
        }

        .sip-pill {
          padding: 7px 13px; border-radius: 99px; font-size: 12.5px;
          font-weight: 500; border: 1.5px solid #ddd6fe;
          background: #f3f2ff; color: #3730a3; cursor: pointer;
          transition: background .15s, border-color .15s, color .15s;
        }
        .sip-pill:hover { background: #4f46e5; border-color: #4f46e5; color: #fff; }

        .result-glow { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 20px; }

        .bar-track { height: 10px; border-radius: 99px; background: #ddd6fe; overflow: hidden; }
        .bar-indigo { background: linear-gradient(90deg, #4f46e5, #818cf8); height: 100%; border-radius: 99px; transition: width .6s ease; }
        .bar-emerald { background: linear-gradient(90deg, #059669, #34d399); height: 100%; border-radius: 99px; transition: width .6s ease; }

        .tbl-row:nth-child(even) { background: #f3f2ff; }
        .tbl-row { border-radius: 8px; }

        @media (max-width: 640px) { .sip-grid-2 { grid-template-columns: 1fr; } }
        @media (min-width: 641px) { .sip-grid-2 { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#1e1b4b" }}
              className="text-3xl sm:text-4xl font-bold leading-tight">
              SIP Calculator
            </h1>
            <p className="text-sm text-[#6d6aaa] mt-1">Systematic Investment Plan · Compound Growth Estimator</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset}
              className="self-start sm:self-auto px-5 py-2 rounded-full text-sm font-medium border-2 border-[#ddd6fe] text-[#3730a3] hover:bg-[#4f46e5] hover:text-white hover:border-[#4f46e5] transition-all">
              Reset
            </button>
            {onClose && (
              <button onClick={onClose}
                className="self-start sm:self-auto px-5 py-2 rounded-full text-sm font-medium border-2 border-[#ddd6fe] text-[#3730a3] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-5">

          {/* Top row */}
          <div className="grid gap-5 sip-grid-2">

            {/* Input card */}
            <div className="sip-card p-6">
              <h2 className="text-base font-semibold text-[#1e1b4b] mb-5">Investment Details</h2>
              <div className="space-y-5">

                {/* Monthly SIP */}
                <div>
                  <label className="block text-sm font-medium text-[#3730a3] mb-1.5">Monthly Investment</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d6aaa] font-semibold text-base select-none">₹</span>
                    <input type="number" value={monthly} min={500} max={500000}
                      onChange={e => setMonthly(e.target.value)}
                      onBlur={e => setMonthly(clamp(e.target.value, 500, 500000))}
                      className="sip-input" placeholder="5000" />
                  </div>
                  <div className="mt-2">
                    <input type="range" min={500} max={200000} step={500}
                      value={clamp(monthly, 500, 200000)}
                      onChange={e => setMonthly(Number(e.target.value))}
                      className="sip-range" style={{ background: sliderBg(monthly, 500, 200000) }} />
                    <div className="flex justify-between text-xs text-[#a5b4fc] mt-0.5">
                      <span>₹500</span><span>₹2 L</span>
                    </div>
                  </div>
                </div>

                {/* Annual Return */}
                <div>
                  <label className="block text-sm font-medium text-[#3730a3] mb-1.5">Expected Annual Return</label>
                  <div className="relative">
                    <input type="number" value={rate} min={0.1} max={50} step={0.5}
                      onChange={e => setRate(e.target.value)}
                      onBlur={e => setRate(clamp(e.target.value, 0.1, 50))}
                      className="sip-input no-prefix" placeholder="12" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6d6aaa] font-semibold text-sm select-none">%</span>
                  </div>
                  <div className="mt-2">
                    <input type="range" min={1} max={30} step={0.5}
                      value={clamp(rate, 1, 30)}
                      onChange={e => setRate(Number(e.target.value))}
                      className="sip-range" style={{ background: sliderBg(rate, 1, 30) }} />
                    <div className="flex justify-between text-xs text-[#a5b4fc] mt-0.5">
                      <span>1%</span><span>30%</span>
                    </div>
                  </div>
                </div>

                {/* Time Period */}
                <div>
                  <label className="block text-sm font-medium text-[#3730a3] mb-1.5">Investment Period</label>
                  <div className="relative">
                    <input type="number" value={years} min={1} max={40}
                      onChange={e => setYears(e.target.value)}
                      onBlur={e => setYears(clamp(e.target.value, 1, 40))}
                      className="sip-input no-prefix" placeholder="10" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6d6aaa] font-semibold text-xs select-none">YR</span>
                  </div>
                  <div className="mt-2">
                    <input type="range" min={1} max={40} step={1}
                      value={clamp(years, 1, 40)}
                      onChange={e => setYears(Number(e.target.value))}
                      className="sip-range" style={{ background: sliderBg(years, 1, 40) }} />
                    <div className="flex justify-between text-xs text-[#a5b4fc] mt-0.5">
                      <span>1 yr</span><span>40 yr</span>
                    </div>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="pt-3 border-t border-[#ddd6fe]">
                  <p className="text-xs text-[#6d6aaa] mb-2">Quick presets</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                      <button key={p.label} className="sip-pill"
                        onClick={() => { setMonthly(p.monthly); setRate(p.rate); setYears(p.years); }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results column */}
            <div className="flex flex-col gap-5">

              {/* Maturity highlight */}
              <div className="result-glow p-6 text-white">
                <p className="text-sm font-medium opacity-80 mb-1">Total Maturity Value</p>
                <p className="text-4xl sm:text-5xl font-bold tracking-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {fmtINR(total)}
                </p>
                <p className="text-xs opacity-60 mt-1">{fmtFull(total)}</p>
                <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs opacity-70">Invested</p>
                    <p className="text-sm font-semibold mt-0.5">{fmtINR(invested)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Returns</p>
                    <p className="text-sm font-semibold mt-0.5 text-emerald-300">{fmtINR(returns)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Gain</p>
                    <p className="text-sm font-semibold mt-0.5 text-yellow-300">{gainPct}%</p>
                  </div>
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="sip-card p-6 flex-1">
                <h3 className="text-sm font-semibold text-[#1e1b4b] mb-4">Portfolio Breakdown</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#3730a3] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                        Amount Invested
                      </span>
                      <span className="font-semibold text-[#1e1b4b]">{investedPct.toFixed(1)}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-indigo" style={{ width: `${investedPct}%` }} />
                    </div>
                    <p className="text-xs text-[#6d6aaa] mt-1">{fmtFull(invested)}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#3730a3] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        Estimated Returns
                      </span>
                      <span className="font-semibold text-[#1e1b4b]">{returnsPct.toFixed(1)}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-emerald" style={{ width: `${returnsPct}%` }} />
                    </div>
                    <p className="text-xs text-[#6d6aaa] mt-1">{fmtFull(returns)}</p>
                  </div>
                </div>

                {/* Summary metrics */}
                <div className="mt-5 pt-4 border-t border-[#ddd6fe] space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6d6aaa]">Annual Return Rate</span>
                    <span className="font-medium text-[#1e1b4b]">{safeRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6d6aaa]">Total Payments</span>
                    <span className="font-medium text-[#1e1b4b]">{safeYears * 12} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6d6aaa]">Wealth Multiplier</span>
                    <span className="font-medium text-emerald-600">
                      {invested > 0 ? (total / invested).toFixed(2) : "0.00"}×
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Year-wise table */}
          <div className="sip-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1e1b4b]">
                Year-wise Growth
                <span className="ml-2 text-xs font-normal text-[#6d6aaa]">({safeYears} years)</span>
              </h3>
              <button onClick={() => setShowTable(p => !p)}
                className="text-xs font-medium text-[#4f46e5] hover:text-[#3730a3] border border-[#ddd6fe] px-3 py-1 rounded-full transition-colors">
                {showTable ? "Collapse ↑" : "Expand ↓"}
              </button>
            </div>

            {showTable ? (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-xs text-[#6d6aaa] border-b border-[#ddd6fe]">
                      <th className="text-left pb-2 pr-4 font-medium">Year</th>
                      <th className="text-right pb-2 pr-4 font-medium">Amount Invested</th>
                      <th className="text-right pb-2 pr-4 font-medium">Est. Returns</th>
                      <th className="text-right pb-2 font-medium">Portfolio Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyData.map(row => (
                      <tr key={row.year} className="tbl-row">
                        <td className="py-2 pr-4 font-medium text-[#1e1b4b]">Year {row.year}</td>
                        <td className="py-2 pr-4 text-right text-indigo-600 font-medium">{fmtINR(row.invested)}</td>
                        <td className="py-2 pr-4 text-right text-emerald-600 font-medium">{fmtINR(row.returns)}</td>
                        <td className="py-2 text-right text-[#1e1b4b] font-semibold">{fmtINR(row.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Mini sparkline preview — last 5 years condensed */
              <div className="grid grid-cols-5 gap-2">
                {yearlyData.slice(-5).map(row => {
                  const ht = Math.round((row.value / total) * 80);
                  return (
                    <div key={row.year} className="flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: 60 }}>
                        <div className="w-full rounded-t-md bg-indigo-100 relative" style={{ height: ht }}>
                          <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-400"
                            style={{ height: `${Math.round((row.returns / row.value) * 100)}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-[#6d6aaa]">Yr {row.year}</span>
                      <span className="text-xs font-semibold text-[#1e1b4b]">{fmtINR(row.value)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Smart insight banner */}
          <div className="sip-card p-5 border-l-4 border-[#4f46e5]">
            <h4 className="text-sm font-semibold text-[#1e1b4b] mb-2">
              {Number(gainPct) >= 200 ? "🚀 Exceptional Growth!" : Number(gainPct) >= 100 ? "🎉 Returns Exceed Principal!" : "📈 Growing Steadily"}
            </h4>
            <div className="grid gap-1.5">
              {[
                safeRate < 8
                  ? "Your return rate is conservative. Equity mutual funds historically average 12–15% p.a. over the long term."
                  : `At ${safeRate}% p.a., your money is working hard — this matches or beats long-term Nifty 50 averages.`,
                `Investing ₹${Number(safeMonthly).toLocaleString("en-IN")} monthly for ${safeYears} years totals ${fmtINR(invested)} invested — your corpus grows to ${fmtINR(total)}.`,
                "Increase SIP amount by just 10% each year (step-up SIP) to dramatically outpace a fixed SIP.",
                "Start early — a 25-year-old investing ₹5,000/month at 12% for 35 years accumulates ₹3.24 Cr. Starting at 35 gives only ₹94 L.",
              ].map((tip, i) => (
                <p key={i} className="text-xs text-[#3730a3] flex gap-2">
                  <span className="text-[#4f46e5] font-bold shrink-0">→</span>{tip}
                </p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}