

import React, { useState } from "react";
import { PlusCircle, MinusCircle, IndianRupee, TrendingUp, TrendingDown } from "lucide-react";

const BudgetCalculator = ({ onClose }) => {
    const [income, setIncome] = useState([
        { id: 1, source: "Salary", amount: "" },
    ]);

    const [expenses, setExpenses] = useState([
        { id: 1, category: "Housing", amount: "" },
        { id: 2, category: "Food", amount: "" },
        { id: 3, category: "Transportation", amount: "" },
    ]);

    // Calculate totals
    const totalIncome = income.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    // Add new income source
    const addIncome = () => {
        setIncome([...income, { id: Date.now(), source: "", amount: "" }]);
    };

    // Add new expense
    const addExpense = () => {
        setExpenses([...expenses, { id: Date.now(), category: "", amount: "" }]);
    };

    // Update income
    const updateIncome = (id, field, value) => {
        setIncome(income.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // Update expense
    const updateExpense = (id, field, value) => {
        setExpenses(expenses.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // Remove income
    const removeIncome = (id) => {
        if (income.length > 1) {
            setIncome(income.filter(item => item.id !== id));
        }
    };

    // Remove expense
    const removeExpense = (id) => {
        if (expenses.length > 1) {
            setExpenses(expenses.filter(item => item.id !== id));
        }
    };

    // Reset all values
    const resetCalculator = () => {
        setIncome([{ id: 1, source: "Salary", amount: "" }]);
        setExpenses([
            { id: 1, category: "Housing", amount: "" },
            { id: 2, category: "Food", amount: "" },
            { id: 3, category: "Transportation", amount: "" },
        ]);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Budget Calculator</h2>
                    <p className="text-gray-600 text-sm mt-1">Plan your monthly income and expenses</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={resetCalculator}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Reset
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                            Income
                        </h3>
                        <button
                            onClick={addIncome}
                            className="text-green-600 hover:text-green-700 flex items-center text-sm"
                        >
                            <PlusCircle className="w-4 h-4 mr-1" />
                            Add
                        </button>
                    </div>

                    <div className="space-y-3">
                        {income.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Source"
                                    value={item.source}
                                    onChange={(e) => updateIncome(item.id, 'source', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <div className="relative flex-1">
                                    <IndianRupee className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={item.amount}
                                        onChange={(e) => updateIncome(item.id, 'amount', e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                {income.length > 1 && (
                                    <button
                                        onClick={() => removeIncome(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <MinusCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Total Income:</span>
                            <span className="text-xl font-bold text-green-600">
                                ₹{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expenses Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                            Expenses
                        </h3>
                        <button
                            onClick={addExpense}
                            className="text-red-600 hover:text-red-700 flex items-center text-sm"
                        >
                            <PlusCircle className="w-4 h-4 mr-1" />
                            Add
                        </button>
                    </div>

                    <div className="space-y-3">
                        {expenses.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Category"
                                    value={item.category}
                                    onChange={(e) => updateExpense(item.id, 'category', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                <div className="relative flex-1">
                                    <IndianRupee className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={item.amount}
                                        onChange={(e) => updateExpense(item.id, 'amount', e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                                {expenses.length > 1 && (
                                    <button
                                        onClick={() => removeExpense(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <MinusCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Total Expenses:</span>
                            <span className="text-xl font-bold text-red-600">
                                ₹{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 bg-linear-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Monthly Balance</p>
                        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {balance >= 0 ? '✅ Surplus' : '⚠️ Deficit'}
                        </p>
                    </div>

                    <div className="text-right">
                        <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">Savings Rate</p>
                            <p className="text-2xl font-bold text-teal-600">
                                {totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {balance < 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            <strong>⚠️ Warning:</strong> Your expenses exceed your income.
                            Consider reducing expenses or finding additional income sources.
                        </p>
                    </div>
                )}

                {balance >= 0 && balance < totalIncome * 0.2 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>💡 Tip:</strong> Try to save at least 20% of your income for better financial health.
                        </p>
                    </div>
                )}

                {balance >= totalIncome * 0.2 && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            <strong>🎉 Great job!</strong> You're saving {Math.round((balance / totalIncome) * 100)}% of your income!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetCalculator;