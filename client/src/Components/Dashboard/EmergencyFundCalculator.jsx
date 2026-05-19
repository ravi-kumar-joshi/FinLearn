/**
 * EmergencyFundCalculator.jsx
 * ─────────────────────────────────────────────────────────────
 * Optimized to match InflationCalculator quality:
 *  - Shared InputRow + filled sliders (teal accent)
 *  - All derived values in useMemo with clamp guards
 *  - Chart.js projection (unchanged logic, cleaner setup)
 *  - Conditional tip banners consistent with suite pattern
 *  - Fixed bg-gradient-to-r (was bg-linear-to-r)
 *  - Reset button
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";
import {
  RefreshCw,
  ShieldCheck,
  IndianRupee,
  Calendar,
  PiggyBank,
  TrendingUp,
  PlusCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { clamp, fmtINR, makeSliderStyle } from "../../utils/financialUtils";
import InputRow from "./InputRow";

Chart.register(...registerables);

/* ── constants ─────────────────────────────────────────────── */

const ACCENT = "#0d9488"; // teal-600
const SLIDER_CLASS = "ef-range";

const JOB_REC = { salaried: 6, freelance: 9, business: 12 };
const JOB_HINTS = {
  salaried: "Recommended for salaried employees: 6 months",
  freelance: "Recommended for freelancers: 9 months",
  business: "Recommended for business owners: 12 months",
};

const DEFAULT_EXPENSES = [
  { id: 1, cat: "Rent / EMI",       amt: 15000 },
  { id: 2, cat: "Food & groceries", amt: 8000  },
  { id: 3, cat: "Transport",        amt: 4000  },
  { id: 4, cat: "Utilities",        amt: 3000  },
];

/* ── component ─────────────────────────────────────────────── */

