const OpenAI = require("openai");
const ChatSession = require("../models/ChatSession");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.ORIGIN || "http://localhost:5173",
    "X-Title": "FinLearn",
  },
});

const SYSTEM_PROMPT = `
You are FinBot, a friendly AI assistant for FinLearn — a financial education platform.

You do two things:
1. Answer financial questions clearly and simply.
2. Recommend courses from FinLearn.

Rules:
- Keep responses short
- Reply in Hinglish if user uses Hinglish
- Never give stock predictions
- Add disclaimer for financial advice
`;

exports.chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({
        error: "Message and sessionId required",
      });
    }

    // Find or create session
    let session = await ChatSession.findOne({ sessionId });

    if (!session) {
      session = new ChatSession({
        sessionId,
        messages: [],
      });
    }

    // Save user message (role must match schema enum: "user")
    session.messages.push({
      role: "user",
      content: message,
    });

    // Extract history matching OpenRouter roles ("user" & "assistant")
    // Keeping last 6 messages for context
    const history = session.messages
      .slice(-6)
      .slice(0, -1) // Exclude the message we just pushed
      .map((msg) => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.content || "",
      }));

    // OpenRouter API call
    const completion = await client.chat.completions.create({
      model: "moonshotai/kimi-k2.6:free",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...history,
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "No response generated.";

    // Save assistant response (role must match schema enum: "model")
    session.messages.push({
      role: "model",
      content: reply,
    });

    // Atomic update to prevent tracking / versioning conflicts
    await session.save();

    return res.json({
      reply,
      sessionId,
    });

  } catch (error) {
    console.error("OpenRouter error details:", error);

    if (error?.status === 429) {
      return res.status(429).json({
        error: "AI is busy right now. Please try again in a few seconds.",
      });
    }

    if (error?.status === 401) {
      return res.status(401).json({
        error: "Invalid OpenRouter API key",
      });
    }

    return res.status(500).json({
      error: "Something went wrong internally",
    });
  }
};