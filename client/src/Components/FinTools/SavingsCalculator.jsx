import { useState, useMemo } from "react";

const fmt = (n) =>
  isFinite(n) && !isNaN(n)
    ? "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "₹0.00";

const pct = (n) => (isFinite(n) && !isNaN(n) ? n.toFixed(1) + "%" : "0.0%");

const EXAMPLES = [
  { label: "✈️ Vacation", goal: "200000", current: "20000", months: "18", rate: "6.5" },
  { label: "🏠 Down Payment", goal: "1500000", current: "200000", months: "60", rate: "7.0" },
  { label: "🎓 Education", goal: "500000", current: "50000", months: "36", rate: "6.8" },
  { label: "🚗 Car Purchase", goal: "800000", current: "100000", months: "24", rate: "6.5" },
];

export default function SavingsCalculator({ onClose }) {
  const [goalAmount, setGoalAmount] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [interestRate, setInterestRate] = useState("");

  const goal = Math.max(0, parseFloat(goalAmount) || 0);
  const current = Math.max(0, parseFloat(currentSavings) || 0);
  const months = Math.max(0, parseInt(timeframe) || 0);
  const annualRate = Math.max(0, parseFloat(interestRate) || 0);

  const { monthly, totalContributions, interestEarned, progressPct, futureCurrent } = useMemo(() => {
    if (goal <= 0 || months <= 0) {
      return { monthly: 0, totalContributions: 0, interestEarned: 0, progressPct: 0, futureCurrent: current };
    }

    const r = annualRate / 100 / 12;
    // Future value of current savings
    const futureCurrent = r === 0 ? current : current * Math.pow(1 + r, months);
    const remaining = goal - futureCurrent;

    let monthly;
    if (remaining <= 0) {
      // Current savings + interest already covers the goal
      monthly = 0;
    } else if (r === 0) {
      monthly = remaining / months;
    } else {
      // PMT formula: FV = PMT * [(1+r)^n - 1] / r
      monthly = (remaining * r) / (Math.pow(1 + r, months) - 1);
    }

    const totalContributions = monthly * months;
    // Interest earned = goal - current principal - new contributions
    const interestEarned = goal - current - totalContributions;

    // How far current savings gets you toward goal (%)
    const progressPct = Math.min(100, (futureCurrent / goal) * 100);

    return { monthly, totalContributions, interestEarned, progressPct, futureCurrent };
  }, [goal, current, months, annualRate]);

  const hasResult = goal > 0 && months > 0;
  const alreadyReached = hasResult && futureCurrent >= goal;

  const reset = () => {
    setGoalAmount("");
    setCurrentSavings("");
    setTimeframe("");
    setInterestRate("");
  };

  // Build yearly growth table
  const growthRows = useMemo(() => {
    if (!hasResult || alreadyReached) return [];
    const r = annualRate / 100 / 12;
    const rows = [];
    let balance = current;
    const displayYears = Math.min(Math.ceil(months / 12), 10);
    for (let y = 1; y <= displayYears; y++) {
      const monthsInYear = Math.min(12, months - (y - 1) * 12);
      const opening = balance;
      let intYear = 0;
      for (let m = 0; m < monthsInYear; m++) {
        const intM = balance * r;
        intYear += intM;
        balance += intM + monthly;
      }
      rows.push({
        year: y,
        opening,
        contributed: monthly * monthsInYear,
        interest: intYear,
        closing: Math.min(balance, goal),
      });
      if (balance >= goal) break;
    }
    return rows;
  }, [hasResult, alreadyReached, current, months, annualRate, monthly, goal]);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#f2f7f4] p-4 sm:p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        .sc-card { background: #fff; border-radius: 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }
        .sc-input {
          width: 100%; padding: 12px 14px 12px 44px;
          border: 1.5px solid #d5e8db; border-radius: 12px;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          background: #f2f7f4; color: #0f2418;
          transition: border-color .2s, box-shadow .2s;
          outline: none;
        }
        .sc-input:focus { border-color: #1a7a42; box-shadow: 0 0 0 3px rgba(26,122,66,.12); background: #fff; }
        .sc-input::placeholder { color: #93b8a0; }
        .sc-input::-webkit-outer-spin-button,
        .sc-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .sc-input[type=number] { -moz-appearance: textfield; }

        .sc-pill {
          padding: 7px 13px; border-radius: 99px; font-size: 12.5px;
          font-weight: 500; border: 1.5px solid #d5e8db;
          background: #f2f7f4; color: #2d5c3e; cursor: pointer;
          transition: background .15s, border-color .15s, color .15s;
        }
        .sc-pill:hover { background: #1a7a42; border-color: #1a7a42; color: #fff; }

        .bar-track { height: 8px; border-radius: 99px; background: #d5e8db; overflow: hidden; }
        .bar-fill-green { background: linear-gradient(90deg, #1a7a42, #34d36a); height: 100%; border-radius: 99px; transition: width .5s ease; }
        .bar-fill-teal { background: linear-gradient(90deg, #0d9488, #2dd4bf); height: 100%; border-radius: 99px; transition: width .5s ease; }
        .bar-fill-gray  { background: linear-gradient(90deg, #94a3b8, #cbd5e1); height: 100%; border-radius: 99px; transition: width .5s ease; }

        .result-glow { background: linear-gradient(135deg, #1a7a42 0%, #25a85b 100%); border-radius: 20px; }

        .sc-amort-row:nth-child(even) { background: #f2f7f4; }
        .sc-amort-row { border-radius: 8px; }

        @media (max-width: 640px) {
          .sc-grid-2 { grid-template-columns: 1fr; }
        }
        @media (min-width: 641px) {
          .sc-grid-2 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#0f2418" }}
              className="text-3xl sm:text-4xl font-bold leading-tight">
              Savings Goal Calculator
            </h1>
            <p className="text-sm text-[#5a8a6e] mt-1">Plan your monthly savings to reach any financial goal</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset}
              className="self-start sm:self-auto px-5 py-2 rounded-full text-sm font-medium border-2 border-[#d5e8db] text-[#2d5c3e] hover:bg-[#1a7a42] hover:text-white hover:border-[#1a7a42] transition-all">
              Reset
            </button>
            {onClose && (
              <button onClick={onClose}
                className="self-start sm:self-auto px-5 py-2 rounded-full text-sm font-medium border-2 border-[#d5e8db] text-[#2d5c3e] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr" }}>

          {/* Top row */}
          <div className="grid gap-5 sc-grid-2">

            {/* Input card */}
            <div className="sc-card p-6">
              <h2 className="text-base font-semibold text-[#0f2418] mb-5">Goal Details</h2>
              <div className="space-y-4">

                {/* Goal Amount */}
                <div>
                  <label className="block text-sm font-medium text-[#2d5c3e] mb-1.5">Savings Goal Amount</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a8a6e] font-semibold text-base select-none">₹</span>
                    <input type="number" placeholder="5,00,000" value={goalAmount}
                      onChange={e => setGoalAmount(e.target.value)} className="sc-input" min="0" />
                  </div>
                  {goalAmount && goal <= 0 && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid positive goal amount</p>
                  )}
                </div>

                {/* Current Savings */}
                <div>
                  <label className="block text-sm font-medium text-[#2d5c3e] mb-1.5">Current Savings</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a8a6e] font-semibold text-base select-none">₹</span>
                    <input type="number" placeholder="0" value={currentSavings}
                      onChange={e => setCurrentSavings(e.target.value)} className="sc-input" min="0" />
                  </div>
                  {current > goal && goal > 0 && (
                    <p className="text-xs text-amber-600 mt-1">Current savings already exceed the goal!</p>
                  )}
                </div>

                {/* Timeframe */}
                <div>
                  <label className="block text-sm font-medium text-[#2d5c3e] mb-1.5">Timeframe (months)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a8a6e] text-xs font-semibold select-none">MO</span>
                    <input type="number" placeholder="24" value={timeframe}
                      onChange={e => setTimeframe(e.target.value)} className="sc-input" min="1" />
                  </div>
                  {timeframe && months <= 0 && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid timeframe (≥1 month)</p>
                  )}
                  {months > 0 && (
                    <p className="text-xs text-[#5a8a6e] mt-1">{(months / 12).toFixed(1)} years</p>
                  )}
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-[#2d5c3e] mb-1.5">Expected Annual Interest Rate</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a8a6e] font-semibold text-sm select-none">%</span>
                    <input type="number" placeholder="6.5" step="0.1" value={interestRate}
                      onChange={e => setInterestRate(e.target.value)} className="sc-input" min="0" max="100" />
                  </div>
                  <p className="text-xs text-[#5a8a6e] mt-1">Enter 0 for no interest / simple savings</p>
                </div>

                {/* Quick presets */}
                <div className="pt-3 border-t border-[#d5e8db]">
                  <p className="text-xs text-[#5a8a6e] mb-2">Quick presets</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map(ex => (
                      <button key={ex.label} className="sc-pill"
                        onClick={() => {
                          setGoalAmount(ex.goal);
                          setCurrentSavings(ex.current);
                          setTimeframe(ex.months);
                          setInterestRate(ex.rate);
                        }}>
                        {ex.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results column */}
            <div className="flex flex-col gap-5">

              {/* Monthly savings highlight */}
              <div className="result-glow p-6 text-white">
                <p className="text-sm font-medium opacity-80 mb-1">Monthly Savings Needed</p>
                {alreadyReached ? (
                  <>
                    <p className="text-4xl sm:text-5xl font-bold tracking-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}>
                      ₹0.00
                    </p>
                    <p className="text-xs opacity-80 mt-2">
                      🎉 Your current savings + interest will reach this goal without additional contributions!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl sm:text-5xl font-bold tracking-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}>
                      {hasResult ? fmt(monthly) : "₹0.00"}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      per month for {months || 0} months ({(months / 12).toFixed(1)} years)
                    </p>
                    {hasResult && (
                      <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-center">
                        <div>
                          <p className="text-xs opacity-70">Total Contributions</p>
                          <p className="text-base font-semibold mt-0.5">{fmt(totalContributions)}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-70">Interest Earned</p>
                          <p className="text-base font-semibold mt-0.5">{fmt(Math.max(0, interestEarned))}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Breakdown */}
              <div className="sc-card p-6 flex-1">
                <h3 className="text-sm font-semibold text-[#0f2418] mb-4">Savings Breakdown</h3>

                {/* Goal progress bar */}
                {hasResult && (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-[#5a8a6e] mb-1.5">
                      <span>Starting savings covers</span>
                      <span className="font-semibold text-[#0f2418]">{pct(progressPct)} of goal</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill-teal" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Current savings bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#2d5c3e] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                        Starting Amount
                      </span>
                      <span className="font-semibold text-[#0f2418]">
                        {goal > 0 ? pct((current / goal) * 100) : "0.0%"}
                      </span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill-gray" style={{ width: `${goal > 0 ? Math.min(100, (current / goal) * 100) : 0}%` }} />
                    </div>
                    <p className="text-xs text-[#5a8a6e] mt-1">{fmt(current)}</p>
                  </div>

                  {/* Contributions bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#2d5c3e] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                        New Contributions
                      </span>
                      <span className="font-semibold text-[#0f2418]">
                        {goal > 0 ? pct((totalContributions / goal) * 100) : "0.0%"}
                      </span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill-green" style={{ width: `${goal > 0 ? Math.min(100, (totalContributions / goal) * 100) : 0}%` }} />
                    </div>
                    <p className="text-xs text-[#5a8a6e] mt-1">{fmt(totalContributions)}</p>
                  </div>

                  {/* Interest bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#2d5c3e] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span>
                        Interest Earned
                      </span>
                      <span className="font-semibold text-[#0f2418]">
                        {goal > 0 ? pct((Math.max(0, interestEarned) / goal) * 100) : "0.0%"}
                      </span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill-teal" style={{ width: `${goal > 0 ? Math.min(100, (Math.max(0, interestEarned) / goal) * 100) : 0}%` }} />
                    </div>
                    <p className="text-xs text-[#5a8a6e] mt-1">{fmt(Math.max(0, interestEarned))}</p>
                  </div>
                </div>

                {/* Summary rows */}
                {hasResult && (
                  <div className="mt-5 pt-4 border-t border-[#d5e8db] space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#5a8a6e]">Goal Amount</span>
                      <span className="font-semibold text-[#0f2418]">{fmt(goal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5a8a6e]">Interest Rate</span>
                      <span className="font-medium text-[#0f2418]">{annualRate}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5a8a6e]">Interest Boost</span>
                      <span className="font-medium text-teal-600">
                        +{goal > 0 && interestEarned > 0 ? pct((interestEarned / (current + totalContributions)) * 100) : "0.0%"} on money saved
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Yearly growth table */}
          {growthRows.length > 0 && (
            <div className="sc-card p-6">
              <h3 className="text-sm font-semibold text-[#0f2418] mb-4">
                Yearly Growth Schedule
                <span className="ml-2 text-xs font-normal text-[#5a8a6e]">({growthRows.length} year{growthRows.length !== 1 ? "s" : ""} shown)</span>
              </h3>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-xs text-[#5a8a6e] border-b border-[#d5e8db]">
                      <th className="text-left pb-2 pr-4 font-medium">Year</th>
                      <th className="text-right pb-2 pr-4 font-medium">Opening Balance</th>
                      <th className="text-right pb-2 pr-4 font-medium">Contributed</th>
                      <th className="text-right pb-2 pr-4 font-medium">Interest</th>
                      <th className="text-right pb-2 font-medium">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthRows.map(row => (
                      <tr key={row.year} className="sc-amort-row">
                        <td className="py-2 pr-4 font-medium text-[#0f2418]">Year {row.year}</td>
                        <td className="py-2 pr-4 text-right text-[#2d5c3e]">{fmt(row.opening)}</td>
                        <td className="py-2 pr-4 text-right text-green-600 font-medium">{fmt(row.contributed)}</td>
                        <td className="py-2 pr-4 text-right text-teal-600 font-medium">{fmt(row.interest)}</td>
                        <td className="py-2 text-right text-[#2d5c3e]">{fmt(row.closing)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="sc-card p-5 border-l-4 border-[#1a7a42]">
            <h4 className="text-sm font-semibold text-[#0f2418] mb-2">💡 Smart Savings Tips</h4>
            <div className="grid gap-1.5">
              {[
                "Automate transfers on salary day — you can't spend what you don't see.",
                "A high-yield savings account or FD can meaningfully boost your interest earnings.",
                "Even saving 3 months earlier can reduce your required monthly amount significantly.",
                "Invest any windfalls (bonus, tax refund) directly into your goal to hit it faster.",
              ].map((tip, i) => (
                <p key={i} className="text-xs text-[#2d5c3e] flex gap-2">
                  <span className="text-[#1a7a42] font-bold shrink-0">→</span>{tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}