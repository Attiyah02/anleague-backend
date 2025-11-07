// --------------------------------------------------
// scripts/seedUsers.js (UPDATED)
// --------------------------------------------------

import { createAdmin, createRepresentative, listAllUsers } from "../userManagement.js";

async function seedUsers() {
  console.log("🌱 Seeding Users...\n");
  
  try {
    // Create admin with readable ID
    console.log("=".repeat(50));
    console.log("Creating Admin User");
    console.log("=".repeat(50));
    await createAdmin("admin@afnl.com", "admin123", "main");
    
    // Create representatives with readable IDs
    console.log("\n" + "=".repeat(50));
    console.log("Creating Representatives");
    console.log("=".repeat(50));
    
    const reps = [
      { email: "southafrica@afnl.com", password: "sa123456", country: "South Africa" },
      { email: "nigeria@afnl.com", password: "ng123456", country: "Nigeria" },
      { email: "egypt@afnl.com", password: "eg123456", country: "Egypt" },
      { email: "senegal@afnl.com", password: "sn123456", country: "Senegal" },
      { email: "morocco@afnl.com", password: "ma123456", country: "Morocco" },
      { email: "ghana@afnl.com", password: "gh123456", country: "Ghana" },
      { email: "cameroon@afnl.com", password: "cm123456", country: "Cameroon" }
    ];
    
    for (const rep of reps) {
      await createRepresentative(rep.email, rep.password, rep.country);
    }
    
    console.log("\n" + "=".repeat(50));
    await listAllUsers();
    
    console.log("\n📝 Login Credentials:");
    console.log("=".repeat(50));
    console.log("Admin: admin@afnl.com / admin123");
    console.log("\nRepresentatives:");
    reps.forEach(r => console.log(`  ${r.country}: ${r.email} / ${r.password}`));
    console.log("=".repeat(50));
    
  } catch (error) {
    if (error.message.includes("email-already-in-use")) {
      console.log("\n⚠️ Users already exist!");
    } else {
      throw error;
    }
  }
}

seedUsers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });