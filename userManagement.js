// --------------------------------------------------
// userManagement.js (UPDATED)
// --------------------------------------------------
// Purpose: Create users with readable document IDs
// --------------------------------------------------

import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";

// --------------------------------------------------
// Create admin user
// --------------------------------------------------
export async function createAdmin(email, password, adminName = "admin") {
  try {
    console.log(`\n👤 Creating admin: ${email}...`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Use readable ID instead of UID
    const docId = `admin-${adminName}`;
    
    await setDoc(doc(db, "users", docId), {
      uid: user.uid,  // Store the auth UID for reference
      email: email,
      role: "admin",
      displayName: adminName,
      createdAt: new Date().toISOString()
    });
    
    console.log("✅ Admin created successfully!");
    console.log(`   Document ID: ${docId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Auth UID: ${user.uid}`);
    
    return user;
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    throw error;
  }
}

// --------------------------------------------------
// Create federation representative
// --------------------------------------------------
export async function createRepresentative(email, password, country) {
  try {
    console.log(`\n👤 Creating representative for ${country}: ${email}...`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Use readable ID: country name in kebab-case
    const docId = country.toLowerCase().replace(/ /g, "-") + "-rep";
    
    await setDoc(doc(db, "users", docId), {
      uid: user.uid,  // Store the auth UID for reference
      email: email,
      role: "representative",
      country: country,
      displayName: `${country} Representative`,
      createdAt: new Date().toISOString()
    });
    
    console.log("✅ Representative created successfully!");
    console.log(`   Document ID: ${docId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Country: ${country}`);
    console.log(`   Auth UID: ${user.uid}`);
    
    return user;
  } catch (error) {
    console.error(`❌ Error creating representative for ${country}:`, error.message);
    throw error;
  }
}

// --------------------------------------------------
// Get user by Auth UID (for login)
// --------------------------------------------------
export async function getUserByAuthUID(authUID) {
  const usersSnapshot = await getDocs(collection(db, "users"));
  
  let userData = null;
  usersSnapshot.forEach(doc => {
    if (doc.data().uid === authUID) {
      userData = { id: doc.id, ...doc.data() };
    }
  });
  
  return userData;
}

// --------------------------------------------------
// Get user by document ID (for easy lookup)
// --------------------------------------------------
export async function getUserByDocId(docId) {
  const { getDoc } = await import("firebase/firestore");
  const docSnap = await getDoc(doc(db, "users", docId));
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// --------------------------------------------------
// List all users
// --------------------------------------------------
export async function listAllUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  
  console.log("\n📋 All Users in Database:\n");
  
  if (usersSnapshot.empty) {
    console.log("❌ No users found!");
    return [];
  }
  
  const users = [];
  usersSnapshot.forEach((docSnap) => {
    const userData = docSnap.data();
    users.push({ id: docSnap.id, ...userData });
    
    const icon = userData.role === "admin" ? "🔑" : "👤";
    console.log(`${icon} ${userData.email} (${docSnap.id})`);
    console.log(`   Role: ${userData.role}`);
    if (userData.country) console.log(`   Country: ${userData.country}`);
    console.log("");
  });
  
  return users;
}