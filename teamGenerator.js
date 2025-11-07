// --------------------------------------------------
// teamGenerator.js (UPDATED - Now uses OOP classes)
// --------------------------------------------------

import { Team } from './models/Team.js';
import { db } from "./firebase.js";
import { doc, setDoc } from "firebase/firestore";

/**
 * Create a new team using Team class
 * Demonstrates OOP principles: Encapsulation, Composition
 */
export async function createTeam(country, manager, createdBy) {
  try {
    console.log(`\n🏗️ Creating team: ${country}...`);
    
    // Use Team class - OOP instantiation
    const team = new Team(country, manager, createdBy);
    
    // Generate squad - Encapsulated method
    team.generateSquad();
    
    // Validate squad - Business logic encapsulated in class
    if (!team.isValidSquad()) {
      throw new Error("Invalid squad generated");
    }

    // Save to Firebase using serialization
    const teamRef = doc(db, "teams", country);
    await setDoc(teamRef, team.toJSON());

    console.log(`✅ ${country} created successfully!`);
    console.log(`   Manager: ${team.manager}`);
    console.log(`   Team Rating: ${team.teamRating}`);
    console.log(`   Captain: ${team.getCaptain()?.name || "None"}`);
    console.log(`   Players: ${team.getSquadSize()}`);
    console.log(`   Squad valid: ${team.isValidSquad()}`);
    
    // Return JSON for API response
    return team.toJSON();
    
  } catch (error) {
    console.error(`❌ Error creating team ${country}:`, error.message);
    throw error;
  }
}

/**
 * Load team from Firebase and convert to Team class instance
 */
export function teamFromFirestore(data) {
  return Team.fromJSON(data);
}