/**
 * Savings Goal Calculator Component
 * 
 * Calculate how much to save monthly to reach a savings goal
 * 
 * @component
 */

import React, { useState } from "react";
import { PiggyBank, TrendingUp, Calendar, IndianRupee } from "lucide-react";

const SavingsCalculator = ({ onClose }) => {
    const [goalAmount, setGoalAmount] = useState("");
    const [currentSavings, setCurrentSavings] = useState("");
    const [timeframe, setTimeframe] = useState("");
    const [interestRate, setInterestRate] = useState("");

    // Calculate monthly savings needed
    const calculateMonthlySavings = () => {
        const goal = parseFloat(goalAmount) || 0;
        const current = parseFloat(currentSavings) || 0;
        const months = parseInt(timeframe) || 1;
        const rate = parseFloat(interestRate) || 0;

        const remaining = goal - current;

        if (rate === 0) {
            // Simple calculation without interest
            return remaining / months;
        } else {
            // With compound interest
            const monthlyRate = rate / 100 / 12;
            const futureValueOfCurrent = current * Math.pow(1 + monthlyRate, months);
            const remainingNeeded = goal - futureValueOfCurrent;

            // PMT formula for future value
            const monthlyPayment = remainingNeeded * (monthlyRate / (Math.pow(1 + monthlyRate, months) - 1));
            return monthlyPayment;
        }
    };

    const monthlySavings = calculateMonthlySavings();
    const totalContributions = monthlySavings * (parseInt(timeframe) || 0);
    const interestEarned = (parseFloat(goalAmount) || 0) - (parseFloat(currentSavings) || 0) - totalContributions;

    // Reset all values
    const resetCalculator = () => {
        setGoalAmount("");
        setCurrentSavings("");
        setTimeframe("");
        setInterestRate("");
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <PiggyBank className="w-7 h-7 text-green-500 mr-3" />
                        Savings Goal Calculator
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Calculate how much to save each month to reach your goal</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={resetCalculator}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
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
                {/* Input Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Goal Details</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Savings Goal Amount
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="10000"
                                    value={goalAmount}
                                    onChange={(e) => setGoalAmount(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Savings
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="2000"
                                    value={currentSavings}
                                    onChange={(e) => setCurrentSavings(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Timeframe (months)
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="24"
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Interest Rate (% per year)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="5.0"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    className="w-full pr-8 pl-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <span className="absolute right-3 top-3 text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Enter 0 for no interest</p>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    {/* Monthly Savings */}
                    <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Monthly Savings Needed</span>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            ₹{monthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">per month</p>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Savings Breakdown</h4>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Starting Amount</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{(parseFloat(currentSavings) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Total Contributions</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{totalContributions.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Interest Earned</span>
                                <span className="font-semibold text-green-600">
                                    ₹{Math.max(0, interestEarned).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-semibold text-gray-900">Goal Amount</span>
                                <span className="text-xl font-bold text-gray-900">
                                    ₹{(parseFloat(goalAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    You'll reach your goal in{" "}
                                    <span className="font-semibold text-gray-900">{timeframe || 0} months</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    ({((parseInt(timeframe) || 0) / 12).toFixed(1)} years)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg mt-0.5">
                        <IndianRupee className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">💡 Savings Tips</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Automate your savings - set up automatic transfers each month</li>
                            <li>• Start with a high-yield savings account to maximize interest</li>
                            <li>• Review and adjust your goal regularly as your situation changes</li>
                            <li>• Consider saving extra during bonus months or windfalls</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavingsCalculator;