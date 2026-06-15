import React, { useState } from 'react'

export default function Settings() {
    const [settings, setSettings] = useState({
        siteName: 'FinLearn',
        siteDescription: 'Learn finance the fun way',
        maintenanceMode: false,
        allowRegistration: true,
        xpMultiplier: 1,
        dailyXPCap: 500,
        emailNotifications: true,
        darkMode: true,
    })

    const [saved, setSaved] = useState(false)

    function handleChange(e) {
        const { name, value, type, checked } = e.target
        setSettings(s => ({
            ...s,
            [name]: type === 'checkbox' ? checked : value
        }))
        setSaved(false)
    }

    function handleSave() {
        // In a real app, this would save to the backend
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
                    <p className="text-slate-400 mt-1">Manage platform configuration</p>
                </div>

                {/* Success Message */}
                {saved && (
                    <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-4">
                        <p className="text-emerald-400 text-sm">Settings saved successfully!</p>
                    </div>
                )}

                {/* General Settings */}
                <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700">
                    <h3 className="font-semibold text-slate-200 mb-4">General Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Site Name</label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Site Description</label>
                            <textarea
                                name="siteDescription"
                                value={settings.siteDescription}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* User Settings */}
                <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700">
                    <h3 className="font-semibold text-slate-200 mb-4">User Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-slate-200">Allow Registration</div>
                                <div className="text-sm text-slate-400">Enable new user sign-ups</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="allowRegistration"
                                    checked={settings.allowRegistration}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-slate-200">Email Notifications</div>
                                <div className="text-sm text-slate-400">Send email notifications to users</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="emailNotifications"
                                    checked={settings.emailNotifications}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Gamification Settings */}
                <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700">
                    <h3 className="font-semibold text-slate-200 mb-4">Gamification Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">XP Multiplier</label>
                            <input
                                type="number"
                                name="xpMultiplier"
                                value={settings.xpMultiplier}
                                onChange={handleChange}
                                step="0.1"
                                min="0.1"
                                max="5"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">Multiply all XP rewards by this factor</p>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Daily XP Cap</label>
                            <input
                                type="number"
                                name="dailyXPCap"
                                value={settings.dailyXPCap}
                                onChange={handleChange}
                                min="0"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 mt-1">Maximum XP a user can earn per day</p>
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700">
                    <h3 className="font-semibold text-slate-200 mb-4">System Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-slate-200">Maintenance Mode</div>
                                <div className="text-sm text-slate-400">Disable site for non-admin users</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-slate-200">Dark Mode</div>
                                <div className="text-sm text-slate-400">Default theme for the platform</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="darkMode"
                                    checked={settings.darkMode}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
        </div>
    )
}
