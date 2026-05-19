/**
 * Loan EMI Calculator Component
 * 
 * Calculate monthly loan payments (EMI)
 * 
 * @component
 */

import React, { useState } from "react";
import { IndianRupee, Calendar, Percent, TrendingDown } from "lucide-react";

const LoanCalculator = ({ onClose }) => {
    const [loanAmount, setLoanAmount] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [loanTerm, setLoanTerm] = useState("");

    // Calculate EMI (Equated Monthly Installment)
    const calculateEMI = () => {
        const principal = parseFloat(loanAmount) || 0;
        const rate = (parseFloat(interestRate) / 100) / 12 || 0;
        const months = parseInt(loanTerm) * 12 || 1;

        if (rate === 0) {
            return principal / months;
        }

        // EMI Formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
        const emi = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
        return emi;
    };

    const emi = calculateEMI();
    const totalPayment = emi * (parseInt(loanTerm) || 0) * 12;
    const totalInterest = totalPayment - (parseFloat(loanAmount) || 0);
    const interestPercentage = (parseFloat(loanAmount) || 0) > 0 ? (totalInterest / (parseFloat(loanAmount) || 0)) * 100 : 0;

    // Reset all values
    const resetCalculator = () => {
        setLoanAmount("");
        setInterestRate("");
        setLoanTerm("");
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <IndianRupee className="w-7 h-7 text-orange-500 mr-3" />
                        Loan EMI Calculator
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Calculate your monthly loan payments</p>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loan Amount
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="200000"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Principal amount</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Annual Interest Rate (%)
                            </label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="6.5"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loan Term (years)
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="30"
                                    value={loanTerm}
                                    onChange={(e) => setLoanTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Quick Loan Type Examples */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">Quick Examples:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        setLoanAmount("200000");
                                        setInterestRate("6.5");
                                        setLoanTerm("30");
                                    }}
                                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                                >
                                    🏠 Home Loan
                                </button>
                                <button
                                    onClick={() => {
                                        setLoanAmount("25000");
                                        setInterestRate("4.5");
                                        setLoanTerm("5");
                                    }}
                                    className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                                >
                                    🚗 Car Loan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    {/* Monthly EMI */}
                    <div className="bg-linear-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Monthly EMI</span>
                            <TrendingDown className="w-5 h-5 text-orange-600" />
                        </div>
                        <p className="text-3xl font-bold text-orange-600">
                            ₹{emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">per month</p>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Loan Summary</h4>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Loan Amount</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{(parseFloat(loanAmount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Total Interest</span>
                                <span className="font-semibold text-red-600">
                                    ₹{totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Total Payment</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{totalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-semibold text-gray-900">Interest Rate Impact</span>
                                <span className="text-xl font-bold text-red-600">
                                    +{interestPercentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Schedule */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Payment Schedule</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Number of Payments</span>
                                <span className="font-medium">{(parseInt(loanTerm) || 0) * 12} months</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Years</span>
                                <span className="font-medium">{loanTerm || 0} years</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Interest Rate</span>
                                <span className="font-medium">{interestRate || 0}% p.a.</span>
                            </div>
                        </div>
                    </div>

                    {/* Pie Chart Visualization */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Payment Distribution</h4>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Principal</span>
                                    <span className="font-medium">
                                        {totalPayment > 0 ? (((parseFloat(loanAmount) || 0) / totalPayment) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                        style={{ width: `${totalPayment > 0 ? ((parseFloat(loanAmount) || 0) / totalPayment) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Interest</span>
                                    <span className="font-medium">
                                        {totalPayment > 0 ? ((totalInterest / totalPayment) * 100).toFixed(1) : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full transition-all"
                                        style={{ width: `${totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                    <div className="bg-orange-500 p-2 rounded-lg mt-0.5">
                        <IndianRupee className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">💰 Loan Tips</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Make extra payments to principal to reduce total interest</li>
                            <li>• Compare rates from multiple lenders before committing</li>
                            <li>• Consider shorter loan terms to save on interest (higher EMI, less total cost)</li>
                            <li>• Maintain a good credit score to qualify for better interest rates</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanCalculator;