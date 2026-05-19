/**
 * Investment Growth Calculator Component
 * 
 * Calculate investment returns with compound interest
 * 
 * @component
 */

import React, { useState } from "react";
import { TrendingUp, IndianRupee, Calendar, Percent } from "lucide-react";

const InvestmentCalculator = ({ onClose }) => {
    const [initialInvestment, setInitialInvestment] = useState("");
    const [monthlyContribution, setMonthlyContribution] = useState("");
    const [annualReturn, setAnnualReturn] = useState("");
    const [years, setYears] = useState("");

    // Calculate investment growth
    const calculateInvestment = () => {
        const initial = parseFloat(initialInvestment) || 0;
        const monthly = parseFloat(monthlyContribution) || 0;
        const rate = parseFloat(annualReturn) / 100 || 0;
        const time = parseInt(years) || 0;
        const months = time * 12;

        // Future value with monthly contributions
        const monthlyRate = rate / 12;
        const futureValueInitial = initial * Math.pow(1 + monthlyRate, months);
        const futureValueContributions = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

        return futureValueInitial + futureValueContributions;
    };

    const futureValue = calculateInvestment();
    const totalContributions = (parseFloat(initialInvestment) || 0) +
        (parseFloat(monthlyContribution) || 0) * (parseInt(years) || 0) * 12;
    const totalReturn = futureValue - totalContributions;
    const returnPercentage = totalContributions > 0 ? (totalReturn / totalContributions) * 100 : 0;

    // Reset all values
    const resetCalculator = () => {
        setInitialInvestment("");
        setMonthlyContribution("");
        setAnnualReturn("");
        setYears("");
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <TrendingUp className="w-7 h-7 text-purple-500 mr-3" />
                        Investment Growth Calculator
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">See how your investments can grow over time</p>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Details</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Initial Investment
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="10000"
                                    value={initialInvestment}
                                    onChange={(e) => setInitialInvestment(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Monthly Contribution
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="500"
                                    value={monthlyContribution}
                                    onChange={(e) => setMonthlyContribution(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Annual Return (%)
                            </label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="7.0"
                                    value={annualReturn}
                                    onChange={(e) => setAnnualReturn(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">S&P 500 historical avg: ~10%</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Time Period (years)
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="20"
                                    value={years}
                                    onChange={(e) => setYears(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    {/* Future Value */}
                    <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Future Investment Value</span>
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-3xl font-bold text-purple-600">
                            ₹{futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">in {years || 0} years</p>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Investment Breakdown</h4>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Initial Investment</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{(parseFloat(initialInvestment) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Total Contributions</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{totalContributions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Total Return</span>
                                <span className="font-semibold text-purple-600">
                                    ₹{totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-semibold text-gray-900">Return on Investment</span>
                                <span className="text-xl font-bold text-purple-600">
                                    {returnPercentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Growth Visualization</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Contributions</span>
                                <span className="font-medium">{totalContributions > 0 ? ((totalContributions / futureValue) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-blue-500 h-3 rounded-full transition-all"
                                    style={{ width: `${totalContributions > 0 ? (totalContributions / futureValue) * 100 : 0}%` }}
                                ></div>
                            </div>

                            <div className="flex justify-between text-sm mt-3">
                                <span className="text-gray-600">Investment Returns</span>
                                <span className="font-medium">{totalContributions > 0 ? ((totalReturn / futureValue) * 100).toFixed(0) : 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-purple-500 h-3 rounded-full transition-all"
                                    style={{ width: `${totalContributions > 0 ? (totalReturn / futureValue) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                    <div className="bg-purple-500 p-2 rounded-lg mt-0.5">
                        <IndianRupee className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">📈 Investment Tips</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Start investing early - time in the market beats timing the market</li>
                            <li>• Diversify your portfolio to reduce risk</li>
                            <li>• Consider low-cost index funds for long-term growth</li>
                            <li>• Don't panic during market downturns - stay focused on long-term goals</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentCalculator;