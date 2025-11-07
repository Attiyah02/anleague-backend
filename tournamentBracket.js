// --------------------------------------------------
// tournamentBracket.js
// --------------------------------------------------
// Purpose: Generate knockout bracket for 8 teams
// --------------------------------------------------

import { db } from "./firebase.js";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

// --------------------------------------------------
// Fetch all registered teams
// --------------------------------------------------
async function getAllTeams() {
  const teamsSnapshot = await getDocs(collection(db, "teams"));
  const teams = [];
  teamsSnapshot.forEach(docSnap => {
    teams.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });
  return teams;
}

// --------------------------------------------------
// Shuffle teams randomly
// --------------------------------------------------
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --------------------------------------------------
// Generate knockout bracket
// --------------------------------------------------
function createBracket(teams) {
  if (teams.length !== 8) {
    throw new Error(`Need exactly 8 teams, got ${teams.length}`);
  }

  const shuffled = shuffleArray(teams);
  
  const quarterFinals = [
    {
      matchId: "QF1",
      round: "Quarter-Final",
      matchNumber: 1,
      team1: { country: shuffled[0].country, teamId: shuffled[0].id, players: shuffled[0].players },
      team2: { country: shuffled[1].country, teamId: shuffled[1].id, players: shuffled[1].players },
      status: "pending",
      winner: null,
      score: { team1: null, team2: null },
      goalScorers: [],
      commentary: null,
      simulationType: null,
      timestamp: null,
      nextMatch: "SF1"
    },
    {
      matchId: "QF2",
      round: "Quarter-Final",
      matchNumber: 2,
      team1: { country: shuffled[2].country, teamId: shuffled[2].id, players: shuffled[2].players },
      team2: { country: shuffled[3].country, teamId: shuffled[3].id, players: shuffled[3].players },
      status: "pending",
      winner: null,
      score: { team1: null, team2: null },
      goalScorers: [],
      commentary: null,
      simulationType: null,
      timestamp: null,
      nextMatch: "SF1"
    },
    {
      matchId: "QF3",
      round: "Quarter-Final",
      matchNumber: 3,
      team1: { country: shuffled[4].country, teamId: shuffled[4].id, players: shuffled[4].players },
      team2: { country: shuffled[5].country, teamId: shuffled[5].id, players: shuffled[5].players },
      status: "pending",
      winner: null,
      score: { team1: null, team2: null },
      goalScorers: [],
      commentary: null,
      simulationType: null,
      timestamp: null,
      nextMatch: "SF2"
    },
    {
      matchId: "QF4",
      round: "Quarter-Final",
      matchNumber: 4,
      team1: { country: shuffled[6].country, teamId: shuffled[6].id, players: shuffled[6].players },
      team2: { country: shuffled[7].country, teamId: shuffled[7].id, players: shuffled[7].players },
      status: "pending",
      winner: null,
      score: { team1: null, team2: null },
      goalScorers: [],
      commentary: null,
      simulationType: null,
      timestamp: null,
      nextMatch: "SF2"
    }
  ];

  const semiFinals = [
    {
      matchId: "SF1",
      round: "Semi-Final",
      matchNumber: 1,
      team1: { country: "TBD", teamId: null, players: [] },
      team2: { country: "TBD", teamId: null, players: [] },
      status: "locked",
      winner: null,
      score: { team1: null, team2: null },
      goalScorers: [],
      commentary: null,
      simulationType: null,
      timestamp: null,
      nextMatch: "FINAL",
      dependsOn: ["QF1", "QF2"]
    },
    {
      matchId: "SF2",
      round: "Semi-Final",
      matchNumber: 2,
      team1: { country: "TBD", teamId: null, players: [] },
      team2: { country: "TBD", teamId: null, players: [] },
      status: "locked",
      winner: null,
      score: { team1: null, team2: null },
      goalScorers: [],
      commentary: null,
      simulationType: null,
      timestamp: null,
      nextMatch: "FINAL",
      dependsOn: ["QF3", "QF4"]
    }
  ];

  const final = {
    matchId: "FINAL",
    round: "Final",
    matchNumber: 1,
    team1: { country: "TBD", teamId: null, players: [] },
    team2: { country: "TBD", teamId: null, players: [] },
    status: "locked",
    winner: null,
    score: { team1: null, team2: null },
    goalScorers: [],
    commentary: null,
    simulationType: null,
    timestamp: null,
    nextMatch: null,
    dependsOn: ["SF1", "SF2"]
  };

  return { quarterFinals, semiFinals: semiFinals, final: [final] };
}

// --------------------------------------------------
// Upload bracket to Firestore
// --------------------------------------------------
async function uploadBracket(bracket) {
  const allMatches = [
    ...bracket.quarterFinals,
    ...bracket.semiFinals,
    ...bracket.final
  ];

  for (const match of allMatches) {
    await setDoc(doc(db, "matches", match.matchId), match);
    console.log(`📅 ${match.round}: ${match.team1.country} vs ${match.team2.country}`);
  }

  await setDoc(doc(db, "tournament", "current"), {
    status: "ready",
    currentRound: "Quarter-Final",
    createdAt: new Date().toISOString(),
    teamsCount: 8
  });
}

// --------------------------------------------------
// MAIN: Generate tournament
// --------------------------------------------------
export async function generateTournament() {
  console.log("🔄 Generating tournament bracket...");
  
  const teams = await getAllTeams();

  if (teams.length !== 8) {
    console.error(`❌ Need exactly 8 teams. Currently: ${teams.length}`);
    return false;
  }

  const bracket = createBracket(teams);
  await uploadBracket(bracket);
  
  console.log("✅ Tournament bracket created!");
  return true;
}

// --------------------------------------------------
// ADMIN: Reset tournament
// --------------------------------------------------
export async function resetTournament() {
  console.log("🔄 Resetting tournament...");
  
  const matchesSnapshot = await getDocs(collection(db, "matches"));
  for (const docSnap of matchesSnapshot.docs) {
    await deleteDoc(docSnap.ref);
  }
  
  await setDoc(doc(db, "tournament", "current"), {
    status: "reset",
    currentRound: null,
    resetAt: new Date().toISOString()
  });
  
  console.log("✅ Tournament reset!");
}