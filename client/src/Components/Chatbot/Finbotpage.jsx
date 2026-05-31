import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Zap, BookOpen, TrendingUp, Shield, Home, CreditCard, PiggyBank } from "lucide-react";
import Navbar from "../Dashboard/Navbar";
import SideBar from "../Dashboard/SideBar";

const QUICK_CHIPS = [
  { label: "What is SIP?", icon: <TrendingUp size={12} /> },
  { label: "Suggest me a course", icon: <BookOpen size={12} /> },
  { label: "How to save tax?", icon: <Shield size={12} /> },
  { label: "Best investment for beginners?", icon: <PiggyBank size={12} /> },
  { label: "Should I take a home loan?", icon: <Home size={12} /> },
  { label: "Is a credit card good?", icon: <CreditCard size={12} /> },
];

const getSessionId = () => {
  let id = localStorage.getItem("finlearn_bot_session");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("finlearn_bot_session", id);
  }
  return id;
};

const formatMessage = (text) => {
  if (!text || typeof text !== "string") return "...";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
};

export default function FinBotPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = getSessionId();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setShowChips(false);
    setLoading(true);
    inputRef.current?.focus();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId }),
      });
      const data = await res.json();
      const reply = data.reply || "No response received. Please try again!";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, there seems to be a connection issue. Please try again! 🙏" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-16"}`}>

        {/* Full-height outer wrapper */}
        <div className="h-[calc(100vh-64px)] flex items-stretch sm:items-center justify-center sm:p-3 md:p-5 bg-gradient-to-br from-slate-100 via-green-50 to-teal-50">

          {/* Chat window — full screen on mobile, card on larger screens */}
          <div
            className="
              w-full flex flex-col overflow-hidden bg-white
              sm:rounded-2xl sm:shadow-2xl sm:border sm:border-white/60
              h-full sm:h-auto sm:max-h-[680px]
            "
            style={{ maxWidth: "780px" }}
          >

            {/* ── Header ── */}
            <div className="shrink-0 relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-4 py-3 sm:px-5 sm:py-4">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

              <div className="relative flex items-center gap-3">
                {/* Logo / Avatar */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl shadow-inner border border-white/30 shrink-0">
                  🎓
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-white font-bold text-sm sm:text-base leading-tight tracking-tight">
                      FinLearn Assistant
                    </h1>
                    <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium border border-white/30 hidden xs:inline">
                      AI
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-200 animate-pulse" />
                    <span className="text-green-100 text-[10px] sm:text-[11px] font-medium truncate">
                      Online · Your Financial Learning Guide
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Zap size={10} className="text-yellow-300" />
                  <span className="text-white/80 font-medium text-[10px] sm:text-xs hidden sm:inline">Powered by AI</span>
                </div>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 space-y-3 scroll-smooth"
              style={{
                background: "linear-gradient(180deg, #f8fffe 0%, #f0fdf8 100%)",
                scrollbarWidth: "thin",
                scrollbarColor: "#d1fae5 transparent",
              }}
            >
              {/* Empty / welcome state */}
              {isEmpty && (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-4 pb-4">
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg text-2xl sm:text-3xl">
                      🎓
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse block" />
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                      Welcome to FinLearn! 👋
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-[280px] sm:max-w-xs leading-relaxed mx-auto">
                      Ask me anything about finance, investments, courses, or plan your financial future.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <Sparkles size={11} />
                    <span>Tap a quick question below or type your own</span>
                  </div>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  style={{ animation: "fadeSlideIn 0.25s ease forwards" }}
                >
                  {/* Avatar */}
                  <div
                    className={`shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold shadow ${
                      msg.role === "bot"
                        ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                        : "bg-gradient-to-br from-slate-600 to-slate-800 text-white"
                    }`}
                  >
                    {msg.role === "bot" ? "🎓" : <User size={11} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[78%] sm:max-w-[65%] px-3 py-2 sm:px-3.5 sm:py-2.5 text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {formatMessage(msg.text)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-end gap-2" style={{ animation: "fadeSlideIn 0.2s ease forwards" }}>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs shrink-0">
                    🎓
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Quick Chips ── */}
            {showChips && (
              <div className="shrink-0 px-3 pt-2 pb-1.5 sm:px-4 sm:pt-2.5 sm:pb-2 bg-white border-t border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">
                  ⚡ Quick Questions
                </p>
                {/* Horizontal scroll on mobile, wrap on larger screens */}
                <div className="flex gap-1.5 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 no-scrollbar">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => sendMessage(chip.label)}
                      className="
                        flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full whitespace-nowrap
                        border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50
                        text-emerald-700 hover:from-emerald-100 hover:to-teal-100
                        hover:border-emerald-300 transition-all font-medium shadow-sm
                        hover:shadow active:scale-95 shrink-0
                      "
                    >
                      {chip.icon}
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Input Bar ── */}
            <div className="shrink-0 px-3 pt-2 pb-3 sm:px-4 sm:pt-2.5 sm:pb-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 sm:px-3.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask anything about finance..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-[13px] sm:text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50 min-w-0"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shrink-0 shadow-sm active:scale-95"
                >
                  <Send size={13} />
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-1.5 leading-tight">
                FinLearn AI may make mistakes · For important decisions, consult a financial expert
              </p>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}