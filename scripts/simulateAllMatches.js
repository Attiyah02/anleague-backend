// --------------------------------------------------
// scripts/simulateAllMatches.js
// --------------------------------------------------
// Purpose: Simulate entire tournament automatically
// --------------------------------------------------

import { simulateMatch } from "../matchSimulator.js";

async function simulateAllMatches() {
  console.log("\n🏆 SIMULATING ENTIRE TOURNAMENT\n");
  
  try {
    // Quarter-Finals
    console.log("=".repeat(50));
    console.log("QUARTER-FINALS");
    console.log("=".repeat(50));
    
    await simulateMatch("QF1");
    console.log("-".repeat(50));
    
    await simulateMatch("QF2");
    console.log("-".repeat(50));
    
    await simulateMatch("QF3");
    console.log("-".repeat(50));
    
    await simulateMatch("QF4");
    console.log("");
    
    // Semi-Finals
    console.log("=".repeat(50));
    console.log("SEMI-FINALS");
    console.log("=".repeat(50));
    
    await simulateMatch("SF1");
    console.log("-".repeat(50));
    
    await simulateMatch("SF2");
    console.log("");
    
    // Final
    console.log("=".repeat(50));
    console.log("🏆 FINAL");
    console.log("=".repeat(50));
    
    await simulateMatch("FINAL");
    
    console.log("\n" + "=".repeat(50));
    console.log("🎉 TOURNAMENT COMPLETE!");
    console.log("=".repeat(50));
    
  } catch (error) {
    console.error("\n❌ Error during simulation:", error.message);
  }
}

simulateAllMatches()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  });