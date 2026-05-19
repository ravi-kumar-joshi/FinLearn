import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Components/Dashboard/Navbar";
import SideBar from "../Components/Dashboard/SideBar";
import apis from "../utils/apis";
import httpAction from "../utils/httpAction";
import toast from "react-hot-toast";
import { useSidebarOpen } from "../hooks/useSidebarOpen";

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.055, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "profile",       label: "Profile",       emoji: "👤" },
  { id: "security",      label: "Security",      emoji: "🔒" },
  { id: "notifications", label: "Notifications", emoji: "🔔" },
  { id: "preferences",   label: "Preferences",   emoji: "⚙️" },
];

// ─── Loading Skeleton ────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-5 p-4">
      <div className="h-36 bg-gray-100 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-80 bg-gray-100 rounded-2xl" />
    </div>
  );
}

// ─── Reusable Field ───────────────────────────────────────────────────────────
const Field = ({ label, children, error, hint }) => (
  <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
    {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
  </motion.div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = ({ value, onChange, type = "text", placeholder, disabled, error, maxLength, rightSlot }) => (
  <div className="relative">
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`w-full px-4 py-2.5 ${rightSlot ? "pr-10" : ""} rounded-xl border text-sm text-gray-800 placeholder-gray-300
        transition-all duration-200 focus:outline-none focus:ring-2
        ${error
          ? "border-red-300 bg-red-50 focus:ring-red-300/40 focus:border-red-400"
          : "border-gray-200 bg-gray-50 focus:ring-teal-400/30 focus:border-teal-400 focus:bg-white"
        }
        disabled:opacity-50 disabled:cursor-not-allowed`}
    />
    {rightSlot && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
    )}
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────
const Select = ({ value, onChange, options, placeholder }) => (
  <select
    value={value ?? ""}
    onChange={(e) => onChange?.(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800
      focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 focus:bg-white transition-all"
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
);

// ─── Textarea ─────────────────────────────────────────────────────────────────
const Textarea = ({ value, onChange, placeholder, maxLength }) => (
  <textarea
    rows={3}
    value={value ?? ""}
    onChange={(e) => onChange?.(e.target.value)}
    placeholder={placeholder}
    maxLength={maxLength}
    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800
      placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400
      focus:bg-white resize-none transition-all duration-200"
  />
);

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 gap-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0
        focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:ring-offset-1
        ${checked ? "bg-teal-500" : "bg-gray-200"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        style={{ left: checked ? "calc(100% - 22px)" : "2px" }}
      />
    </button>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ emoji, label, value, colorClass }) => (
  <motion.div
    variants={fadeUp}
    className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colorClass}`}>
      {emoji}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 font-medium truncate">{label}</p>
      <p className="text-lg font-bold text-gray-900 leading-tight truncate">{value}</p>
    </div>
  </motion.div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, subtitle, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 ${className}`}>
    {title && (
      <div className="mb-5">
        <h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

// ─── Save Toast ───────────────────────────────────────────────────────────────
// BUG FIX: z-[9999] instead of invalid z-999; correct positioning
const SaveToast = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5
          bg-teal-600 text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-xl shadow-teal-500/30 pointer-events-none"
      >
        ✅ Profile updated successfully!
      </motion.div>
    )}
  </AnimatePresence>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// BUG FIX: Extracted as a stable component (not defined inside render body),
// so tab switching doesn't unmount/remount and lose input focus / local state.
const ProfileTab = ({ user, form, setForm, saving, onSave, onDiscard, onAvatarChange, avatarPreview, formErrors, highlightAvatar }) => {
  const fileRef = useRef();
  const initials = (form.name || "U").substring(0, 2).toUpperCase();

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">

      {/* Hero banner */}
      <motion.div
        variants={fadeUp}
        className="relative rounded-2xl overflow-hidden p-5 sm:p-6"
        style={{ background: "linear-gradient(135deg,#0d9488 0%,#0f766e 55%,#065f46 100%)" }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-16 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar — BUG FIX: ring conflict resolved; highlight is on outer wrapper only */}
          <div
            className={`relative group cursor-pointer transition-all duration-500 ${highlightAvatar ? "scale-105" : ""}`}
            onClick={() => fileRef.current?.click()}
          >
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg"
              style={{
                outline: highlightAvatar ? "3px solid #6ee7b7" : "3px solid rgba(255,255,255,0.3)",
                outlineOffset: "2px",
                transition: "outline 0.4s",
              }}
            >
              {avatarPreview || user?.profileImage ? (
                <img src={avatarPreview || user.profileImage} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-white text-lg">📷</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{form.name || "Your Name"}</h2>
            <p className="text-teal-100 text-sm mt-0.5 truncate">{user?.email || "—"}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {form.financialGoal && (
                <span className="bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full">
                  🎯 {form.financialGoal}
                </span>
              )}
              {form.experience && (
                <span className="bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full">
                  📈 {form.experience}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-shrink-0 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            Change Photo
          </button>
        </div>
      </motion.div>

      {/* Stats row — BUG FIX: user?.xp?.totalXP (not user?.xp which is an object) */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <StatCard emoji="📚" label="Courses Enrolled" value={user?.coursesEnrolled ?? "0"} colorClass="bg-teal-50" />
        <StatCard emoji="🏅" label="Badges Earned"   value={user?.badges ?? "0"}          colorClass="bg-emerald-50" />
        <StatCard emoji="🔥" label="Day Streak"       value={`${user?.streak ?? 0}d`}      colorClass="bg-orange-50" />
        <StatCard emoji="⚡" label="Total XP"         value={(user?.xp?.totalXP ?? user?.xp ?? 0).toLocaleString()} colorClass="bg-amber-50" />
      </motion.div>

      {/* Personal info form */}
      <SectionCard title="Personal Information">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <Field label="Full Name" error={formErrors.name}>
            <Input
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Jane Doe"
              error={formErrors.name}
              maxLength={80}
            />
          </Field>

          <Field label="Email Address" hint="Change email through the email verification flow.">
            <Input value={user?.email ?? ""} type="email" disabled />
          </Field>

          <Field label="Phone Number" error={formErrors.phone}>
            <Input
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="+91 98765 43210"
              error={formErrors.phone}
              maxLength={20}
            />
          </Field>

          <Field label="Location">
            <Input
              value={form.location}
              onChange={(v) => setForm((f) => ({ ...f, location: v }))}
              placeholder="Mumbai, India"
              maxLength={100}
            />
          </Field>

          <Field label="Occupation" error={formErrors.occupation}>
            <Input
              value={form.occupation}
              onChange={(v) => setForm((f) => ({ ...f, occupation: v }))}
              placeholder="Financial Analyst"
              error={formErrors.occupation}
              maxLength={100}
            />
          </Field>

          <Field label="Experience Level">
            <Select
              value={form.experience}
              onChange={(v) => setForm((f) => ({ ...f, experience: v }))}
              placeholder="Select level"
              options={["Beginner", "Intermediate", "Advanced", "Expert"]}
            />
          </Field>

          <Field label="Financial Goal">
            <Select
              value={form.financialGoal}
              onChange={(v) => setForm((f) => ({ ...f, financialGoal: v }))}
              placeholder="Select a goal"
              options={[
                "Retirement Planning", "Wealth Building", "Debt Freedom",
                "Emergency Fund", "Home Purchase", "Business Investment",
              ]}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Bio" error={formErrors.bio} hint={`${(form.bio || "").length}/500`}>
              <Textarea
                value={form.bio}
                onChange={(v) => setForm((f) => ({ ...f, bio: v }))}
                placeholder="Tell us about your financial journey…"
                maxLength={500}
              />
            </Field>
          </div>
        </motion.div>
      </SectionCard>

      {/* Actions — BUG FIX: Discard resets form to fetched data, not page reload */}
      <motion.div variants={fadeUp} className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onDiscard}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Discard Changes
        </button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving…
            </>
          ) : "Save Changes"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SECURITY TAB ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// BUG FIX: Password form now has a real submit handler; show/hide per field.
const SecurityTab = () => {
  const [pw, setPw] = useState({ current: "", newPass: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [pwErrors, setPwErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const toggleShow = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  const EyeBtn = ({ field }) => (
    <button type="button" onClick={() => toggleShow(field)}
      className="text-gray-400 hover:text-gray-600 transition-colors p-0.5">
      {show[field] ? "🙈" : "👁️"}
    </button>
  );

  const validatePw = () => {
    const errs = {};
    if (!pw.current) errs.current = "Current password is required";
    if (!pw.newPass || pw.newPass.length < 8) errs.newPass = "Password must be at least 8 characters";
    if (pw.newPass !== pw.confirm) errs.confirm = "Passwords do not match";
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdatePw = async () => {
    if (!validatePw()) return;
    setSubmitting(true);
    try {
      const res = await httpAction({
        url: apis().changePassword,
        method: "PUT",
        body: { currentPassword: pw.current, newPassword: pw.newPass },
      });
      if (res?.status) {
        toast.success("Password updated successfully!");
        setPw({ current: "", newPass: "", confirm: "" });
        setPwErrors({});
      } else {
        toast.error(res?.message || "Failed to update password");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const PW_FIELDS = [
    { key: "current", label: "Current Password",     placeholder: "Enter current password" },
    { key: "newPass", label: "New Password",          placeholder: "Minimum 8 characters" },
    { key: "confirm", label: "Confirm New Password",  placeholder: "Repeat new password" },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">

      <SectionCard title="Change Password">
        <div className="space-y-4">
          {PW_FIELDS.map(({ key, label, placeholder }) => (
            <Field key={key} label={label} error={pwErrors[key]}>
              <Input
                type={show[key] ? "text" : "password"}
                value={pw[key]}
                onChange={(v) => { setPw((p) => ({ ...p, [key]: v })); setPwErrors((e) => ({ ...e, [key]: "" })); }}
                placeholder={placeholder}
                error={pwErrors[key]}
                rightSlot={<EyeBtn field={key} />}
              />
            </Field>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={submitting}
            onClick={handleUpdatePw}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center gap-2"
          >
            {submitting
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Updating…</>
              : "Update Password"}
          </motion.button>
        </div>
      </SectionCard>

      <SectionCard title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account.">
        <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl border border-teal-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center text-lg">🔐</div>
            <div>
              <p className="text-sm font-semibold text-teal-800">Authenticator App</p>
              <p className="text-xs text-teal-600">Not yet configured</p>
            </div>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 border border-teal-300 hover:border-teal-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Set Up
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Active Sessions">
        {[
          { device: "Chrome on macOS",  location: "Mumbai, IN", time: "Active now", active: true },
          { device: "Safari on iPhone", location: "Mumbai, IN", time: "2 hours ago", active: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.active ? "bg-emerald-400 animate-pulse" : "bg-gray-300"}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{s.device}</p>
                <p className="text-xs text-gray-400">{s.location} · {s.time}</p>
              </div>
            </div>
            {!s.active && (
              <button type="button" className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors flex-shrink-0">
                Revoke
              </button>
            )}
          </div>
        ))}
      </SectionCard>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NOTIFICATIONS TAB ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const NotificationsTab = () => {
  const [notifs, setNotifs] = useState({
    courseUpdates: true, newLessons: true, achievements: true,
    weeklyDigest: false, marketInsights: true, promotions: false, appPush: false,
  });
  const toggle = useCallback((k) => setNotifs((p) => ({ ...p, [k]: !p[k] })), []);

  const GROUPS = [
    {
      title: "Learning Activity",
      items: [
        { key: "courseUpdates", label: "Course Updates",  desc: "New content in enrolled courses" },
        { key: "newLessons",    label: "New Lessons",     desc: "Reminders for upcoming lessons" },
        { key: "achievements",  label: "Achievements",    desc: "Badges, milestones and XP updates" },
      ],
    },
    {
      title: "Financial Insights",
      items: [
        { key: "weeklyDigest",   label: "Weekly Digest",   desc: "Market trends summary every Monday" },
        { key: "marketInsights", label: "Market Insights", desc: "Breaking financial news and analysis" },
      ],
    },
    {
      title: "Marketing",
      items: [
        { key: "promotions", label: "Promotions & Offers", desc: "Deals, discounts and new launches" },
        { key: "appPush",    label: "Push Notifications",  desc: "Real-time alerts on your device" },
      ],
    },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
      {GROUPS.map((g) => (
        <motion.div key={g.title} variants={fadeUp}>
          <SectionCard title={g.title}>
            {g.items.map((item) => (
              <Toggle key={item.key} checked={notifs[item.key]} onChange={() => toggle(item.key)} label={item.label} desc={item.desc} />
            ))}
          </SectionCard>
        </motion.div>
      ))}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PREFERENCES TAB ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const PreferencesTab = () => {
  const [prefs, setPrefs] = useState({ language: "English", currency: "INR", timezone: "Asia/Kolkata", theme: "Light" });
  const [learningPrefs, setLearningPrefs] = useState({ autoPlay: true, subtitles: false, reminder: true });
  const toggleLP = (k) => setLearningPrefs((p) => ({ ...p, [k]: !p[k] }));

  const REGIONAL = [
    { label: "Language", key: "language", options: ["English", "Hindi", "Gujarati", "Tamil", "Telugu"] },
    { label: "Currency", key: "currency", options: ["INR", "USD", "EUR", "GBP", "AED"] },
    { label: "Timezone", key: "timezone", options: ["Asia/Kolkata", "Asia/Dubai", "America/New_York", "Europe/London"] },
    { label: "Theme",    key: "theme",    options: ["Light", "System"] },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">

      <motion.div variants={fadeUp}>
        <SectionCard title="Regional Settings">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {REGIONAL.map(({ label, key, options }) => (
              <Field key={key} label={label}>
                <Select value={prefs[key]} onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))} options={options} />
              </Field>
            ))}
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SectionCard title="Learning Preferences" subtitle="Customize how FinLearn works for you.">
          <Toggle checked={learningPrefs.autoPlay}  onChange={() => toggleLP("autoPlay")}  label="Auto-play next lesson"         desc="Continue to next lesson automatically" />
          <Toggle checked={learningPrefs.subtitles} onChange={() => toggleLP("subtitles")} label="Show subtitles by default"     desc="Display captions on all video lessons" />
          <Toggle checked={learningPrefs.reminder}  onChange={() => toggleLP("reminder")}  label="Daily learning reminder"       desc="Keep your streak alive with a daily nudge" />
        </SectionCard>
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className="border border-red-100 bg-red-50 rounded-2xl p-5 sm:p-6">
          <h3 className="text-[15px] font-bold text-red-700 mb-1">Danger Zone</h3>
          <p className="text-xs text-red-400 mb-4">These actions are permanent and cannot be undone.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button"
              className="px-4 py-2.5 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-100 rounded-xl transition-colors">
              Export My Data
            </button>
            <button type="button"
              className="px-4 py-2.5 text-sm font-medium text-red-700 border border-red-300 hover:bg-red-100 rounded-xl transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen();
  const [activeTab, setActiveTab]     = useState("profile");
  const [user, setUser]               = useState({});
  const [saving, setSaving]           = useState(false);
  const [loading, setLoading]         = useState(true);

  // BUG FIX: showToast is now actually set to true in handleSave
  const [showToast, setShowToast]     = useState(false);
  const [highlightAvatar, setHighlightAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview]     = useState(null);
  const [avatarFile, setAvatarFile]           = useState(null);
  const [formErrors, setFormErrors]           = useState({});

  // BUG FIX: Keep a separate "committed" copy so Discard can reset without page reload
  const [committedForm, setCommittedForm] = useState(null);
  const [form, setForm] = useState({
    name: "", phone: "", location: "", occupation: "",
    bio: "", experience: "", financialGoal: "",
  });

  // ── Fetch user ──────────────────────────────────────────────────────────────
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const result = await httpAction({ url: apis().getUserProfile });
      if (result?.status) {
        const u = result.user || {};
        setUser(u);
        const fresh = {
          name:          u.name                      || "",
          phone:         u.phone                     || "",
          location:      u.location                  || "",
          occupation:    u.occupation                || "",
          bio:           u.bio                       || "",
          experience:    u.onboarding?.experience    || "",
          financialGoal: u.onboarding?.goals?.[0]   || "",
        };
        setForm(fresh);
        setCommittedForm(fresh);   // remember server state for Discard
        setFormErrors({});
      } else {
        toast.error(result?.message || "Failed to load profile");
      }
    } catch {
      toast.error("Something went wrong loading your profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  // ── Avatar handler ──────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateForm = () => {
    const errs = {};
    if (!form.name?.trim())             errs.name       = "Name is required";
    else if (form.name.trim().length < 2) errs.name     = "Name must be at least 2 characters";
    if (form.phone && !/^[\d\s\-\+\(\)]+$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    if (form.occupation?.length > 100) errs.occupation  = "Max 100 characters";
    if (form.bio?.length > 500)        errs.bio         = "Max 500 characters";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) { toast.error("Please fix the errors above"); return; }
    setSaving(true);
    try {
      // Step 1 — update text fields
      const profileRes = await httpAction({
        url: apis().updateProfile,
        method: "PUT",
        body: {
          name:       form.name,
          phone:      form.phone      || null,
          location:   form.location   || null,
          occupation: form.occupation || null,
          bio:        form.bio        || null,
        },
      });
      if (!profileRes?.status) {
        toast.error(profileRes?.message || "Failed to update profile");
        setSaving(false);
        return;
      }

      // Step 2 — upload avatar if changed
      if (avatarFile) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(avatarFile);
        });
        const imgRes = await fetch(apis().uploadProfileImage, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
          credentials: "include",
        });
        const imgJson = await imgRes.json();
        if (!imgJson?.status) {
          toast.error(imgJson?.message || "Failed to upload photo");
          setSaving(false);
          return;
        }
        // Highlight avatar on success
        setHighlightAvatar(true);
        setTimeout(() => setHighlightAvatar(false), 2000);
        setAvatarFile(null);
      }

      // BUG FIX: Actually trigger the toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      setCommittedForm({ ...form });  // update committed baseline
      window.dispatchEvent(new Event("profileUpdated"));
      setTimeout(fetchUser, 500);

    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // BUG FIX: Discard resets to last saved server state — no page reload
  const handleDiscard = () => {
    if (committedForm) {
      setForm(committedForm);
      setFormErrors({});
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  };

  // ── Tab render ──────────────────────────────────────────────────────────────
  // BUG FIX: Tab content rendered via switch, NOT as object literal in render body.
  // Object literals re-create component instances on every render → focus loss.
  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileTab
            user={user}
            form={form}
            setForm={setForm}
            saving={saving}
            onSave={handleSave}
            onDiscard={handleDiscard}
            onAvatarChange={handleAvatarChange}
            avatarPreview={avatarPreview}
            formErrors={formErrors}
            highlightAvatar={highlightAvatar}
          />
        );
      case "security":       return <SecurityTab />;
      case "notifications":  return <NotificationsTab />;
      case "preferences":    return <PreferencesTab />;
      default:               return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onMenuClick={() => setSidebarOpen((s) => !s)} sidebarOpen={sidebarOpen} />

      {/* BUG FIX: Overlay wrapped in AnimatePresence so exit animation fires */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`pt-20 pb-20 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}>
        <div className="px-3 sm:px-5 lg:px-8 max-w-5xl mx-auto">

          {loading ? <SkeletonLoader /> : (
            <>
              {/* Page header */}
              <motion.div
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-7"
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Profile & Settings
                </h1>
                <p className="text-sm text-gray-400 mt-1">Manage your account, security, and preferences</p>
              </motion.div>

              {/* Tab bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.35 }}
                className="flex gap-1.5 bg-white border border-gray-100 rounded-2xl p-1.5 mb-7 overflow-x-auto shadow-sm"
                style={{ scrollbarWidth: "none" }}
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                      flex-1 sm:flex-initial justify-center transition-all duration-200
                      ${activeTab === tab.id
                        ? "bg-teal-600 text-white shadow-sm shadow-teal-500/20"
                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                  >
                    <span className="text-base leading-none">{tab.emoji}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </motion.div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {renderTab()}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </main>

      <SaveToast show={showToast} />
    </div>
  );
};

export default Profile;