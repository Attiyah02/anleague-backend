import { createTeam } from "../teamGenerator.js";

async function seedTeams() {
  console.log("🌱 Seeding Teams...\n");
  
  const teams = [
    ["South Africa", "Hugo Broos"],
    ["Nigeria", "José Peseiro"],
    ["Egypt", "Rui Vitória"],
    ["Senegal", "Aliou Cissé"],
    ["Morocco", "Walid Regragui"],
    ["Ghana", "Chris Hughton"],
    ["Cameroon", "Rigobert Song"]
  ];
  
  for (const [country, manager] of teams) {
    await createTeam(country, manager, "admin");
  }
  
  console.log("\n✅ All 7 teams created!");
}

seedTeams()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });