import { useState, useMemo, useRef, useEffect } from "react";

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

const JOB_REC = { salaried: 6, freelance: 9, business: 12 };
const JOB_HINTS = {
  salaried: "Stable income — 6 months recommended",
  freelance: "Variable income — 9 months recommended",
  business: "Business risk — 12 months recommended",
};

const DEFAULT_EXPENSES = [
  { id: 1, cat: "Rent / EMI", amt: 15000 },
  { id: 2, cat: "Food & Groceries", amt: 8000 },
  { id: 3, cat: "Transport", amt: 4000 },
  { id: 4, cat: "Utilities", amt: 3000 },
];

export default function EmergencyFundCalculator({ onClose }) {
  const [jobType, setJobType] = useState("salaried");
  const [months, setMonths] = useState(6);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlySaving, setMonthlySaving] = useState(10000);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [nextId, setNextId] = useState(5);

  const canvasRef = useRef(null);
  const _chartInstanceRef = useRef(null);

  /* ── derived ── */
  const totalExp = useMemo(
    () => expenses.reduce((s, e) => s + (Number(e.amt) || 0), 0),
    [expenses]
  );

  const { target, gap, covered, monthsToGoal, goalDateStr } = useMemo(() => {
    const saSavings = clamp(currentSavings, 0, 1e8);
    const saMthly = clamp(monthlySaving, 0, 1e7);
    const saMonths = clamp(months, 3, 24);

    const target = totalExp * saMonths;
    const gap = Math.max(0, target - saSavings);
    const covered = target > 0 ? Math.min(100, (saSavings / target) * 100) : 100;
    const monthsToGoal = gap > 0 && saMthly > 0 ? Math.ceil(gap / saMthly) : gap > 0 ? Infinity : 0;

    const goalDate = new Date();
    goalDate.setMonth(goalDate.getMonth() + (isFinite(monthsToGoal) ? monthsToGoal : 0));
    const goalDateStr = isFinite(monthsToGoal) && monthsToGoal > 0
      ? goalDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
      : monthsToGoal === 0 ? "Already there!" : "Set a monthly saving";

    return { target, gap, covered, monthsToGoal, goalDateStr };
  }, [totalExp, months, currentSavings, monthlySaving]);

  const statusColor = covered >= 100 ? "#0d9488" : covered >= 60 ? "#d97706" : "#dc2626";
  const statusLabel = covered >= 100 ? "Fully Funded ✓" : covered >= 60 ? "Partially Funded" : "Underfunded";

  /* ── chart — native canvas, no dependency ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const saSavings = clamp(currentSavings, 0, 1e8);
    const saMthly = clamp(monthlySaving, 0, 1e7);
    const limit = Math.min(isFinite(monthsToGoal) ? monthsToGoal + 3 : 24, 36);

    const points = Array.from({ length: limit + 1 }, (_, i) => ({
      x: i,
      y: Math.min(saSavings + saMthly * i, target),
    }));

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const PAD = { top: 12, right: 16, bottom: 32, left: 52 };
    const cw = W - PAD.left - PAD.right;
    const ch = H - PAD.top - PAD.bottom;

    const maxY = Math.max(target * 1.05, saSavings * 1.1, 1000);
    const toX = (i) => PAD.left + (i / limit) * cw;
    const toY = (v) => PAD.top + ch - (v / maxY) * ch;

    ctx.clearRect(0, 0, W, H);

    /* grid */
    ctx.strokeStyle = "rgba(13,148,136,0.08)";
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const y = PAD.top + (g / 4) * ch;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cw, y); ctx.stroke();
      ctx.fillStyle = "#94a3b8"; ctx.font = "10px DM Sans, sans-serif"; ctx.textAlign = "right";
      ctx.fillText(fmtINR(maxY * (1 - g / 4)), PAD.left - 4, y + 3);
    }

    /* x-axis labels */
    ctx.fillStyle = "#94a3b8"; ctx.font = "10px DM Sans, sans-serif"; ctx.textAlign = "center";
    const step = Math.max(1, Math.floor(limit / 5));
    for (let i = 0; i <= limit; i += step) {
      const d = new Date(); d.setMonth(d.getMonth() + i);
      const lbl = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      ctx.fillText(lbl, toX(i), H - PAD.bottom + 14);
    }

    /* target dashed line */
    if (target > 0) {
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(PAD.left, toY(target)); ctx.lineTo(PAD.left + cw, toY(target)); ctx.stroke();
      ctx.setLineDash([]);
    }

    /* savings fill */
    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + ch);
    grad.addColorStop(0, "rgba(13,148,136,0.25)");
    grad.addColorStop(1, "rgba(13,148,136,0.02)");
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(points[0].y));
    points.forEach(p => ctx.lineTo(toX(p.x), toY(p.y)));
    ctx.lineTo(toX(limit), toY(0)); ctx.lineTo(PAD.left, toY(0));
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

    /* savings line */
    ctx.strokeStyle = "#0d9488"; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(toX(p.x), toY(p.y)) : ctx.lineTo(toX(p.x), toY(p.y)));
    ctx.stroke();
  }, [currentSavings, monthlySaving, target, monthsToGoal]);

  /* ── expense helpers ── */
  const addExpense = () => { setExpenses(p => [...p, { id: nextId, cat: "", amt: 0 }]); setNextId(n => n + 1); };
  const removeExpense = (id) => { if (expenses.length > 1) setExpenses(p => p.filter(e => e.id !== id)); };
  const updateExpense = (id, field, value) =>
    setExpenses(p => p.map(e => e.id === id ? { ...e, [field]: field === "amt" ? Number(value) || 0 : value } : e));

  const reset = () => {
    setJobType("salaried"); setMonths(6); setCurrentSavings(50000);
    setMonthlySaving(10000); setExpenses(DEFAULT_EXPENSES); setNextId(5);
  };

  const sliderBg = (val, min, max) => {
    const pct = ((clamp(val, min, max) - min) / (max - min)) * 100;
    return `linear-gradient(to right, #0d9488 ${pct}%, #99f6e4 ${pct}%)`;
  };

  /* ── status tip ── */
  const tip = useMemo(() => {
    const rec = JOB_REC[jobType];
    if (covered >= 100 && months >= rec)
      return { type: "success", text: "Your fund is fully funded! Great work — consider investing the surplus in a liquid mutual fund." };
    if (months < rec)
      return { type: "warn", text: `Your coverage goal (${months} mo) is below the recommended ${rec} months for your employment type. Consider increasing it.` };
    if (covered < 60)
      return { type: "danger", text: "Priority: Your fund is underfunded. Boost monthly savings or trim expenses to reach your goal faster." };
    return { type: "info", text: `On track! Keep saving ${fmtINR(clamp(monthlySaving, 0, 1e7))}/month — fully funded in ${isFinite(monthsToGoal) ? monthsToGoal + " months" : "set a monthly saving amount"}.` };
  }, [covered, months, jobType, monthlySaving, monthsToGoal]);

  const tipColors = {
    success: { bg: "#f0fdf9", border: "#0d9488", text: "#064e3b" },
    warn: { bg: "#fffbeb", border: "#d97706", text: "#78350f" },
    danger: { bg: "#fff1f2", border: "#dc2626", text: "#7f1d1d" },
    info: { bg: "#f0fdfa", border: "#0d9488", text: "#134e4a" },
  }[tip.type];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#f0fdfb] p-4 sm:p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        .ef-card { background: #fff; border-radius: 20px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }

        .ef-input {
          width: 100%; padding: 11px 14px 11px 44px;
          border: 1.5px solid #99f6e4; border-radius: 12px;
          font-size: 15px; font-family: 'DM Sans', sans-serif;
          background: #f0fdfb; color: #042f2e;
          transition: border-color .2s, box-shadow .2s; outline: none;
        }
        .ef-input.no-prefix { padding-left: 14px; }
        .ef-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,.12); background: #fff; }
        .ef-input::placeholder { color: #5eead4; }
        .ef-input::-webkit-outer-spin-button,
        .ef-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .ef-input[type=number] { -moz-appearance: textfield; }

        .ef-text-input {
          padding: 9px 12px; border: 1.5px solid #99f6e4; border-radius: 10px;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          background: #f0fdfb; color: #042f2e; outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .ef-text-input:focus { border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,.1); background: #fff; }
        .ef-text-input::placeholder { color: #5eead4; }

        .ef-range {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 6px; border-radius: 9999px;
          outline: none; cursor: pointer;
        }
        .ef-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: #0d9488; border: 2px solid #fff;
          box-shadow: 0 0 0 2px #0d9488; cursor: pointer;
          transition: box-shadow .15s;
        }
        .ef-range::-webkit-slider-thumb:hover { box-shadow: 0 0 0 5px rgba(13,148,136,.25); }
        .ef-range::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #0d9488; border: 2px solid #fff; cursor: pointer;
        }

        .ef-pill {
          padding: 7px 13px; border-radius: 99px; font-size: 12.5px;
          font-weight: 500; border: 1.5px solid #99f6e4;
          background: #f0fdfb; color: #134e4a; cursor: pointer;
          transition: background .15s, border-color .15s, color .15s;
        }
        .ef-pill:hover { background: #0d9488; border-color: #0d9488; color: #fff; }

        .result-glow { background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); border-radius: 20px; }

        .bar-track { height: 10px; border-radius: 99px; background: #99f6e4; overflow: hidden; }
        .bar-teal   { background: linear-gradient(90deg, #0d9488, #2dd4bf); height: 100%; border-radius: 99px; transition: width .5s ease; }
        .bar-amber  { background: linear-gradient(90deg, #d97706, #fbbf24); height: 100%; border-radius: 99px; transition: width .5s ease; }
        .bar-red    { background: linear-gradient(90deg, #dc2626, #f87171); height: 100%; border-radius: 99px; transition: width .5s ease; }

        @media (max-width: 640px) { .ef-grid-2 { grid-template-columns: 1fr; } }
        @media (min-width: 641px) { .ef-grid-2 { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .job-btns { flex-direction: column; } }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Title */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#042f2e" }}
              className="text-3xl sm:text-4xl font-bold leading-tight">
              Emergency Fund
            </h1>
            <p className="text-sm text-[#0f766e] mt-1">Build your financial safety net · Know your target & timeline</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset}
              className="self-start sm:self-auto px-5 py-2 rounded-full text-sm font-medium border-2 border-[#99f6e4] text-[#134e4a] hover:bg-[#0d9488] hover:text-white hover:border-[#0d9488] transition-all">
              Reset
            </button>
            {onClose && (
              <button onClick={onClose}
                className="self-start sm:self-auto px-5 py-2 rounded-full text-sm font-medium border-2 border-[#99f6e4] text-[#134e4a] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Employment type selector */}
        <div className="ef-card p-5 mb-5">
          <p className="text-xs font-semibold text-[#0f766e] uppercase tracking-wider mb-3">Employment Type</p>
          <div className="flex gap-2 job-btns">
            {[["salaried", "💼 Salaried"], ["freelance", "🧑‍💻 Freelancer"], ["business", "🏢 Business Owner"]].map(([v, l]) => (
              <button key={v} onClick={() => { setJobType(v); setMonths(JOB_REC[v]); }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${jobType === v
                  ? "bg-[#0d9488] text-white border-[#0d9488] shadow-sm"
                  : "bg-[#f0fdfb] text-[#134e4a] border-[#99f6e4] hover:border-[#0d9488]"
                  }`}>
                {l}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#0f766e] mt-2">{JOB_HINTS[jobType]}</p>
        </div>

        <div className="grid gap-5 ef-grid-2">

          {/* Left: inputs */}
          <div className="flex flex-col gap-5">

            {/* Expenses */}
            <div className="ef-card p-6">
              <h2 className="text-base font-semibold text-[#042f2e] mb-4">Monthly Expenses</h2>
              <div className="space-y-2">
                {expenses.map(e => (
                  <div key={e.id} className="flex gap-2 items-center">
                    <input type="text" placeholder="Category" value={e.cat}
                      onChange={ev => updateExpense(e.id, "cat", ev.target.value)}
                      className="ef-text-input flex-[1.6]" />
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5eead4] font-semibold text-sm select-none">₹</span>
                      <input type="number" placeholder="0" value={e.amt || ""}
                        onChange={ev => updateExpense(e.id, "amt", ev.target.value)}
                        className="ef-text-input w-full pl-7" style={{ paddingLeft: 28 }} />
                    </div>
                    {expenses.length > 1 && (
                      <button onClick={() => removeExpense(e.id)}
                        className="text-[#99f6e4] hover:text-red-400 text-xl leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors shrink-0">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addExpense}
                className="flex items-center gap-1.5 text-sm text-[#0d9488] hover:text-[#0f766e] font-medium mt-3">
                <span className="text-lg leading-none">+</span> Add category
              </button>
              <div className="border-t border-[#99f6e4] mt-4 pt-3 flex justify-between items-center">
                <span className="text-sm text-[#0f766e]">Total monthly</span>
                <span className="text-base font-bold text-[#042f2e]">{fmtFull(totalExp)}</span>
              </div>
            </div>

            {/* Savings inputs */}
            <div className="ef-card p-6">
              <h2 className="text-base font-semibold text-[#042f2e] mb-5">Your Savings</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#134e4a] mb-1.5">Current Emergency Savings</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5eead4] font-semibold text-base select-none">₹</span>
                    <input type="number" value={currentSavings} min={0} max={5000000}
                      onChange={e => setCurrentSavings(e.target.value)}
                      onBlur={e => setCurrentSavings(clamp(e.target.value, 0, 5000000))}
                      className="ef-input" placeholder="50000" />
                  </div>
                  <div className="mt-2">
                    <input type="range" min={0} max={500000} step={5000}
                      value={clamp(currentSavings, 0, 500000)}
                      onChange={e => setCurrentSavings(Number(e.target.value))}
                      className="ef-range" style={{ background: sliderBg(currentSavings, 0, 500000) }} />
                    <div className="flex justify-between text-xs text-[#5eead4] mt-0.5"><span>₹0</span><span>₹5 L</span></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134e4a] mb-1.5">Monthly Savings Capacity</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5eead4] font-semibold text-base select-none">₹</span>
                    <input type="number" value={monthlySaving} min={0} max={500000}
                      onChange={e => setMonthlySaving(e.target.value)}
                      onBlur={e => setMonthlySaving(clamp(e.target.value, 0, 500000))}
                      className="ef-input" placeholder="10000" />
                  </div>
                  <div className="mt-2">
                    <input type="range" min={0} max={100000} step={1000}
                      value={clamp(monthlySaving, 0, 100000)}
                      onChange={e => setMonthlySaving(Number(e.target.value))}
                      className="ef-range" style={{ background: sliderBg(monthlySaving, 0, 100000) }} />
                    <div className="flex justify-between text-xs text-[#5eead4] mt-0.5"><span>₹0</span><span>₹1 L</span></div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#134e4a] mb-1.5">Coverage Goal (months)</label>
                  <div className="relative">
                    <input type="number" value={months} min={3} max={24}
                      onChange={e => setMonths(e.target.value)}
                      onBlur={e => setMonths(clamp(e.target.value, 3, 24))}
                      className="ef-input no-prefix" style={{ paddingLeft: 14, paddingRight: 44 }} placeholder="6" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5eead4] font-semibold text-xs select-none">MO</span>
                  </div>
                  <div className="mt-2">
                    <input type="range" min={3} max={24} step={1}
                      value={clamp(months, 3, 24)}
                      onChange={e => setMonths(Number(e.target.value))}
                      className="ef-range" style={{ background: sliderBg(months, 3, 24) }} />
                    <div className="flex justify-between text-xs text-[#5eead4] mt-0.5"><span>3 mo</span><span>24 mo</span></div>
                  </div>
                  <p className="text-xs text-[#0f766e] mt-1">{JOB_HINTS[jobType]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: results */}
          <div className="flex flex-col gap-5">

            {/* Status highlight */}
            <div className="result-glow p-6 text-white">
              <p className="text-sm font-medium opacity-80 mb-1">Fund Status</p>
              <p className="text-5xl font-bold tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {Math.round(covered)}%
              </p>
              <p className="text-sm opacity-70 mt-1"><span style={{ color: statusColor }}>{statusLabel}</span> · {clamp(months, 3, 24)}-month goal</p>
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xs opacity-70">Fund Target</p>
                  <p className="text-base font-semibold mt-0.5">{fmtINR(target)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Shortfall</p>
                  <p className="text-base font-semibold mt-0.5 text-red-300">{gap > 0 ? fmtINR(gap) : "None 🎉"}</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="ef-card p-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#0f766e] font-medium">Saved: {fmtINR(clamp(currentSavings, 0, 1e8))}</span>
                <span className="text-[#042f2e] font-medium">Target: {fmtINR(target)}</span>
              </div>
              <div className="bar-track">
                <div className={covered >= 100 ? "bar-teal" : covered >= 60 ? "bar-amber" : "bar-red"}
                  style={{ width: `${covered}%` }} />
              </div>
              <p className="text-xs text-[#0f766e] mt-2">{covered.toFixed(1)}% of your goal funded</p>

              {/* 4 metric boxes */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: "Fund Target", value: fmtINR(target), sub: `${clamp(months, 3, 24)} × ${fmtINR(totalExp)}` },
                  { label: "Shortfall", value: gap > 0 ? fmtINR(gap) : "None!", sub: gap > 0 ? "still needed" : "fully covered" },
                  { label: "Months to Goal", value: gap > 0 ? (isFinite(monthsToGoal) ? `${monthsToGoal} mo` : "Set saving") : "Done!", sub: gap > 0 && isFinite(monthsToGoal) ? `by ${goalDateStr}` : "" },
                  { label: "Monthly Expense", value: fmtINR(totalExp), sub: `${expenses.length} categories` },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-[#f0fdfb] rounded-xl p-3 border border-[#99f6e4]">
                    <p className="text-xs text-[#0f766e] mb-0.5">{label}</p>
                    <p className="text-base font-bold text-[#042f2e]">{value}</p>
                    {sub && <p className="text-xs text-[#5eead4] mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="ef-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#042f2e]">Savings Projection</h3>
                <div className="flex gap-3 text-xs text-[#0f766e]">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-4 h-0.5 bg-teal-600 rounded"></span>Savings
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-4 h-0.5 bg-red-400 rounded" style={{ borderTop: "2px dashed #f87171", height: 0 }}></span>Target
                  </span>
                </div>
              </div>
              <div className="relative w-full" style={{ height: 160 }}>
                <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tip banner */}
        <div className="ef-card mt-5 p-5 border-l-4"
          style={{ borderLeftColor: tipColors.border, background: tipColors.bg }}>
          <h4 className="text-sm font-semibold mb-2" style={{ color: tipColors.text }}>
            {tip.type === "success" ? "🎉 Fully Funded!" : tip.type === "danger" ? "⚠️ Action Needed" : tip.type === "warn" ? "💡 Heads Up" : "📈 On Track"}
          </h4>
          <p className="text-xs" style={{ color: tipColors.text }}>{tip.text}</p>
        </div>

        {/* Tips strip */}
        <div className="ef-card p-5 border-l-4 border-[#0d9488] mt-5">
          <h4 className="text-sm font-semibold text-[#042f2e] mb-2">💡 Emergency Fund Tips</h4>
          <div className="grid gap-1.5">
            {[
              "Keep your emergency fund in a high-yield savings account or liquid mutual fund — not a fixed deposit you can't touch.",
              "Never invest your emergency fund in equities — accessibility in a crisis matters more than returns.",
              "Replenish immediately after any withdrawal — treat it like paying a bill.",
              `As a ${jobType === "salaried" ? "salaried employee" : jobType === "freelance" ? "freelancer" : "business owner"}, aim for ${JOB_REC[jobType]} months of expenses (${fmtINR(totalExp * JOB_REC[jobType])}).`,
            ].map((tip, i) => (
              <p key={i} className="text-xs text-[#134e4a] flex gap-2">
                <span className="text-[#0d9488] font-bold shrink-0">→</span>{tip}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}