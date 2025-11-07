// --------------------------------------------------
// scripts/showTopScorers.js
// --------------------------------------------------
// Purpose: Display top goal scorers
// --------------------------------------------------

import { getTopScorers } from "../matchSimulator.js";

async function showTopScorers() {
  console.log("\n⚽ TOP GOAL SCORERS\n");
  console.log("=".repeat(60));
  
  const scorers = await getTopScorers();
  
  if (scorers.length === 0) {
    console.log("No goals scored yet! Simulate some matches first.");
    console.log("\nRun: npm run simulate:all");
    console.log("=".repeat(60));
    return;
  }
  
  // Show top 10
  const topTen = scorers.slice(0, 10);
  
  topTen.forEach((scorer, index) => {
    const position = (index + 1).toString().padStart(2);
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
    const goals = scorer.goals === 1 ? "goal" : "goals";
    
    console.log(`${medal} ${position}. ${scorer.player.padEnd(25)} (${scorer.team.padEnd(15)}) - ${scorer.goals} ${goals}`);
  });
  
  console.log("=".repeat(60));
  console.log(`Total scorers: ${scorers.length}`);
  console.log(`Total goals: ${scorers.reduce((sum, s) => sum + s.goals, 0)}`);
  console.log("=".repeat(60));
}

showTopScorers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });