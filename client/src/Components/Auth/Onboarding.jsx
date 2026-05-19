import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useGeneral from "../../hooks/useGeneral";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";
import toast from "react-hot-toast";

// ─── Platform Promise Cards shown on Step 0 (Welcome) ────────────────────────
const PROMISES = [
  { icon: "📖", title: "Bite-sized modules", desc: "5–10 min reads, not hour-long lectures" },
  { icon: "🏆", title: "Earn certificates", desc: "Verified credentials for every course" },
  { icon: "⚡", title: "XP & streaks", desc: "Level up as you learn, stay motivated" },
  { icon: "🎯", title: "Personalized path", desc: "Content matched to your exact goals" },
];

// ─── Steps definition ─────────────────────────────────────────────────────────
const STEPS = [
  { id: "welcome" },          // 0 — cinematic welcome
  { id: "experience" },       // 1 — knowledge level
  { id: "goals" },            // 2 — financial goals
  { id: "situation" },        // 3 — current situation
  { id: "commitment" },       // 4 — time per week
  { id: "priority" },         // 5 — free text priority
  { id: "preview" },          // 6 — personalized path preview
];

const EXPERIENCE_OPTIONS = [
  {
    value: "beginner",
    icon: "🌱",
    title: "Just starting",
    desc: "Money feels overwhelming — let's fix that",
    color: "#E1F5EE",
    border: "#1D9E75",
    text: "#085041",
  },
  {
    value: "intermediate",
    icon: "📈",
    title: "Some knowledge",
    desc: "I understand basics, want to go deeper",
    color: "#E6F1FB",
    border: "#378ADD",
    text: "#0C447C",
  },
  {
    value: "advanced",
    icon: "🧠",
    title: "Fairly experienced",
    desc: "I want to master advanced strategies",
    color: "#EEEDFE",
    border: "#7F77DD",
    text: "#3C3489",
  },
];

const GOAL_OPTIONS = [
  { value: "budgeting",   icon: "💰", label: "Smarter Budgeting" },
  { value: "saving",      icon: "🏦", label: "Build Savings" },
  { value: "investing",   icon: "📊", label: "Start Investing" },
  { value: "debt",        icon: "⛓️", label: "Clear Debt" },
  { value: "retirement",  icon: "🌅", label: "Retire Early" },
  { value: "taxes",       icon: "🧾", label: "Tax Planning" },
  { value: "credit",      icon: "💳", label: "Better Credit" },
  { value: "business",    icon: "🚀", label: "Build a Business" },
];

const SITUATION_OPTIONS = [
  { value: "student",       icon: "🎓", label: "Student",       desc: "Learning while studying" },
  { value: "employed",      icon: "💼", label: "Salaried",      desc: "9–5, looking to grow wealth" },
  { value: "self-employed", icon: "⚡", label: "Freelancer",    desc: "Self-employed or side hustle" },
  { value: "business",      icon: "🏢", label: "Business owner",desc: "Running my own company" },
  { value: "retired",       icon: "🌿", label: "Retired",       desc: "Managing post-career finances" },
];

const TIME_OPTIONS = [
  { value: "1-2",  icon: "☕", label: "1–2 hrs / week",  desc: "Casual pace" },
  { value: "3-5",  icon: "🔥", label: "3–5 hrs / week",  desc: "Steady progress" },
  { value: "6-10", icon: "⚡", label: "6–10 hrs / week", desc: "Fast track" },
  { value: "10+",  icon: "🚀", label: "10+ hrs / week",  desc: "Fully committed" },
];

// ─── Animations ───────────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.22 } }),
};

// ─── Reusable Card Option ─────────────────────────────────────────────────────
function CardOption({ selected, onClick, icon, title, desc, accentColor, accentBorder, accentText, size = "md" }) {
  const pad = size === "sm" ? "12px 14px" : "16px 18px";
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        width: "100%",
        padding: pad,
        borderRadius: 14,
        border: selected
          ? `2px solid ${accentBorder || "#1D9E75"}`
          : "1.5px solid #e5e7eb",
        background: selected ? (accentColor || "#E1F5EE") : "#fff",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.18s ease",
        display: "flex",
        alignItems: "center",
        gap: 14,
        outline: "none",
      }}
    >
      <span style={{ fontSize: size === "sm" ? 22 : 28, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: size === "sm" ? 13 : 14, fontWeight: 600,
          color: selected ? (accentText || "#085041") : "#1a1a1a",
          lineHeight: 1.3,
        }}>{title}</p>
        {desc && (
          <p style={{
            margin: "3px 0 0", fontSize: 12,
            color: selected ? (accentText || "#085041") : "#6b7280",
            opacity: selected ? 0.85 : 1,
          }}>{desc}</p>
        )}
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        border: selected ? `2px solid ${accentBorder || "#1D9E75"}` : "2px solid #d1d5db",
        background: selected ? (accentBorder || "#1D9E75") : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.18s",
      }}>
        {selected && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
      </div>
    </motion.button>
  );
}

