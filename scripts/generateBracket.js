import { generateTournament } from "../tournamentBracket.js";

async function generate() {
  console.log("🏆 Generating Tournament Bracket...\n");
  
  const success = await generateTournament();
  
  if (success) {
    console.log("\n✅ Bracket generated! Quarter-Finals ready.");
  } else {
    console.log("\n❌ Failed. Make sure you have exactly 8 teams.");
  }
}

generate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });