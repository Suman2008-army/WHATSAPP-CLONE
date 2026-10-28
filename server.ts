import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // API Route for Gemini AI Chat / Auto-reply / Smart Suggestions
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { contactName, contactBio, lastMessages, prompt } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          reply: `[Demo Bot] Hey! I received your message: "${prompt}". (Add your GEMINI_API_KEY in Secrets for live AI responses!)`,
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const conversationHistory = (lastMessages || [])
        .map((m: any) => `${m.senderName}: ${m.content}`)
        .join("\n");

      const systemInstruction = `You are playing the role of ${contactName || "a friend"} on a WhatsApp messaging app called "Message Karo".
Bio / Persona: ${contactBio || "Friendly chat contact"}.
Keep your reply short, natural, friendly, and formatted like a real WhatsApp text message (1-3 sentences max). You can use emojis naturally.
Do not start with "AI:" or quotes. Respond directly in character.`;

      const fullPrompt = `${systemInstruction}\n\nRecent conversation:\n${conversationHistory}\n\nUser text: ${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
      });

      const reply = response.text || "Hey! Got your message! 👍";
      res.json({ reply });
    } catch (error: any) {
      console.error("Gemini AI API Error:", error);
      res.status(500).json({
        reply: "Hey! Sorry, I had a momentary glitch. How are you doing today? 😊",
        error: error.message,
      });
    }
  });

  // API Route for generating smart quick replies
  app.post("/api/smart-replies", async (req, res) => {
    try {
      const { lastMessage } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || !lastMessage) {
        return res.json({
          suggestions: ["Sounds good! 👍", "Thanks! 😊", "Talk to you later!"],
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Given the following received WhatsApp message, provide 3 short, natural 1-4 word quick reply options as a JSON array of strings.
Received message: "${lastMessage}"
Output format: ONLY a valid JSON array like ["Option 1", "Option 2", "Option 3"] without markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "[]";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      let suggestions = [];
      try {
        suggestions = JSON.parse(cleanJson);
      } catch {
        suggestions = ["Sounds good! 👍", "Thanks! 😊", "Got it! 👌"];
      }

      res.json({ suggestions });
    } catch (error) {
      res.json({
        suggestions: ["Sounds good! 👍", "Sure thing!", "Talk soon!"],
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Message Karo" });
  });

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Message Karo server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
