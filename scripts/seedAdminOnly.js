// --------------------------------------------------
// seedAdminOnly.js
// --------------------------------------------------
// Purpose: Create only the admin account
// --------------------------------------------------

import { createAdmin } from "../userManagement.js";

async function seedAdmin() {
  console.log("🔑 Creating Admin Account...\n");
  console.log("=".repeat(50));
  
  try {
    await createAdmin("admin@afnl.com", "admin123", "main");
    
    console.log("\n✅ Admin account created successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("=".repeat(50));
    console.log("Email:    admin@afnl.com");
    console.log("Password: admin123");
    console.log("=".repeat(50));
    
  } catch (error) {
    if (error.message.includes("email-already-in-use")) {
      console.log("\n⚠️ Admin already exists!");
      console.log("Email: admin@afnl.com");
      console.log("Password: admin123");
    } else {
      throw error;
    }
  }
}

seedAdmin()
  .then(() => {
    console.log("\n✅ Setup complete!");
    process.exit(0);
  })
  .catch(err => {
    console.error("\n❌ Error:", err);
    process.exit(1);
  });