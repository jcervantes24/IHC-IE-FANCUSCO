import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Initialize Gemini on server
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // Basic API for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", ai_status: genAI ? "configured" : "missing_key" });
  });

  // AI Chat Proxy
  app.post("/api/ai/chat", async (req, res) => {
    try {
      if (!genAI) {
        return res.status(500).json({ error: "AI not configured on server" });
      }
      const { prompt, model: modelName = "gemini-1.5-flash" } = req.body;
      const model = (genAI as any).getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Audio Proxy
  app.post("/api/ai/audio", async (req, res) => {
    try {
      if (!genAI) {
        return res.status(500).json({ error: "AI not configured on server" });
      }
      const { prompt, audioBase64, model: modelName = "gemini-1.5-flash" } = req.body;
      const model = (genAI as any).getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "audio/webm",
            data: audioBase64
          }
        }
      ]);
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error("AI Audio Proxy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
