// --------------------------------------------------
// matchSimulator.js
// --------------------------------------------------
// Purpose: Handle both "play" (with AI) and "simulate" modes
// --------------------------------------------------

import { db } from "./firebase.js";
import { doc, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { generateMatchCommentary } from "./aiCommentary.js";

// --------------------------------------------------
// Generate realistic score based on team ratings
// --------------------------------------------------
function generateScore(rating1, rating2) {
  const prob1 = rating1 / (rating1 + rating2);
  const prob2 = rating2 / (rating1 + rating2);

  const goals1 = Math.round(Math.max(0, (Math.random() + prob1) * 3));
  const goals2 = Math.round(Math.max(0, (Math.random() + prob2) * 3));

  return [goals1, goals2];
}

// --------------------------------------------------
// Generate goal scorers from actual players
// --------------------------------------------------
function generateScorers(teamCountry, players, numGoals) {
  const scorers = [];
  
  if (!players || players.length === 0) {
    console.warn(`No players found for ${teamCountry}`);
    return scorers;
  }
  
  const attackers = players.filter(p => p.position === "AT" || p.position === "MD");
  const pool = attackers.length > 0 ? attackers : players;

  for (let i = 0; i < numGoals; i++) {
    const scorer = pool[Math.floor(Math.random() * pool.length)];
    scorers.push({
      player: scorer.name,
      team: teamCountry,
      minute: Math.floor(Math.random() * 90) + 1,
    });
  }
  return scorers.sort((a, b) => a.minute - b.minute);
}

// --------------------------------------------------
// Generate penalty shootout details with sudden death
// --------------------------------------------------
function generatePenaltyShootout(team1Country, team1Players, team2Country, team2Players, winner) {
  const penalties = {
    team1: [],
    team2: []
  };

  // Standard 5 penalties each
  for (let i = 0; i < 5; i++) {
    // Team 1 penalty
    const taker1 = team1Players[Math.floor(Math.random() * team1Players.length)];
    const scored1 = Math.random() > 0.3; // 70% conversion rate
    penalties.team1.push({
      player: taker1.name,
      team: team1Country,
      scored: scored1
    });

    // Team 2 penalty
    const taker2 = team2Players[Math.floor(Math.random() * team2Players.length)];
    const scored2 = Math.random() > 0.3;
    penalties.team2.push({
      player: taker2.name,
      team: team2Country,
      scored: scored2
    });
  }

  // Calculate scores after 5 each
  let team1Score = penalties.team1.filter(p => p.scored).length;
  let team2Score = penalties.team2.filter(p => p.scored).length;

  // Sudden death if still tied after 5
  let round = 6;
  while (team1Score === team2Score && round <= 10) { // Max 10 rounds to prevent infinite loop
    console.log(`   💥 Round ${round} - Sudden Death!`);
    
    // Team 1 sudden death penalty
    const taker1 = team1Players[Math.floor(Math.random() * team1Players.length)];
    const scored1 = Math.random() > 0.3;
    penalties.team1.push({
      player: taker1.name,
      team: team1Country,
      scored: scored1,
      suddenDeath: true
    });
    if (scored1) team1Score++;

    // Team 2 sudden death penalty
    const taker2 = team2Players[Math.floor(Math.random() * team2Players.length)];
    const scored2 = Math.random() > 0.3;
    penalties.team2.push({
      player: taker2.name,
      team: team2Country,
      scored: scored2,
      suddenDeath: true
    });
    if (scored2) team2Score++;

    // Check if we have a winner
    if (team1Score !== team2Score) {
      break;
    }
    
    round++;
  }

  // Determine actual winner based on penalty scores
  const actualWinner = team1Score > team2Score ? team1Country : team2Country;

  return {
    penalties,
    score: { team1: team1Score, team2: team2Score },
    winner: actualWinner,
    rounds: round - 1
  };
}

// --------------------------------------------------
// Determine winner (handles penalties)
// --------------------------------------------------
function determineWinner(team1, score1, team2, score2) {
  if (score1 > score2) return { ...team1, wonBy: "normal" };
  if (score2 > score1) return { ...team2, wonBy: "normal" };
  
  // Penalty shootout for draws
  const penaltyWinner = Math.random() > 0.5 ? team1 : team2;
  return { ...penaltyWinner, wonBy: "penalties" };
}


// --------------------------------------------------
// Update next round with winner
// --------------------------------------------------
async function updateNextRound(matchId, winner) {
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);
  
  if (!matchSnap.exists()) return;
  
  const match = matchSnap.data();
  if (!match.nextMatch) return; // Final has no next match
  
  const nextMatchRef = doc(db, "matches", match.nextMatch);
  const nextMatchSnap = await getDoc(nextMatchRef);
  
  if (!nextMatchSnap.exists()) return;
  
  const nextMatch = nextMatchSnap.data();
  const dependsOn = nextMatch.dependsOn || [];
  const slotIndex = dependsOn.indexOf(matchId);
  
  if (slotIndex === 0) {
    await updateDoc(nextMatchRef, {
      "team1.country": winner.country,
      "team1.teamId": winner.teamId,
      "team1.players": winner.players
    });
  } else if (slotIndex === 1) {
    await updateDoc(nextMatchRef, {
      "team2.country": winner.country,
      "team2.teamId": winner.teamId,
      "team2.players": winner.players
    });
  }
  
  // Check if next match is ready
  const dep1 = await getDoc(doc(db, "matches", dependsOn[0]));
  const dep2 = await getDoc(doc(db, "matches", dependsOn[1]));
  
  if (dep1.exists() && dep2.exists() && 
      dep1.data().status === "completed" && 
      dep2.data().status === "completed") {
    await updateDoc(nextMatchRef, { status: "pending" });
  }
}

