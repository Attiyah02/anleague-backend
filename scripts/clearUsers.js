import { db } from "../firebase.js";
import { collection, getDocs, deleteDoc } from "firebase/firestore";

async function clearUsers() {
  console.log("🗑️ Clearing all users from Firestore...\n");
  
  const usersSnapshot = await getDocs(collection(db, "users"));
  
  if (usersSnapshot.empty) {
    console.log("⏭️  No users to delete");
    return;
  }
  
  console.log(`🔄 Deleting ${usersSnapshot.size} users...`);
  
  for (const doc of usersSnapshot.docs) {
    await deleteDoc(doc.ref);
    console.log(`   Deleted: ${doc.data().email}`);
  }
  
  console.log("\n✅ Users cleared from Firestore!");
  console.log("⚠️ Note: Auth users still exist in Firebase Authentication");
  console.log("To fully delete, go to Firebase Console → Authentication");
}

clearUsers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });