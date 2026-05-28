const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "model"] },
  content: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, unique: true, required: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);