// --------------------------------------------------
// SIMULATE MODE: Quick result without commentary
// --------------------------------------------------
export async function simulateMatch(matchId) {
  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);
  
  if (!matchSnap.exists()) {
    console.error("❌ Match not found:", matchId);
    return null;
  }
  
  const match = matchSnap.data();
  
  if (match.status !== "pending") {
    console.error("❌ Match not available. Status:", match.status);
    return null;
  }
  
  console.log(`\n🏟️  ${match.round}: ${match.team1.country} vs ${match.team2.country}`);
  
  // Get team ratings
  const team1Doc = await getDoc(doc(db, "teams", match.team1.teamId));
  const team2Doc = await getDoc(doc(db, "teams", match.team2.teamId));
  
  const rating1 = team1Doc.data()?.teamRating || 50;
  const rating2 = team2Doc.data()?.teamRating || 50;
  
  const [score1, score2] = generateScore(rating1, rating2);
  
  const scorers = [
    ...generateScorers(match.team1.country, match.team1.players, score1),
    ...generateScorers(match.team2.country, match.team2.players, score2)
  ];
  
  const winner = determineWinner(
    match.team1,
    score1,
    match.team2,
    score2
  );
  
  // ⭐ Generate penalty shootout if it's a draw
  let penaltyShootout = null;
  if (score1 === score2) {
    console.log("⚽ Match ended in a draw - going to penalties!");
    penaltyShootout = generatePenaltyShootout(
      match.team1.country,
      match.team1.players,
      match.team2.country,
      match.team2.players,
      winner
    );

    if (penaltyShootout.winner === match.team1.country) {
    winner.country = match.team1.country;
    winner.teamId = match.team1.teamId;
    winner.players = match.team1.players;
  } else {
    winner.country = match.team2.country;
    winner.teamId = match.team2.teamId;
    winner.players = match.team2.players;
  }
  winner.wonBy = "penalties";
}
  
  // ⭐ Update Firestore with penalty data
  await updateDoc(matchRef, {
    status: "completed",
    score: { team1: score1, team2: score2 },
    goalScorers: scorers,
    winner: winner,
    penaltyShootout: penaltyShootout, // ⭐ THIS IS KEY
    simulationType: "simulated",
    timestamp: new Date().toISOString()
  });
  
  console.log(`🏁 ${match.team1.country} ${score1} - ${score2} ${match.team2.country}`);
  
  // ⭐ Log penalty details
  if (winner.wonBy === "penalties" && penaltyShootout) {
    console.log(`🎯 ${winner.country} wins on penalties!`);
    console.log(`Penalty Score: ${penaltyShootout.score.team1} - ${penaltyShootout.score.team2}`);
  } else if (winner.wonBy === "penalties") {
    console.log(`🎯 ${winner.country} wins on penalties!`);
  }
  
  if (scorers.length > 0) {
    scorers.forEach(s => console.log(`⚽ ${s.player} (${s.team}) - ${s.minute}'`));
  } else {
    console.log("   No goals scored");
  }
  
  // Update next round
  await updateNextRound(matchId, winner);
  
  // Email notifications (optional)
  try {
    const { sendMatchResultEmail } = await import("./emailNotifications.js");
    await sendMatchResultEmail(match, score1, score2, scorers, winner);
  } catch (error) {
    console.log("   (Email notifications not configured)");
  }
  
  return {
    match,
    score1,
    score2,
    scorers,
    winner,
    penaltyShootout // ⭐ Return this so API can use it
  };
}

// --------------------------------------------------
// Get top scorers leaderboard
// --------------------------------------------------
export async function getTopScorers() {
  const matchesSnapshot = await getDocs(collection(db, "matches"));
  const scorerCounts = {};
  
  matchesSnapshot.forEach(docSnap => {
    const match = docSnap.data();
    if (match.goalScorers && Array.isArray(match.goalScorers)) {
      match.goalScorers.forEach(scorer => {
        const key = `${scorer.player}|${scorer.team}`;
        scorerCounts[key] = (scorerCounts[key] || 0) + 1;
      });
    }
  });
  
  const topScorers = Object.entries(scorerCounts)
    .map(([key, goals]) => {
      const [player, team] = key.split("|");
      return { player, team, goals };
    })
    .sort((a, b) => b.goals - a.goals);
  
  return topScorers;
}

// --------------------------------------------------
// PLAY MODE: AI-generated commentary
// --------------------------------------------------
// Update the playMatch function (replace existing one)
export async function playMatch(matchId) {
  console.log("🎮 PLAYING match with AI commentary...\n");
  
  // First simulate to get results
  const result = await simulateMatch(matchId);
  
  if (!result) return;
  
  // Generate AI commentary
  const commentary = await generateMatchCommentary(
    result.match,
    result.score1,
    result.score2,
    result.scorers,
    result.winner
  );
  
  // Update match with commentary
  const matchRef = doc(db, "matches", matchId);
  await updateDoc(matchRef, {
    commentary: commentary,
    simulationType: "played"
  });
  
  console.log("\n📰 MATCH COMMENTARY:\n");
  console.log("=".repeat(60));
  console.log(commentary);
  console.log("=".repeat(60));
  console.log("\n✅ Match played with AI commentary!");
  
  return { ...result, commentary };
}