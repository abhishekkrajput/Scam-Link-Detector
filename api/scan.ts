import { analyzeUrlHeuristics } from '../src/detector.ts';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // 1. Heuristic Analysis
  const heuristicResult = analyzeUrlHeuristics(url);

  // 2. AI Analysis (Optional but requested)
  let aiResult: any = { ...heuristicResult };
  
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
        status: combinedStatus,
        reasons: combinedReasons
      };
    } catch (error) {
      console.error('AI Analysis failed:', error);
      // Fallback to heuristics if AI fails
    }
  }

  res.status(200).json(aiResult);
}
