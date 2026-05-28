import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import Navbar from "../Dashboard/Navbar";
import SideBar from "../Dashboard/SideBar";

// ─── Quick suggestion chips ───────────────────────────────────────────────────
const QUICK_CHIPS = [
  "💰 SIP kya hota hai?",
  "📚 Mujhe course suggest karo",
  "🧾 Tax kaise bachaye?",
  "📈 Beginners ke liye best investment?",
  "🏠 Home loan lena chahiye?",
  "💳 Credit card sahi hai ya nahi?",
];

const getSessionId = () => {
  let id = localStorage.getItem("finbot_session");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("finbot_session", id);
  }
  return id;
};

const formatMessage = (text) => {
  if (!text || typeof text !== "string") return "...";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
};

// ─────────────────────────────────────────────────────────────────────────────
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
      const reply = data.reply || "Koi jawab nahi mila. Dobara try karo!";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, connection mein problem hai. Dobara try karo! 🙏",
        },
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

      {/* Main content area — offset for navbar + sidebar */}
      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? "lg:pl-64" : "lg:pl-16"}`}>
        <div className="flex flex-col h-[calc(100vh-64px)]">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div className="shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-sm">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FinBot</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Online · AI Financial Assistant</span>
              </div>
            </div>
          </div>

          {/* ── Messages Area ────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center h-full text-center pb-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-lg mb-5">
                  <span className="text-4xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Namaste! Main FinBot hoon 👋</h2>
                <p className="text-gray-500 text-sm max-w-md leading-relaxed">
                  Financial questions poochho, courses dhundho, ya investment ke baare mein jaano. Main yahan hoon!
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                  <Sparkles size={12} />
                  <span>Powered by AI · Hinglish mein baat karo</span>
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ${
                  msg.role === "bot"
                    ? "bg-gradient-to-br from-green-400 to-teal-500"
                    : "bg-gradient-to-br from-slate-600 to-slate-800"
                }`}>
                  {msg.role === "bot" ? "🤖" : <User size={14} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[65%] md:max-w-[55%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === "user"
                    ? "bg-green-500 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                }`}>
                  {formatMessage(msg.text)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Quick Chips ──────────────────────────────────────────────── */}
          {showChips && (
            <div className="shrink-0 px-4 py-3 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2 font-medium">Jaldi poochho:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-xs px-3 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input Bar ───────────────────────────────────────────────── */}
          <div className="shrink-0 px-4 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-3 max-w-3xl mx-auto bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Finance ke baare mein kuch bhi poochho..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              FinBot galat jaankari de sakta hai. Important decisions ke liye expert se milein.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}