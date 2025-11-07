import { listAllUsers } from "../userManagement.js";

async function verifyUsers() {
  console.log("🔍 Verifying Users...\n");
  
  const users = await listAllUsers();
  
  const admins = users.filter(u => u.role === "admin");
  const reps = users.filter(u => u.role === "representative");
  
  console.log("\n📊 Summary:");
  console.log(`   Total: ${users.length}`);
  console.log(`   Admins: ${admins.length}`);
  console.log(`   Representatives: ${reps.length}`);
  
  if (admins.length === 1 && reps.length === 8) {
    console.log("\n✅ All users correct!");
  }
}

verifyUsers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });