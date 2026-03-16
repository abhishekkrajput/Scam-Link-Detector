import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeUrlHeuristics } from './src/detector.ts';
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint for scanning
  app.post('/api/scan', async (req, res) => {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    // 1. Heuristic Analysis
    const heuristicResult = analyzeUrlHeuristics(url);

    // 2. AI Analysis (Optional but requested)
    let aiResult = { ...heuristicResult };
    
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analyze this URL for phishing or scam potential: ${url}. 
          Return a JSON object with:
          - risk_score: number (0-100)
          - status: "safe", "suspicious", or "dangerous"
          - reasons: string[] (concise explanations)
          
          Consider the domain, path, and common phishing patterns.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                risk_score: { type: Type.NUMBER },
                status: { type: Type.STRING, enum: ["safe", "suspicious", "dangerous"] },
                reasons: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["risk_score", "status", "reasons"]
            }
          }
        });

        const aiData = JSON.parse(response.text || '{}');
        
        // Merge AI results with heuristics
        // We take the higher risk score and combine unique reasons
        const combinedReasons = Array.from(new Set([...heuristicResult.reasons, ...(aiData.reasons || [])]));
        const combinedScore = Math.max(heuristicResult.risk_score, aiData.risk_score || 0);
        
        let combinedStatus = 'safe';
        if (combinedScore >= 70) combinedStatus = 'dangerous';
        else if (combinedScore >= 30) combinedStatus = 'suspicious';

        aiResult = {
          risk_score: combinedScore,
          status: combinedStatus as any,
          reasons: combinedReasons
        };
      } catch (error) {
        console.error('AI Analysis failed:', error);
        // Fallback to heuristics if AI fails
      }
    }

    res.json(aiResult);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