// ─── Progress Dots ────────────────────────────────────────────────────────────
function ProgressDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 22 : 7,
            height: 7,
            borderRadius: 100,
            background: i < current ? "#1D9E75" : i === current ? "#0F6E56" : "#e5e7eb",
            transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Step Header ──────────────────────────────────────────────────────────────
function StepHeader({ emoji, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 12 }}>{emoji}</div>
      <h2 style={{
        margin: "0 0 6px", fontSize: "clamp(20px,3vw,24px)", fontWeight: 700,
        color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2,
      }}>{title}</h2>
      {subtitle && (
        <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{subtitle}</p>
      )}
    </div>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({ onClick, disabled, label, loading, primary = true }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        flex: 1,
        padding: "13px 24px",
        borderRadius: 12,
        border: primary ? "none" : "1.5px solid #e5e7eb",
        background: primary
          ? disabled
            ? "#9ca3af"
            : "linear-gradient(135deg, #0F6E56 0%, #1D9E75 100%)"
          : "#fff",
        color: primary ? "#fff" : "#374151",
        fontSize: 15,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        letterSpacing: "-0.1px",
        transition: "opacity 0.15s",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "⏳ Saving…" : label}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Onboarding = () => {
  const { loading, setLoading } = useGeneral();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);   // animation direction
  const [error, setError] = useState("");
  const textRef = useRef(null);

  const [form, setForm] = useState({
    experience: "",
    goals: [],
    currentSituation: "",
    timeCommitment: "",
    priority: "",
    learningStyle: "reading",   // platform is text-based — pre-set, not asked
  });

  const totalSteps = STEPS.length;
  const currentId = STEPS[step].id;

  // Clear error whenever step changes
  useEffect(() => { setError(""); }, [step]);

  const goNext = () => {
    // Per-step validation
    const errs = {
      experience:        !form.experience       && "Please pick your experience level",
      goals:             form.goals.length === 0 && "Select at least one goal",
      situation:         !form.currentSituation && "Please select your situation",
      commitment:        !form.timeCommitment   && "How much time can you spare?",
      priority:          (!form.priority || form.priority.trim().length < 6)
                           && "Tell us a bit more (min 6 characters)",
    };
    if (errs[currentId]) { setError(errs[currentId]); return; }
    setDir(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const goBack = () => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const toggleGoal = (val) => {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(val)
        ? f.goals.filter((g) => g !== val)
        : [...f.goals, val],
    }));
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await httpAction({
        url: apis().saveOnboarding,
        method: "POST",
        body: {
          experience:      form.experience,
          goals:           form.goals,
          timeCommitment:  form.timeCommitment,
          learningStyle:   form.learningStyle,
          currentSituation: form.currentSituation,
          priority:        form.priority,
        },
      });
      if (result?.status) {
        toast.success("You're all set! Let's start your journey 🚀");
        window.location.href = "/dashboard";
        navigate("/dashboard");
      } else {
        toast.error(result?.message || "Something went wrong");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const result = await httpAction({ url: apis().skipOnboarding, method: "POST" });
      if (result?.status) {
        toast.success("No worries! You can personalise later.");
        window.location.href = "/dashboard";
        navigate("/dashboard");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ── Path preview (shown on last step before submit) ───────────────────────
  const getPreviewModules = () => {
    const map = {
      budgeting:  { icon: "💰", title: "Personal Budgeting 101",     xp: 120 },
      saving:     { icon: "🏦", title: "Building Your Emergency Fund", xp: 150 },
      investing:  { icon: "📊", title: "Investing Fundamentals",       xp: 200 },
      debt:       { icon: "⛓️", title: "Debt Avalanche Strategy",      xp: 130 },
      retirement: { icon: "🌅", title: "Retirement Planning Basics",   xp: 180 },
      taxes:      { icon: "🧾", title: "Tax Optimization Guide",       xp: 160 },
      credit:     { icon: "💳", title: "Credit Score Mastery",         xp: 140 },
      business:   { icon: "🚀", title: "Finance for Entrepreneurs",    xp: 220 },
    };
    return form.goals.slice(0, 3).map((g) => map[g]).filter(Boolean);
  };

  // ── Render step content ───────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentId) {

      // ── 0: Welcome ──────────────────────────────────────────────────────────
      case "welcome":
        return (
          <div>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: "linear-gradient(135deg,#0F6E56,#1D9E75)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, marginBottom: 20,
            }}>
              📚
            </div>
            <h1 style={{
              margin: "0 0 8px", fontSize: "clamp(24px,4vw,30px)",
              fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", lineHeight: 1.2,
            }}>
              Welcome to FinLearn
            </h1>
            <p style={{ margin: "0 0 28px", fontSize: 15, color: "#475569", lineHeight: 1.7 }}>
              India's smartest bite-sized finance platform. 2 minutes to set up. A lifetime of financial clarity.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {PROMISES.map((p) => (
                <div key={p.icon} style={{
                  padding: "14px 16px", borderRadius: 14,
                  border: "1.5px solid #e5e7eb", background: "#fafafa",
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon}</div>
                  <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{p.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{p.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <ActionBtn label="Let's personalize →" onClick={goNext} />
            </div>
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              style={{
                width: "100%", marginTop: 12, background: "none", border: "none",
                color: "#94a3b8", fontSize: 13, cursor: "pointer", padding: "8px 0",
              }}
            >
              Skip — take me straight to dashboard
            </button>
          </div>
        );

      // ── 1: Experience ────────────────────────────────────────────────────────
      case "experience":
        return (
          <div>
            <StepHeader
              emoji="🧭"
              title="Where are you on your money journey?"
              subtitle="No judgment here — this helps us match you with the right content."
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <CardOption
                  key={opt.value}
                  selected={form.experience === opt.value}
                  onClick={() => { setForm((f) => ({ ...f, experience: opt.value })); setError(""); }}
                  icon={opt.icon}
                  title={opt.title}
                  desc={opt.desc}
                  accentColor={opt.color}
                  accentBorder={opt.border}
                  accentText={opt.text}
                />
              ))}
            </div>
          </div>
        );

      // ── 2: Goals ─────────────────────────────────────────────────────────────
      case "goals":
        return (
          <div>
            <StepHeader
              emoji="🎯"
              title="What do you want to achieve?"
              subtitle="Pick everything that excites you — we'll build your path around it."
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {GOAL_OPTIONS.map((opt) => {
                const sel = form.goals.includes(opt.value);
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggleGoal(opt.value)}
                    style={{
                      padding: "14px 12px",
                      borderRadius: 14,
                      border: sel ? "2px solid #1D9E75" : "1.5px solid #e5e7eb",
                      background: sel ? "#E1F5EE" : "#fff",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.18s",
                      outline: "none",
                    }}
                  >
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{opt.icon}</div>
                    <p style={{
                      margin: 0, fontSize: 12, fontWeight: 600,
                      color: sel ? "#085041" : "#374151",
                      lineHeight: 1.3,
                    }}>{opt.label}</p>
                    {sel && (
                      <div style={{
                        display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700,
                        color: "#1D9E75", background: "#d1fae5", borderRadius: 100, padding: "2px 8px",
                      }}>✓ Added</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {form.goals.length > 0 && (
              <p style={{ marginTop: 12, fontSize: 12, color: "#1D9E75", fontWeight: 600, textAlign: "center" }}>
                {form.goals.length} goal{form.goals.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        );

      // ── 3: Situation ──────────────────────────────────────────────────────────
      case "situation":
        return (
          <div>
            <StepHeader
              emoji="👤"
              title="What's your current life situation?"
              subtitle="This helps us pick examples and scenarios that actually apply to you."
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {SITUATION_OPTIONS.map((opt) => (
                <CardOption
                  key={opt.value}
                  size="sm"
                  selected={form.currentSituation === opt.value}
                  onClick={() => { setForm((f) => ({ ...f, currentSituation: opt.value })); setError(""); }}
                  icon={opt.icon}
                  title={opt.label}
                  desc={opt.desc}
                  accentColor="#E1F5EE"
                  accentBorder="#1D9E75"
                  accentText="#085041"
                />
              ))}
            </div>
          </div>
        );

      // ── 4: Time commitment ────────────────────────────────────────────────────
      case "commitment":
        return (
          <div>
            <StepHeader
              emoji="⏱️"
              title="How much time can you give per week?"
              subtitle="Even 1 hour a week compounds into serious knowledge over time."
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {TIME_OPTIONS.map((opt) => {
                const sel = form.timeCommitment === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setForm((f) => ({ ...f, timeCommitment: opt.value })); setError(""); }}
                    style={{
                      padding: "16px 14px",
                      borderRadius: 14,
                      border: sel ? "2px solid #1D9E75" : "1.5px solid #e5e7eb",
                      background: sel ? "#E1F5EE" : "#fff",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.18s",
                      outline: "none",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.icon}</div>
                    <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: sel ? "#085041" : "#0f172a" }}>
                      {opt.label}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: sel ? "#0F6E56" : "#9ca3af" }}>{opt.desc}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      // ── 5: Priority text ──────────────────────────────────────────────────────
      case "priority":
        return (
          <div>
            <StepHeader
              emoji="✍️"
              title="What's your #1 money goal right now?"
              subtitle="Be specific — the more you share, the better we can help. One sentence is enough."
            />
            <textarea
              ref={textRef}
              rows={4}
              value={form.priority}
              onChange={(e) => { setForm((f) => ({ ...f, priority: e.target.value })); setError(""); }}
              placeholder="e.g. I want to save ₹5 lakh for a house down payment in 3 years…"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 14,
                border: error ? "2px solid #ef4444" : "1.5px solid #e5e7eb",
                background: "#f9fafb",
                fontSize: 14,
                color: "#0f172a",
                lineHeight: 1.7,
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                transition: "border 0.18s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#1D9E75"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb"; e.target.style.background = "#f9fafb"; }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Min 6 characters</span>
              <span style={{ fontSize: 12, color: form.priority.length > 5 ? "#1D9E75" : "#94a3b8", fontWeight: 500 }}>
                {form.priority.length} chars
              </span>
            </div>

            {/* Fun tip */}
            <div style={{
              marginTop: 18, padding: "12px 16px", borderRadius: 12,
              background: "#F1F5F9", border: "1px solid #e2e8f0",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>💡</span>
              <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                People who write down their financial goals are <strong style={{ color: "#0f172a" }}>42% more likely</strong> to achieve them.
              </p>
            </div>
          </div>
        );

      // ── 6: Preview your path ──────────────────────────────────────────────────
      case "preview":
        const modules = getPreviewModules();
        const expLabel = EXPERIENCE_OPTIONS.find((e) => e.value === form.experience)?.title || "";
        const timeLabel = TIME_OPTIONS.find((t) => t.value === form.timeCommitment)?.label || "";
        return (
          <div>
            <StepHeader
              emoji="🗺️"
              title="Your personalized path is ready!"
              subtitle="Here's a preview of what we've curated for you based on your answers."
            />

            {/* Summary chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {[expLabel, timeLabel, ...form.goals.slice(0, 3).map((g) => GOAL_OPTIONS.find((o) => o.value === g)?.label)].filter(Boolean).map((tag) => (
                <span key={tag} style={{
                  fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 100,
                  background: "#E1F5EE", color: "#085041", border: "1px solid #9FE1CB",
                }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Module preview cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {modules.length > 0 ? modules.map((m, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 14,
                  border: "1.5px solid #e5e7eb", background: "#fff",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "#E1F5EE", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 22,
                  }}>{m.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{m.title}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Bite-sized · Earns certificate</p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 100,
                    background: "#FAEEDA", color: "#633806", flexShrink: 0,
                  }}>⚡ {m.xp} XP</span>
                </div>
              )) : (
                <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                  More courses will be unlocked as you explore 🎉
                </div>
              )}
            </div>

            {/* Certificate teaser */}
            <div style={{
              padding: "14px 18px", borderRadius: 14,
              background: "linear-gradient(135deg,#0F6E56,#1D9E75)",
              display: "flex", alignItems: "center", gap: 14, marginBottom: 6,
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>🏆</span>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                  Complete any course → earn a certificate
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#9FE1CB" }}>
                  Shareable on LinkedIn · Verified by FinLearn
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastStep = step === totalSteps - 1;
  const isFirstStep = step === 0;
  const showDots = step > 0; // don't show dots on welcome screen

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Progress dots */}
      {showDots && (
        <div style={{ marginBottom: 24 }}>
          <ProgressDots current={step - 1} total={totalSteps - 1} />
          <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
            Step {step} of {totalSteps - 1}
          </p>
        </div>
      )}

      {/* Animated step content */}
      <div style={{ minHeight: 380, position: "relative" }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 4, marginBottom: 8,
              padding: "10px 14px", borderRadius: 10,
              background: "#FEF2F2", border: "1px solid #FECACA",
              color: "#991B1B", fontSize: 13, fontWeight: 500,
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation — hidden on welcome (it has its own buttons) */}
      {!isFirstStep && (
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <ActionBtn label="← Back" onClick={goBack} primary={false} />
          {isLastStep ? (
            <ActionBtn
              label="Start my journey 🚀"
              onClick={handleSubmit}
              loading={loading}
            />
          ) : (
            <ActionBtn
              label="Continue →"
              onClick={goNext}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Onboarding;