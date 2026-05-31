import React, { useState, useMemo, useRef } from "react";
import { PlusCircle, MinusCircle, IndianRupee, TrendingUp, TrendingDown, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

const EXPENSE_SUGGESTIONS = [
  "Rent", "Food", "Transportation", "Utilities", "Groceries",
  "Healthcare", "Entertainment", "Shopping", "Education", "Miscellaneous",
  "Insurance", "Subscriptions", "Gym", "Fuel", "Mobile Bill",
];

const COLOR_PALETTE = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#ec4899", "#84cc16", "#6366f1",
];

const fmt = (n) => Number(n).toLocaleString("en-IN");

const BudgetCalculator = ({ onClose }) => {
  const [income, setIncome] = useState([
    { id: 1, source: "Salary", amount: "" },
  ]);
  const [expenses, setExpenses] = useState([
    { id: 1, category: "Housing", amount: "" },
    { id: 2, category: "Food", amount: "" },
    { id: 3, category: "Transportation", amount: "" },
  ]);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const newIncomeRef = useRef(null);
  const newExpenseRef = useRef(null);

  // ── Calculations ──────────────────────────────────────────────────────────
  const totalIncome = useMemo(
    () => income.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0),
    [income]
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0),
    [expenses]
  );
  const balance = totalIncome - totalExpenses;
  // Savings rate: only meaningful when income > 0 and balance is positive
  const savingsRate =
    totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0;

  const expenseBreakdown = useMemo(() => {
    if (totalExpenses === 0) return [];
    return expenses
      .filter((i) => parseFloat(i.amount) > 0)
      .map((i, idx) => ({
        category: i.category || "Other",
        amount: parseFloat(i.amount),
        percentage: Math.round((parseFloat(i.amount) / totalExpenses) * 100),
        color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalExpenses]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const addIncome = () => {
    setIncome((p) => [...p, { id: Date.now(), source: "", amount: "" }]);
    setTimeout(() => newIncomeRef.current?.focus(), 80);
  };
  const addExpense = () => {
    setExpenses((p) => [...p, { id: Date.now(), category: "", amount: "" }]);
    setTimeout(() => newExpenseRef.current?.focus(), 80);
  };
  const updateIncome = (id, field, val) =>
    setIncome((p) => p.map((i) => (i.id === id ? { ...i, [field]: val } : i)));
  const updateExpense = (id, field, val) =>
    setExpenses((p) => p.map((i) => (i.id === id ? { ...i, [field]: val } : i)));
  const removeIncome = (id) =>
    income.length > 1 && setIncome((p) => p.filter((i) => i.id !== id));
  const removeExpense = (id) =>
    expenses.length > 1 && setExpenses((p) => p.filter((i) => i.id !== id));
  const reset = () => {
    setIncome([{ id: 1, source: "Salary", amount: "" }]);
    setExpenses([
      { id: 1, category: "Housing", amount: "" },
      { id: 2, category: "Food", amount: "" },
      { id: 3, category: "Transportation", amount: "" },
    ]);
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const balancePositive = balance >= 0;

  const recommendation = () => {
    if (balance < 0)
      return {
        type: "danger",
        icon: "⚠️",
        title: "Over Budget",
        msg: `You're spending ₹${fmt(Math.abs(balance))} more than you earn. Review your top expense categories and look for areas to cut.`,
      };
    if (savingsRate < 10)
      return {
        type: "warning",
        icon: "💡",
        title: "Low Savings Rate",
        msg: `You're saving only ${savingsRate}% of your income. Aim for at least 20% to build a solid financial cushion.`,
      };
    if (savingsRate < 20)
      return {
        type: "info",
        icon: "📌",
        title: "Almost There",
        msg: `Your savings rate is ${savingsRate}%. You're on the right track — try to push toward 20% for greater financial security.`,
      };
    return {
      type: "success",
      icon: "🎉",
      title: "Great Job!",
      msg: `You're saving ${savingsRate}% of your income. Consider investing your surplus in SIPs or mutual funds to grow wealth.`,
    };
  };

  const rec = totalIncome > 0 || totalExpenses > 0 ? recommendation() : null;

  const recStyles = {
    danger:  "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info:    "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-4 sm:px-5 sm:py-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5 sm:mb-6 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            Budget Calculator
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Plan your monthly finances
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:scale-95"
          >
            <RotateCcw size={13} />
            <span className="hidden xs:inline">Reset</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Income + Expenses Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* Income */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-gray-800">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              Income
            </h3>
            <button
              onClick={addIncome}
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {income.map((item, index) => (
              <div key={item.id} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Source (e.g. Salary)"
                  value={item.source}
                  onChange={(e) => updateIncome(item.id, "source", e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-xs sm:text-sm outline-none transition-all"
                />
                <div className="relative w-28 sm:w-32 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.amount}
                    min="0"
                    onChange={(e) => updateIncome(item.id, "amount", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addIncome()}
                    ref={index === income.length - 1 ? newIncomeRef : null}
                    className="w-full pl-6 pr-2 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-xs sm:text-sm outline-none transition-all"
                  />
                </div>
                {income.length > 1 && (
                  <button
                    onClick={() => removeIncome(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-4 py-3 sm:px-5 sm:py-4 bg-emerald-50 border-t border-emerald-100">
            <span className="text-xs sm:text-sm font-semibold text-emerald-700">Total Income</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-600">
              ₹{fmt(totalIncome)}
            </span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-gray-800">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              Expenses
            </h3>
            <button
              onClick={addExpense}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs sm:text-sm font-medium transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add
            </button>
          </div>

          <datalist id="expense-cats">
            {EXPENSE_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
          </datalist>

          <div className="p-4 sm:p-5 space-y-3">
            {expenses.map((item, index) => (
              <div key={item.id} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Category"
                  value={item.category}
                  list="expense-cats"
                  onChange={(e) => updateExpense(item.id, "category", e.target.value)}
                  ref={index === expenses.length - 1 ? newExpenseRef : null}
                  className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-xs sm:text-sm outline-none transition-all"
                />
                <div className="relative w-28 sm:w-32 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.amount}
                    min="0"
                    onChange={(e) => updateExpense(item.id, "amount", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addExpense()}
                    className="w-full pl-6 pr-2 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-xs sm:text-sm outline-none transition-all"
                  />
                </div>
                {expenses.length > 1 && (
                  <button
                    onClick={() => removeExpense(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-4 py-3 sm:px-5 sm:py-4 bg-red-50 border-t border-red-100">
            <span className="text-xs sm:text-sm font-semibold text-red-600">Total Expenses</span>
            <span className="text-lg sm:text-xl font-bold text-red-600">
              ₹{fmt(totalExpenses)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Summary Card ── */}
      <div className="mt-4 sm:mt-5 rounded-2xl border overflow-hidden shadow-sm"
        style={{ borderColor: balancePositive ? "#d1fae5" : "#fecdd3" }}
      >
        {/* Top: balance + savings rate + expense ratio */}
        <div className={`px-4 py-4 sm:px-6 sm:py-5 ${balancePositive ? "bg-gradient-to-br from-emerald-50 to-teal-50" : "bg-gradient-to-br from-red-50 to-rose-50"}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

            {/* Balance */}
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                Monthly Balance
              </p>
              <p className={`text-2xl sm:text-3xl font-bold ${balancePositive ? "text-emerald-600" : "text-red-600"}`}>
                {balancePositive ? "+" : "−"}₹{fmt(Math.abs(balance))}
              </p>
              <span className={`inline-block mt-1 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${balancePositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {balancePositive ? "✅ Surplus" : "⚠️ Deficit"}
              </span>
            </div>

            {/* Savings Rate */}
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                Savings Rate
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-teal-600">{savingsRate}%</p>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">of income saved</p>
            </div>

            {/* Expense Ratio */}
            <div>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                Expense Ratio
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-700">
                {totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">of income spent</p>
            </div>
          </div>

          {/* Balance bar */}
          {totalIncome > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 mb-1">
                <span>Expenses ({totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%)</span>
                <span>Savings ({savingsRate}%)</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-red-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0)}%` }}
                />
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
                />
              </div>
              <div className="flex gap-3 mt-1.5 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Expenses</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Savings</span>
              </div>
            </div>
          )}
        </div>

        {/* Expense Breakdown */}
        {expenseBreakdown.length > 0 && (
          <div className="border-t border-gray-100 bg-white">
            <button
              onClick={() => setShowBreakdown((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>Expense Breakdown</span>
              {showBreakdown ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showBreakdown && (
              <div className="px-4 pb-4 sm:px-6 sm:pb-5 space-y-2.5">
                {expenseBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <div className="w-20 sm:w-28 text-[11px] sm:text-xs font-medium text-gray-600 truncate">
                      {item.category}
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%`, background: item.color }}
                      />
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-gray-700 w-16 sm:w-20 text-right tabular-nums">
                      ₹{fmt(item.amount)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-400 w-7 text-right tabular-nums">
                      {item.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Recommendation */}
        {rec && (
          <div className={`mx-4 mb-4 sm:mx-5 sm:mb-5 mt-1 border rounded-xl p-3 sm:p-4 text-xs sm:text-sm ${recStyles[rec.type]}`}>
            <p className="font-semibold mb-0.5">{rec.icon} {rec.title}</p>
            <p className="leading-relaxed opacity-90">{rec.msg}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCalculator;