import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send } from "lucide-react";
import apis from "../../utils/apis";
import httpAction from "../../utils/httpAction";

const QUICK_CHIPS = [
  "SIP kya hota hai?",
  "Mujhe course suggest karo",
  "Tax kaise bachaye?",
  "Beginners ke liye best investment?",
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
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
};

export default function FinBot() {
  const [isAuth, setIsAuth] = useState(false);  // 👈 auth check
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Namaste! 👋 Main FinBot hoon.\nFinancial questions poochho ya best course suggest karwao!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const bottomRef = useRef(null);
  const sessionId = getSessionId();

  // 👇 Auth check on mount
  useEffect(() => {
    const checkAuth = async () => {
      const result = await httpAction({ url: apis().getAccess });
      setIsAuth(result?.status || false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 👇 Agar login nahi hai toh kuch render mat karo
  if (!isAuth) return null;

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setShowChips(false);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[360px] max-sm:w-screen max-sm:h-screen max-sm:fixed max-sm:inset-0 max-sm:rounded-none flex flex-col rounded-2xl shadow-2xl border border-border bg-background overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 bg-green-500">
                <AvatarFallback className="bg-green-500 text-white text-lg">
                  🤖
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  FinBot
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs">Online</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="text-white hover:bg-slate-700 h-8 w-8"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col gap-3 p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {msg.role === "bot" && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-sm">
                        🤖
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-green-500 text-white rounded-br-sm"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {formatMessage(msg.text)}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex items-end gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-sm">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Quick Chips */}
          {showChips && (
            <div className="flex flex-wrap gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
              {QUICK_CHIPS.map((chip) => (
                <Badge
                  key={chip}
                  variant="outline"
                  onClick={() => sendMessage(chip)}
                  className="cursor-pointer text-xs text-green-700 border-green-300 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800 transition-colors"
                >
                  {chip}
                </Badge>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Finance ke baare mein poochho..."
              className="rounded-full text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-green-500"
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="rounded-full bg-green-500 hover:bg-green-600 shrink-0 h-9 w-9"
            >
              <Send size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 px-5 h-12 gap-2 text-sm font-medium"
      >
        <MessageCircle size={18} />
        Ask FinBot
      </Button>
    </div>
  );
}