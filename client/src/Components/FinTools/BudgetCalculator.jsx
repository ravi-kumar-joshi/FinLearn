import React, { useState, useMemo, useRef } from "react";
import { PlusCircle, MinusCircle, IndianRupee, TrendingUp, TrendingDown, Trash2 } from "lucide-react";

const BudgetCalculator = ({ onClose }) => {
    const [income, setIncome] = useState([
        { id: 1, source: "Salary", amount: "" },
    ]);
    const [expenses, setExpenses] = useState([
        { id: 1, category: "Housing", amount: "" },
        { id: 2, category: "Food", amount: "" },
        { id: 3, category: "Transportation", amount: "" },
    ]);

    const newIncomeRef = useRef(null);
    const newExpenseRef = useRef(null);

    // Optimized Calculations
    const totalIncome = useMemo(() => {
        return income.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    }, [income]);

    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    }, [expenses]);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

    // Expense Breakdown
    const expenseBreakdown = useMemo(() => {
        if (totalExpenses === 0) return [];
        return expenses
            .filter(item => Number(item.amount) > 0)
            .map(item => ({
                category: item.category || "Other",
                amount: Number(item.amount),
                percentage: Math.round((Number(item.amount) / totalExpenses) * 100)
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses, totalExpenses]);

    // Add Income
    const addIncome = () => {
        const newItem = { id: Date.now(), source: "", amount: "" };
        setIncome([...income, newItem]);
        setTimeout(() => newIncomeRef.current?.focus(), 100);
    };

    // Add Expense with suggestions
    const expenseSuggestions = ["Rent", "Food", "Transportation", "Utilities", "Groceries", "Healthcare", "Entertainment", "Shopping", "Education", "Miscellaneous"];

    const addExpense = () => {
        const newItem = { id: Date.now(), category: "", amount: "" };
        setExpenses([...expenses, newItem]);
        setTimeout(() => newExpenseRef.current?.focus(), 100);
    };

    // Update functions
    const updateIncome = (id, field, value) => {
        setIncome(income.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const updateExpense = (id, field, value) => {
        setExpenses(expenses.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // Remove functions
    const removeIncome = (id) => {
        if (income.length > 1) {
            setIncome(income.filter(item => item.id !== id));
        }
    };

    const removeExpense = (id) => {
        if (expenses.length > 1) {
            setExpenses(expenses.filter(item => item.id !== id));
        }
    };

    // Reset
    const resetCalculator = () => {
        setIncome([{ id: 1, source: "Salary", amount: "" }]);
        setExpenses([
            { id: 1, category: "Housing", amount: "" },
            { id: 2, category: "Food", amount: "" },
            { id: 3, category: "Transportation", amount: "" },
        ]);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Calculator</h2>
                    <p className="text-gray-600 text-sm mt-1">Plan your monthly finances</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={resetCalculator}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:scale-95"
                    >
                        Reset
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            Income
                        </h3>
                        <button
                            onClick={addIncome}
                            className="flex items-center gap-1.5 text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Add
                        </button>
                    </div>

                    <div className="space-y-4">
                        {income.map((item, index) => (
                            <div key={item.id} className="flex gap-3 animate-in fade-in">
                                <input
                                    type="text"
                                    placeholder="Source (e.g. Salary)"
                                    value={item.source}
                                    onChange={(e) => updateIncome(item.id, 'source', e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                />
                                <div className="relative w-36">
                                    <IndianRupee className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={item.amount}
                                        onChange={(e) => updateIncome(item.id, 'amount', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addIncome()}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                        ref={index === income.length - 1 ? newIncomeRef : null}
                                    />
                                </div>
                                {income.length > 1 && (
                                    <button
                                        onClick={() => removeIncome(item.id)}
                                        className="text-red-500 hover:text-red-600 p-3 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <MinusCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Total Income</span>
                            <span className="text-2xl font-bold text-green-600">
                                ₹{totalIncome.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expenses Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-500" />
                            Expenses
                        </h3>
                        <button
                            onClick={addExpense}
                            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Add
                        </button>
                    </div>

                    <div className="space-y-4">
                        {expenses.map((item, index) => (
                            <div key={item.id} className="flex gap-3 animate-in fade-in">
                                <input
                                    type="text"
                                    placeholder="Category"
                                    value={item.category}
                                    onChange={(e) => updateExpense(item.id, 'category', e.target.value)}
                                    list="expense-categories"
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                    ref={index === expenses.length - 1 ? newExpenseRef : null}
                                />
                                <div className="relative w-36">
                                    <IndianRupee className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={item.amount}
                                        onChange={(e) => updateExpense(item.id, 'amount', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addExpense()}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                {expenses.length > 1 && (
                                    <button
                                        onClick={() => removeExpense(item.id)}
                                        className="text-red-500 hover:text-red-600 p-3 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <MinusCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <datalist id="expense-categories">
                        {expenseSuggestions.map(cat => (
                            <option key={cat} value={cat} />
                        ))}
                    </datalist>

                    <div className="mt-6 pt-5 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Total Expenses</span>
                            <span className="text-2xl font-bold text-red-600">
                                ₹{totalExpenses.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary & Breakdown */}
            <div className="mt-8 bg-gradient-to-br from-teal-50 to-blue-50 rounded-3xl p-6 sm:p-8 border border-teal-100">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Monthly Balance</p>
                        <p className={`text-4xl sm:text-5xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {balance >= 0 ? '+' : ''}₹{Math.abs(balance).toLocaleString('en-IN')}
                        </p>
                        <p className="mt-2 text-lg font-medium">
                            {balance >= 0 ? '✅ Surplus' : '⚠️ Deficit'}
                        </p>
                    </div>

                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">Savings Rate</p>
                        <div className="text-4xl font-bold text-teal-600">{savingsRate}%</div>
                    </div>
                </div>

                {/* Expense Breakdown */}
                {totalExpenses > 0 && (
                    <div className="mt-8">
                        <h4 className="font-semibold text-gray-700 mb-3">Expense Breakdown</h4>
                        <div className="space-y-3">
                            {expenseBreakdown.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-28 text-sm font-medium text-gray-600 truncate">
                                        {item.category}
                                    </div>
                                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full transition-all"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-sm font-medium w-16 text-right">
                                        ₹{item.amount}
                                    </div>
                                    <div className="text-xs text-gray-500 w-10 text-right">
                                        {item.percentage}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Smart Recommendations */}
                {balance < 0 && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800">
                        <strong>⚠️ Warning:</strong> Your expenses exceed income. Consider cutting costs or increasing income.
                    </div>
                )}

                {balance >= 0 && savingsRate < 20 && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-yellow-800">
                        <strong>💡 Suggestion:</strong> Aim to save at least 20% of your income for financial stability.
                    </div>
                )}

                {savingsRate >= 20 && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5 text-green-800">
                        <strong>🎉 Excellent!</strong> You're saving {savingsRate}% of your income. Keep it up!
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetCalculator;