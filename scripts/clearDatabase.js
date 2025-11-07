import { db } from "../firebase.js";
import { collection, getDocs, deleteDoc } from "firebase/firestore";

async function clearDatabase() {
  console.log("🗑️ Clearing tournament data...\n");
  
  const collections = ["teams", "matches", "tournament"];
  
  for (const collName of collections) {
    const snapshot = await getDocs(collection(db, collName));
    
    if (snapshot.empty) {
      console.log(`⏭️  ${collName}: Already empty`);
      continue;
    }
    
    console.log(`🔄 Clearing ${collName} (${snapshot.size} documents)...`);
    
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    console.log(`✅ Cleared ${collName}`);
  }
  
  console.log("\n🎉 Database cleared! Users preserved.");
}

clearDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });