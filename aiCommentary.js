// --------------------------------------------------
// aiCommentary.js
// Purpose: Generate real-time, broadcast-style AI match commentary using Gemini 2.5 Pro
// --------------------------------------------------

import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateMatchCommentary(match, score1, score2, scorers, winner, events = []) {
  const prompt = `You are an enthusiastic African football commentator. Generate exciting, real-time commentary for:

${match.team1.country} ${score1} - ${score2} ${match.team2.country}
${match.round}

Goal Scorers:
${scorers.map(s => `${s.minute}' - ${s.player} (${s.team})`).join("\n")}

Other key events (yellow/red cards, substitutions):
${events.map(e => `${e.minute}' - ${e.description}`).join("\n")}

Winner: ${winner.country}${winner.wonBy === "penalties" ? " (on penalties)" : ""}

Generate a broadcast-style commentary (~300-500 words):
- Describe goals as they happen
- Include key events (cards, subs)
- Build tension, crowd reactions, and atmosphere
- Highlight African football passion and culture
- End with match result and celebration

Keep it lively, engaging, and dramatic but concise.`;


  try {
    console.log("🎙️ Generating AI commentary with Gemini 2.5 Pro...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const result = await model.generateContent(prompt, {
      maxOutputTokens: 1200,
      temperature: 0.8
    });

    console.log("Raw Gemini response:", result);

    // Extract commentary text
    let commentary;
    try {
      commentary = result.response.text(); // Call the function to get the string
      commentary = commentary.trim();
    } catch (e) {
      console.error("Error extracting commentary from Gemini response:", e);
      commentary = null;
    }

    if (!commentary) {
      commentary = generateFallbackCommentary(match, score1, score2, scorers, winner, events);
    }

    return commentary;

  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    return generateFallbackCommentary(match, score1, score2, scorers, winner, events);
  }
}

// Fallback commentary with optional events
function generateFallbackCommentary(match, score1, score2, scorers, winner, events = []) {
  let text = `🏟️ ${match.round}: ${match.team1.country} vs ${match.team2.country}\n\n`;
  text += `The match kicks off with both teams showing great determination.\n\n`;

  scorers.forEach(s => {
    text += `⚽ ${s.minute}' - GOAL! ${s.player} scores for ${s.team}! The crowd erupts!\n\n`;
  });

  events.forEach(e => {
    text += `🟨 ${e.minute}' - ${e.description}\n\n`;
  });

  text += `🏁 Full Time: ${match.team1.country} ${score1} - ${score2} ${match.team2.country}\n\n`;
  text += `${winner.country} advances to the next round!`;

  if (winner.wonBy === "penalties") {
    text += ` What drama! Victory sealed on penalties!`;
  }

  return text;
}
