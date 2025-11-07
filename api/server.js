// --------------------------------------------------
// server.js - Backend API Server
// --------------------------------------------------
// Purpose: Provides REST API endpoints for the frontend
// to interact with the tournament system
// --------------------------------------------------

import express from 'express';
import cors from 'cors';
import { createTeam } from '../teamGenerator.js';
import { simulateMatch, playMatch, getTopScorers } from '../matchSimulator.js';
import { generateTournament, resetTournament } from '../tournamentBracket.js';
import { db } from '../firebase.js';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Validators, ValidationError, validateTeamData } from '../utils/validation.js';

const app = express();
const PORT = 3001;

// Enable CORS - allows frontend (port 3000) to call backend (port 3001)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// --------------------------------------------------
// ENDPOINT 1: Create a new team
// Called from: RegisterTeamPage.js (when user registers 8th team)
// --------------------------------------------------
app.post('/api/teams/create', async (req, res) => {
  try {
    const { country, manager, createdBy } = req.body;
    
    // Validate and sanitize inputs
    const validated = validateTeamData(country, manager);
    
    // Check if team already exists
    const teamDoc = await getDoc(doc(db, 'teams', validated.country));
    if (teamDoc.exists()) {
      return res.status(400).json({ 
        error: `Team ${validated.country} is already registered` 
      });
    }
    
    // Create team using OOP class
    const team = await createTeam(
      validated.country, 
      validated.manager, 
      createdBy || 'admin'
    );
    
    console.log(`✅ Team created: ${validated.country}`);
    res.json(team);
    
  } catch (error) {
    // Handle validation errors specifically
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------------------------------------------
// ENDPOINT 2: Get count of registered teams
// Called from: AdminPage.js (to show "7/8 teams registered")
// --------------------------------------------------
app.get('/api/teams/count', async (req, res) => {
  try {
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    res.json({ count: teamsSnapshot.size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// ENDPOINT 3: Get all teams
// Called from: AdminPage.js, RepresentativePage.js
// --------------------------------------------------
app.get('/api/teams', async (req, res) => {
  try {
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    const teams = [];
    
    teamsSnapshot.forEach(doc => {
      teams.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// ENDPOINT 4: Start tournament (generate bracket)
// Called from: AdminPage.js (when admin clicks "Start Tournament")
// Only works when exactly 8 teams are registered
// --------------------------------------------------
app.post('/api/tournament/start', async (req, res) => {
  try {
    // Check team count first
    const teamsSnapshot = await getDocs(collection(db, 'teams'));
    const teamCount = teamsSnapshot.size;
    
    if (teamCount !== 8) {
      return res.status(400).json({ 
        error: `Need exactly 8 teams to start. Currently have ${teamCount} teams.` 
      });
    }
    
    // Generate the bracket
    const success = await generateTournament();
    
    if (success) {
      console.log('✅ Tournament started!');
      res.json({ 
        message: 'Tournament started successfully',
        teamsCount: teamCount
      });
    } else {
      res.status(500).json({ error: 'Failed to generate tournament' });
    }
  } catch (error) {
    console.error('Error starting tournament:', error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// ENDPOINT 5: Reset tournament
// Called from: AdminPage.js (when admin clicks "Reset Tournament")
// Clears all matches but keeps teams and users
// --------------------------------------------------
app.post('/api/tournament/reset', async (req, res) => {
  try {
    await resetTournament();
    console.log('✅ Tournament reset!');
    res.json({ message: 'Tournament reset successfully' });
  } catch (error) {
    console.error('Error resetting tournament:', error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// ENDPOINT 6: Get tournament status
// Called from: AdminPage.js (to check if tournament is ready)
// --------------------------------------------------
app.get('/api/tournament/status', async (req, res) => {
  try {
    const tournamentDoc = await getDoc(doc(db, 'tournament', 'current'));
    
    if (tournamentDoc.exists()) {
      res.json(tournamentDoc.data());
    } else {
      res.json({ status: 'not_started' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// ENDPOINT 7: Simulate a match (quick result, no commentary)
// Called from: AdminPage.js (when admin clicks "Simulate" button)
// --------------------------------------------------
app.post('/api/match/simulate', async (req, res) => {
  try {
    const { matchId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }
    
    console.log(`🎮 Simulating match: ${matchId}`);
    const result = await simulateMatch(matchId);
    
    if (!result) {
      return res.status(400).json({ error: 'Match not found or already played' });
    }
    
    console.log(`✅ Match ${matchId} simulated!`);
    res.json(result);
  } catch (error) {
    console.error('Error simulating match:', error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// ENDPOINT 8: Play a match (with AI commentary)
// Called from: AdminPage.js (when admin clicks "Play with AI" button)
// --------------------------------------------------
app.post('/api/match/play', async (req, res) => {
  try {
    const { matchId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ error: 'Match ID is required' });
    }
    
    console.log(`🎙️ Playing match with AI: ${matchId}`);
    const result = await playMatch(matchId);
    
    if (!result) {
      return res.status(400).json({ error: 'Match not found or already played' });
    }
    
    console.log(`✅ Match ${matchId} played with AI commentary!`);
    res.json(result);
  } catch (error) {
    console.error('Error playing match:', error);
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// ENDPOINT 9: Get all matches
// Called from: AdminPage.js, BracketPage.js
// --------------------------------------------------
app.get('/api/matches', async (req, res) => {
  try {
    const matchesSnapshot = await getDocs(collection(db, 'matches'));
    const matches = [];
    
    matchesSnapshot.forEach(doc => {
      matches.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by round order
    const order = { "Quarter-Final": 1, "Semi-Final": 2, "Final": 3 };
    matches.sort((a, b) => {
      if (order[a.round] !== order[b.round]) {
        return order[a.round] - order[b.round];
      }
      return a.matchNumber - b.matchNumber;
    });
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// ENDPOINT 10: Get top scorers
// Called from: TopScorersPage.js
// --------------------------------------------------
app.get('/api/scorers', async (req, res) => {
  try {
    const scorers = await getTopScorers();
    res.json(scorers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --------------------------------------------------
// Health check endpoint
// --------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// --------------------------------------------------
// Start the server
// --------------------------------------------------
app.listen(PORT, () => {
  console.log('🚀 ═══════════════════════════════════════════════');
  console.log(`🚀 African Nations League API Server`);
  console.log(`🚀 Running on: http://localhost:${PORT}`);
  console.log('🚀 ═══════════════════════════════════════════════');
  console.log('📡 Available endpoints:');
  console.log('   POST /api/teams/create     - Register new team');
  console.log('   GET  /api/teams/count      - Get team count');
  console.log('   GET  /api/teams            - Get all teams');
  console.log('   POST /api/tournament/start - Start tournament');
  console.log('   POST /api/tournament/reset - Reset tournament');
  console.log('   GET  /api/tournament/status- Get tournament status');
  console.log('   POST /api/match/simulate   - Simulate match');
  console.log('   POST /api/match/play       - Play match with AI');
  console.log('   GET  /api/matches          - Get all matches');
  console.log('   GET  /api/scorers          - Get top scorers');
  console.log('🚀 ═══════════════════════════════════════════════');
});