const EmergencyFundCalculator = ({ onClose }) => {
  const [jobType,       setJobType]       = useState("salaried");
  const [months,        setMonths]        = useState(6);
  const [currentSavings,setCurrentSavings]= useState(50000);
  const [monthlySaving, setMonthlySaving] = useState(10000);
  const [expenses,      setExpenses]      = useState(DEFAULT_EXPENSES);
  const [nextId,        setNextId]        = useState(5);

  const chartRef      = useRef(null);
  const chartInstance = useRef(null);

  /* ── derived ── */
  const totalExp = useMemo(
    () => expenses.reduce((s, e) => s + (Number(e.amt) || 0), 0),
    [expenses]
  );

  const { target, gap, covered, monthsToGoal, goalDateStr } = useMemo(() => {
    const saMonths  = clamp(months,         3,  24);
    const saSavings = clamp(currentSavings, 0, 1e8);
    const saMthly   = clamp(monthlySaving,  0, 1e7);

    const target        = totalExp * saMonths;
    const gap           = Math.max(0, target - saSavings);
    const covered       = target > 0 ? Math.min(100, (saSavings / target) * 100) : 100;
    const monthsToGoal  = gap > 0 ? Math.ceil(gap / (saMthly || 1)) : 0;

    const goalDate = new Date();
    goalDate.setMonth(goalDate.getMonth() + monthsToGoal);
    const goalDateStr = goalDate.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });

    return { target, gap, covered, monthsToGoal, goalDateStr };
  }, [totalExp, months, currentSavings, monthlySaving]);

  /* ── status helpers ── */
  const statusColor =
    covered >= 100 ? "#1D9E75" : covered >= 60 ? "#BA7517" : "#E24B4A";
  const barColor =
    covered >= 100 ? "#1D9E75" : covered >= 60 ? "#EF9F27" : "#E24B4A";
  const statusLabel =
    covered >= 100 ? "Fully funded" : covered >= 60 ? "Partially funded" : "Underfunded";

  const tip = useMemo(() => {
    const recMonths = JOB_REC[jobType];
    if (covered >= 100 && months >= recMonths)
      return {
        bg: "#E1F5EE", border: "#5DCAA5", color: "#085041",
        text: "Your fund is fully funded! Great work — consider investing the surplus.",
      };
    if (months < recMonths)
      return {
        bg: "#FAEEDA", border: "#EF9F27", color: "#412402",
        text: `Tip: Your coverage goal (${months} mo) is below the recommended ${recMonths} months for your employment type.`,
      };
    if (covered < 60)
      return {
        bg: "#FCEBEB", border: "#F09595", color: "#501313",
        text: "Priority: Your fund is underfunded. Boost monthly savings or reduce expenses to reach your goal faster.",
      };
    return {
      bg: "#E6F1FB", border: "#85B7EB", color: "#042C53",
      text: `On track! Keep saving ${fmtINR(clamp(monthlySaving, 0, 1e7))}/month — fully funded in ${monthsToGoal} months.`,
    };
  }, [covered, months, jobType, monthlySaving, monthsToGoal]);

  /* ── chart ── */
  useEffect(() => {
    if (!chartRef.current) return;

    const saSavings = clamp(currentSavings, 0, 1e8);
    const saMthly   = clamp(monthlySaving,  0, 1e7);
    const limit     = Math.min(monthsToGoal + 2, 36);

    const labels = [];
    const data   = [];
    for (let i = 0; i <= limit; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      labels.push(d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }));
      data.push(Math.min(saSavings + saMthly * i, target));
    }

    chartInstance.current?.destroy();
    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Savings",
            data,
            fill: true,
            borderColor: ACCENT,
            backgroundColor: `${ACCENT}1a`,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Target",
            data: labels.map(() => target),
            borderColor: "#E24B4A",
            borderDash: [4, 3],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: { label: (ctx) => " " + fmtINR(ctx.parsed.y) },
          },
        },
        scales: {
          x: {
            ticks: { font: { size: 10 }, maxTicksLimit: 6, color: "#888780" },
            grid: { display: false },
          },
          y: {
            ticks: { callback: (v) => fmtINR(v), font: { size: 10 }, color: "#888780" },
            grid: { color: "rgba(136,135,128,0.12)" },
            border: { display: false },
          },
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [currentSavings, monthlySaving, target, monthsToGoal]);

  /* ── expense helpers ── */
  const addExpense = () => {
    setExpenses((prev) => [...prev, { id: nextId, cat: "", amt: 0 }]);
    setNextId((n) => n + 1);
  };
  const removeExpense = (id) => {
    if (expenses.length > 1) setExpenses((prev) => prev.filter((e) => e.id !== id));
  };
  const updateExpense = (id, field, value) =>
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, [field]: field === "amt" ? Number(value) || 0 : value }
          : e
      )
    );

  const reset = () => {
    setJobType("salaried");
    setMonths(6);
    setCurrentSavings(50000);
    setMonthlySaving(10000);
    setExpenses(DEFAULT_EXPENSES);
    setNextId(5);
  };

  /* ── render ── */
  return (
    <div className="max-w-4xl mx-auto">
      <style>{makeSliderStyle(ACCENT, SLIDER_CLASS)}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Emergency Fund Calculator</h2>
          <p className="text-gray-600 text-sm mt-1">
            Build your financial safety net. Know your target and timeline.
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

      {/* Employment type */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Employment type
        </p>
        <div className="flex gap-2">
          {[
            ["salaried",  "Salaried"],
            ["freelance", "Freelancer"],
            ["business",  "Business owner"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setJobType(v)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                jobType === v
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">{JOB_HINTS[jobType]}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Inputs ── */}
        <div className="flex flex-col gap-5">

          {/* Expense breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <IndianRupee className="w-5 h-5 text-teal-600 mr-2" />
              Monthly Expenses
            </h3>
            {expenses.map((e) => (
              <div key={e.id} className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  placeholder="Category"
                  value={e.cat}
                  onChange={(ev) => updateExpense(e.id, "cat", ev.target.value)}
                  className="flex-[1.5] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                />
                <div className="relative flex-1">
                  <span className="absolute left-2 top-2.5 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={e.amt}
                    onChange={(ev) => updateExpense(e.id, "amt", ev.target.value)}
                    className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none"
                  />
                </div>
                {expenses.length > 1 && (
                  <button
                    onClick={() => removeExpense(e.id)}
                    className="text-gray-300 hover:text-red-400 text-xl leading-none px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addExpense}
              className="flex items-center text-sm text-teal-600 hover:text-teal-800 font-medium mt-1"
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Add category
            </button>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
              <span className="text-sm text-gray-500">Total monthly</span>
              <span className="text-sm font-bold text-gray-800">{fmtINR(totalExp)}</span>
            </div>
          </div>

          {/* Savings inputs */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <PiggyBank className="w-5 h-5 text-teal-600 mr-2" />
              Your Savings
            </h3>
            <div className="space-y-5">
              <InputRow
                icon={PiggyBank}
                label="Current emergency savings"
                value={currentSavings}
                onChange={setCurrentSavings}
                min={0}
                max={5000000}
                step={5000}
                unit="₹"
                accent={ACCENT}
                sliderClass={SLIDER_CLASS}
              />
              <InputRow
                icon={TrendingUp}
                label="Monthly savings capacity"
                value={monthlySaving}
                onChange={setMonthlySaving}
                min={0}
                max={500000}
                step={1000}
                unit="₹"
                accent={ACCENT}
                sliderClass={SLIDER_CLASS}
              />
            </div>
          </div>

          {/* Coverage goal */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Calendar className="w-5 h-5 text-teal-600 mr-2" />
              Coverage Goal
            </h3>
            <InputRow
              icon={Calendar}
              label="Months of coverage"
              value={months}
              onChange={(v) => setMonths(clamp(v, 3, 24))}
              min={3}
              max={24}
              step={1}
              unit="mo"
              accent={ACCENT}
              sliderClass={SLIDER_CLASS}
            />
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="flex flex-col gap-5">

          {/* Status badge */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">{statusLabel}</p>
            <p className="text-5xl font-extrabold mt-1" style={{ color: statusColor }}>
              {Math.round(covered)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">
              of your {clamp(months, 3, 24)}-month goal funded
            </p>
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Saved</span>
              <span className="text-gray-400">Target</span>
            </div>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${covered}%`, background: barColor }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-bold text-teal-600">
                {fmtINR(clamp(currentSavings, 0, 1e8))}
              </span>
              <span className="text-sm font-bold text-gray-700">{fmtINR(target)}</span>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Shortfall",      value: gap > 0 ? fmtINR(gap) : "—",           color: gap > 0 ? "text-red-500" : "text-gray-700" },
              { label: "Months to goal", value: gap > 0 ? `${monthsToGoal} mo` : "Done!", color: "text-teal-600" },
              { label: "Fund target",    value: fmtINR(target),                          color: "text-gray-700" },
              { label: "Goal date",      value: gap > 0 ? goalDateStr : "Now!",          color: "text-gray-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Savings Projection
            </p>
            <div className="relative w-full" style={{ height: 160 }}>
              <canvas ref={chartRef} />
            </div>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <span className="inline-block w-3 h-0.5 rounded" style={{ background: ACCENT }} />
                Savings
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <span className="inline-block w-3 h-0.5 bg-red-400 rounded" />
                Target
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tip banner ── */}
      <div
        className="mt-6 rounded-xl p-5 border text-sm"
        style={{ background: tip.bg, borderColor: tip.border, color: tip.color }}
      >
        {tip.text}
      </div>
    </div>
  );
};

export default EmergencyFundCalculator;