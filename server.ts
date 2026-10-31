import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.post("/api/ai/analyze-document", async (req, res) => {
  try {
    const { title, content, fileData, mimeType } = req.body;

    const parts: any[] = [];
    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: fileData,
        },
      });
    }

    parts.push({
      text: `Analyze this personal document titled "${title || 'Untitled'}".
Extract and return a JSON object with:
- "summary": A concise 2-3 sentence summary in Hindi or professional bilingual (Hinglish/English).
- "category": Choose strictly one from ["Financial", "Legal", "Medical", "Personal", "Education", "Work", "Govt ID", "Other"].
- "tags": Array of 3-5 relevant keyword tags.
- "extractedText": Key text or OCR found in the document.
- "expiryDate": If there is an expiration or renewal date mentioned, provide in YYYY-MM-DD format, otherwise null.
- "importantNotes": Any key numbers, policy numbers, account numbers, or actionable takeaways.

Return ONLY valid JSON matching this schema.`,
    });

    if (content) {
      parts.push({ text: `Document raw text / notes provided by user: ${content}` });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            extractedText: { type: Type.STRING },
            expiryDate: { type: Type.STRING, nullable: true },
            importantNotes: { type: Type.STRING },
          },
          required: ["summary", "category", "tags", "extractedText", "importantNotes"],
        },
      },
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze document with AI" });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  const PORT = process.env.PORT || 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
