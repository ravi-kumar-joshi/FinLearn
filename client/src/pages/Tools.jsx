import React, { useState, lazy, Suspense } from 'react';
import Navbar from '../Components/Dashboard/Navbar';
import SideBar from '../Components/Dashboard/SideBar';

// Lazy load calculators for better performance
const BudgetCalculator = lazy(() => import('../Components/FinTools/BudgetCalculator'));
const InvestmentCalculator = lazy(() => import('../Components/FinTools/InvestmentCalculator'));
const LoanCalculator = lazy(() => import('../Components/FinTools/LoanCalculator'));
const SavingsCalculator = lazy(() => import('../Components/FinTools/SavingsCalculator'));
const SIPCalculator = lazy(() => import('../Components/FinTools/SIPCalculator'));
const InflationCalculator = lazy(() => import('../Components/FinTools/InflationCalculator'));
const EmergencyFundCalculator = lazy(() => import('../Components/FinTools/EmergencyFundCalculator'));

import {
    Wallet, TrendingUp, Landmark, PiggyBank,
    BarChart2, AlertTriangle, ShieldCheck, Scale, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarOpen } from '../hooks/useSidebarOpen';

const TABS = [
    { key: 'budget', label: 'Budget', icon: Wallet, component: BudgetCalculator },
    { key: 'investment', label: 'Investment', icon: TrendingUp, component: InvestmentCalculator },
    { key: 'loan', label: 'Loan', icon: Landmark, component: LoanCalculator },
    { key: 'savings', label: 'Savings', icon: PiggyBank, component: SavingsCalculator },
    { key: 'sip', label: 'SIP', icon: BarChart2, component: SIPCalculator },
    { key: 'inflation', label: 'Inflation', icon: AlertTriangle, component: InflationCalculator },
    { key: 'emergency', label: 'Emergency Fund', icon: ShieldCheck, component: EmergencyFundCalculator },
];

const Tools = () => {
    const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
    const [activeTab, setActiveTab] = useState('budget');

    const ActiveComponent = TABS.find(t => t.key === activeTab)?.component;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Page heading */}
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="mb-6"
                    >
                        <h1 className="text-3xl font-bold text-gray-900">Financial Tools</h1>
                        <p className="text-gray-500 text-sm mt-1">Calculate, plan and make smarter financial decisions.</p>
                    </motion.div>

                    {/* Tabs — scrollable row */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                        className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto pb-0 scrollbar-none"
                    >
                        {TABS.map(({ key, label, icon: Icon }, i) => (
                            <motion.button
                                key={key}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.15 + i * 0.05, ease: 'easeOut' }}
                                onClick={() => setActiveTab(key)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm rounded-t-xl border border-b-0 whitespace-nowrap transition-all duration-200 ${activeTab === key
                                    ? 'bg-white border-gray-200 text-indigo-600 font-semibold shadow-sm'
                                    : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={15} />
                                {label}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Calculator panel */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                        >
                            <Suspense fallback={<div className="p-10 text-center">Loading Calculator...</div>}>
                                {ActiveComponent && <ActiveComponent />}
                            </Suspense>
                        </motion.div>
                    </AnimatePresence>

                </div>
            </main>
        </div>
    );
};

export default Tools;