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
  { label: "🛒 Groceries", amount: 15000, inflation: 7, years: 10 },
  { label: "🏠 Rent", amount: 25000, inflation: 8, years: 15 },
  { label: "🎓 Education", amount: 200000, inflation: 10, years: 18 },
  { label: "🏥 Healthcare", amount: 100000, inflation: 12, years: 20 },
];

export default function InflationCalculator({ onClose }) {
  const [amount,    setAmount]    = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [years,     setYears]     = useState(10);
  const [showTable, setShowTable] = useState(false);

  const sa = clamp(amount,    1000, 1000000);
  const si = clamp(inflation, 0.1,  30);
  const sy = clamp(years,     1,    40);

  const { futureNeeded, realValue, purchasingLoss, lossPct, realPct, yearlyData } = useMemo(() => {
    const futureNeeded   = sa * Math.pow(1 + si / 100, sy);
    const realValue      = sa / Math.pow(1 + si / 100, sy);
    const purchasingLoss = sa - realValue;
    const lossPct        = ((purchasingLoss / sa) * 100);
    const realPct        = 100 - lossPct;
    const yearlyData     = Array.from({ length: sy }, (_, i) => {
      const y = i + 1;
      const fv  = sa * Math.pow(1 + si / 100, y);
      const rv  = sa / Math.pow(1 + si / 100, y);
      return { year: y, futureNeeded: fv, realValue: rv, erosionPct: (((sa - rv) / sa) * 100).toFixed(1) };
    });
    return { futureNeeded, realValue, purchasingLoss, lossPct, realPct, yearlyData };
  }, [sa, si, sy]);

  const doublingYears = si > 0 ? (72 / si).toFixed(1) : "∞";

  const sliderBg = (val, min, max) => {
    const pct = ((clamp(val, min, max) - min) / (max - min)) * 100;
    return `linear-gradient(to right, #dc2626 ${pct}%, #fecaca ${pct}%)`;
  };

  const reset = () => { setAmount(50000); setInflation(6); setYears(10); setShowTable(false); };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#fff7f5] p-4 sm:p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        .inf-card { background: #fff; border-radius: 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }

        .inf-input {
          width: 100%; padding: 11px 14px 11px 44px;
          border: 1.5px solid #fecaca; border-radius: 12px;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          background: #fff7f5; color: #450a0a;
          transition: border-color .2s, box-shadow .2s; outline: none;
        }
        .inf-input.no-prefix { padding-left: 14px; padding-right: 44px; }
        .inf-input:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,.12); background: #fff; }
        .inf-input::placeholder { color: #fca5a5; }
        .inf-input::-webkit-outer-spin-button,
        .inf-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .inf-input[type=number] { -moz-appearance: textfield; }

        .inf-range {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 6px; border-radius: 9999px;
          outline: none; cursor: pointer;
        }
        .inf-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: #dc2626; border: 2px solid #fff;
          box-shadow: 0 0 0 2px #dc2626; cursor: pointer;
          transition: box-shadow .15s;
        }
        .inf-range::-webkit-slider-thumb:hover { box-shadow: 0 0 0 5px rgba(220,38,38,.2); }
        .inf-range::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #dc2626; border: 2px solid #fff; cursor: pointer;
        }

        .inf-pill {
          padding: 7px 13px; border-radius: 99px; font-size: 12.5px;
          font-weight: 500; border: 1.5px solid #fecaca;
          background: #fff7f5; color: #7f1d1d; cursor: pointer;
          transition: background .15s, border-color .15s, color .15s;
        }
        .inf-pill:hover { background: #dc2626; border-color: #dc2626; color: #fff; }

        .result-glow { background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%); border-radius: 20px; }

        .bar-track { height: 10px; border-radius: 99px; background: #fecaca; overflow: hidden; }
        .bar-green  { background: linear-gradient(90deg, #059669, #34d399); height: 100%; border-radius: 99px; transition: width .6s ease; }
        .bar-red    { background: linear-gradient(90deg, #dc2626, #f87171); height: 100%; border-radius: 99px; transition: width .6s ease; }

        .tbl-row:nth-child(even) { background: #fff7f5; }

        @media (max-width: 640px) { .inf-grid-2 { grid-template-columns: 1fr; } }
        @media (min-width: 641px) { .inf-grid-2 { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#450a0a" }}
              className="text-3xl sm:text-4xl font-bold leading-tight">
              Inflation Calculator
            </h1>
            <p className="text-sm text-[#b45309] mt-1">See how inflation silently erodes your purchasing power</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset}
              className="self-start sm:self-auto px-5 py-2 rounded-full text-sm font-medium border-2 border-[#fecaca] text-[#7f1d1d] hover:bg-[#dc2626] hover:text-white hover:border-[#dc2626] transition-all">
              Reset
            </button>
            {onClose && (
              <button onClick={onClose}
                className="self-start sm:self-auto px-5 py-2 rounded-full text-sm font-medium border-2 border-[#fecaca] text-[#7f1d1d] hover:bg-red-700 hover:text-white hover:border-red-700 transition-all">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-5">

          {/* Top row */}
          <div className="grid gap-5 inf-grid-2">

            {/* Input card */}
            <div className="inf-card p-6">
              <h2 className="text-base font-semibold text-[#450a0a] mb-5">Inflation Details</h2>
              <div className="space-y-5">

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-[#7f1d1d] mb-1.5">Current Amount / Monthly Expense</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#fca5a5] font-semibold text-base select-none">₹</span>
                    <input type="number" value={amount} min={1000} max={1000000}
                      onChange={e => setAmount(e.target.value)}
                      onBlur={e => setAmount(clamp(e.target.value, 1000, 1000000))}
                      className="inf-input" placeholder="50000" />
                  </div>
                  <div className="mt-2">
                    <input type="range" min={1000} max={500000} step={1000}
                      value={clamp(amount, 1000, 500000)}
                      onChange={e => setAmount(Number(e.target.value))}
                      className="inf-range" style={{ background: sliderBg(amount, 1000, 500000) }} />
                    <div className="flex justify-between text-xs text-[#fca5a5] mt-0.5"><span>₹1K</span><span>₹5 L</span></div>
                  </div>
                </div>

                {/* Inflation Rate */}
                <div>
                  <label className="block text-sm font-medium text-[#7f1d1d] mb-1.5">Inflation Rate</label>
                  <div className="relative">
                    <input type="number" value={inflation} min={0.1} max={30} step={0.5}
                      onChange={e => setInflation(e.target.value)}
                      onBlur={e => setInflation(clamp(e.target.value, 0.1, 30))}
                      className="inf-input no-prefix" placeholder="6" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#fca5a5] font-semibold text-sm select-none">%</span>
                  </div>
                  <div className="mt-2">
                    <input type="range" min={0.5} max={20} step={0.5}
                      value={clamp(inflation, 0.5, 20)}
                      onChange={e => setInflation(Number(e.target.value))}
                      className="inf-range" style={{ background: sliderBg(inflation, 0.5, 20) }} />
                    <div className="flex justify-between text-xs text-[#fca5a5] mt-0.5"><span>0.5%</span><span>20%</span></div>
                  </div>
                  <p className="text-xs text-[#b45309] mt-1">Prices double every {doublingYears} years at this rate (Rule of 72)</p>
                </div>

                {/* Time Period */}
                <div>
                  <label className="block text-sm font-medium text-[#7f1d1d] mb-1.5">Time Period</label>
                  <div className="relative">
                    <input type="number" value={years} min={1} max={40}
                      onChange={e => setYears(e.target.value)}
                      onBlur={e => setYears(clamp(e.target.value, 1, 40))}
                      className="inf-input no-prefix" placeholder="10" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#fca5a5] font-semibold text-xs select-none">YR</span>
                  </div>
                  <div className="mt-2">
                    <input type="range" min={1} max={40} step={1}
                      value={clamp(years, 1, 40)}
                      onChange={e => setYears(Number(e.target.value))}
                      className="inf-range" style={{ background: sliderBg(years, 1, 40) }} />
                    <div className="flex justify-between text-xs text-[#fca5a5] mt-0.5"><span>1 yr</span><span>40 yr</span></div>
                  </div>
                </div>

                {/* Presets */}
                <div className="pt-3 border-t border-[#fecaca]">
                  <p className="text-xs text-[#b45309] mb-2">Quick presets</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                      <button key={p.label} className="inf-pill"
                        onClick={() => { setAmount(p.amount); setInflation(p.inflation); setYears(p.years); }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results column */}
            <div className="flex flex-col gap-5">

              {/* Future needed highlight */}
              <div className="result-glow p-6 text-white">
                <p className="text-sm font-medium opacity-80 mb-1">
                  To buy what costs {fmtINR(sa)} today, you'll need
                </p>
                <p className="text-4xl sm:text-5xl font-bold tracking-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {fmtINR(futureNeeded)}
                </p>
                <p className="text-xs opacity-60 mt-1">{fmtFull(futureNeeded)} — in {sy} yrs at {si}% inflation</p>
                <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs opacity-70">Today's Value</p>
                    <p className="text-sm font-semibold mt-0.5">{fmtINR(sa)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Real Value</p>
                    <p className="text-sm font-semibold mt-0.5 text-emerald-300">{fmtINR(realValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Value Lost</p>
                    <p className="text-sm font-semibold mt-0.5 text-red-300">{lossPct.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="inf-card p-6 flex-1">
                <h3 className="text-sm font-semibold text-[#450a0a] mb-4">Purchasing Power Breakdown</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#7f1d1d] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        Real Value Remaining
                      </span>
                      <span className="font-semibold text-[#450a0a]">{realPct.toFixed(1)}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-green" style={{ width: `${realPct}%` }} />
                    </div>
                    <p className="text-xs text-[#b45309] mt-1">{fmtFull(realValue)}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#7f1d1d] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                        Purchasing Power Lost
                      </span>
                      <span className="font-semibold text-[#450a0a]">{lossPct.toFixed(1)}%</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-red" style={{ width: `${lossPct}%` }} />
                    </div>
                    <p className="text-xs text-[#b45309] mt-1">{fmtFull(purchasingLoss)}</p>
                  </div>
                </div>

                {/* Summary metrics */}
                <div className="mt-5 pt-4 border-t border-[#fecaca] space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#b45309]">Inflation Rate</span>
                    <span className="font-medium text-[#450a0a]">{si}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b45309]">Price Doubling Time</span>
                    <span className="font-medium text-[#450a0a]">{doublingYears} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#b45309]">Extra Needed</span>
                    <span className="font-medium text-red-600">{fmtINR(futureNeeded - sa)} more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Year-wise timeline */}
          <div className="inf-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#450a0a]">
                Year-wise Inflation Timeline
                <span className="ml-2 text-xs font-normal text-[#b45309]">({sy} years)</span>
              </h3>
              <button onClick={() => setShowTable(p => !p)}
                className="text-xs font-medium text-[#dc2626] hover:text-[#b91c1c] border border-[#fecaca] px-3 py-1 rounded-full transition-colors">
                {showTable ? "Collapse ↑" : "Expand ↓"}
              </button>
            </div>

            {showTable ? (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-xs text-[#b45309] border-b border-[#fecaca]">
                      <th className="text-left pb-2 pr-4 font-medium">Year</th>
                      <th className="text-right pb-2 pr-4 font-medium">Future Cost</th>
                      <th className="text-right pb-2 pr-4 font-medium">Real Value</th>
                      <th className="text-right pb-2 font-medium">Erosion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyData.map(row => (
                      <tr key={row.year} className="tbl-row">
                        <td className="py-2 pr-4 font-medium text-[#450a0a]">Year {row.year}</td>
                        <td className="py-2 pr-4 text-right text-orange-600 font-medium">{fmtINR(row.futureNeeded)}</td>
                        <td className="py-2 pr-4 text-right text-emerald-600 font-medium">{fmtINR(row.realValue)}</td>
                        <td className="py-2 text-right text-red-600 font-semibold">{row.erosionPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Collapsed: mini bar preview — last 5 years */
              <div className="grid grid-cols-5 gap-2">
                {yearlyData.slice(-5).map(row => {
                  const erosion = parseFloat(row.erosionPct);
                  return (
                    <div key={row.year} className="flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: 60 }}>
                        <div className="w-full rounded-t-md bg-red-100 relative" style={{ height: Math.max(8, Math.round((erosion / 100) * 80)) }}>
                          <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-red-600 to-orange-400"
                            style={{ height: "100%" }} />
                        </div>
                      </div>
                      <span className="text-xs text-[#b45309]">Yr {row.year}</span>
                      <span className="text-xs font-semibold text-red-600">{row.erosionPct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tips strip */}
          <div className="inf-card p-5 border-l-4 border-[#dc2626]">
            <h4 className="text-sm font-semibold text-[#450a0a] mb-2">
              {lossPct >= 50 ? "🔥 More than half your value is gone!" : lossPct >= 30 ? "⚠️ Significant erosion — act now" : "📉 Gradual but real erosion"}
            </h4>
            <div className="grid gap-1.5">
              {[
                `At ${si}% inflation, prices double every ${doublingYears} years — idle cash in a savings account loses ground fast.`,
                `Equity mutual funds have historically returned 12–15% p.a. — well above India's average ${si > 6 ? si : 6}% inflation.`,
                "Even RBI's 4% target erodes ₹1 L to ₹67K in real terms over 10 years — stay invested.",
                `To protect ${fmtINR(sa)}, invest in assets returning more than ${si}% p.a.: PPF (7.1%), ELSS, or index funds.`,
              ].map((tip, i) => (
                <p key={i} className="text-xs text-[#7f1d1d] flex gap-2">
                  <span className="text-[#dc2626] font-bold shrink-0">→</span>{tip}
                </p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}