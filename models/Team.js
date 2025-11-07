// --------------------------------------------------
// Team.js - Team Class (OOP)
// --------------------------------------------------
// Demonstrates: Composition, Encapsulation, Business Logic
// --------------------------------------------------

import { Player } from './Player.js';

export class Team {
  constructor(country, manager, createdBy) {
    // Validate required fields
    if (!country || !manager) {
      throw new Error("Country and manager are required");
    }
    
    this.country = country;
    this.manager = manager;
    this.createdBy = createdBy;
    this.players = []; // Composition - Team HAS players
    this.teamRating = 0;
    this.createdAt = new Date().toISOString();
  }

  // Add single player to squad
  addPlayer(player) {
    if (!(player instanceof Player)) {
      throw new Error("Must add a Player instance");
    }
    
    if (this.players.length >= 23) {
      throw new Error("Squad is full (max 23 players)");
    }
    
    this.players.push(player);
    this.updateTeamRating();
  }

  // Generate full squad of 23 players - Business logic
  generateSquad() {
    const positions = ["GK", "DF", "MD", "AT"];
    const usedNames = new Set();

    // Clear existing players
    this.players = [];

    // Generate 23 players
    for (let i = 0; i < 23; i++) {
      const position = positions[Math.floor(Math.random() * positions.length)];
      let name = this.generatePlayerName();

      // Ensure unique names within squad
      while (usedNames.has(name)) {
        name = this.generatePlayerName();
      }
      usedNames.add(name);

      const player = new Player(name, position, false);
      this.players.push(player);
    }

    // Assign captain randomly
    const captainIndex = Math.floor(Math.random() * 23);
    this.players[captainIndex].isCaptain = true;

    // Calculate team rating
    this.updateTeamRating();
  }

  // Generate realistic African player names
  generatePlayerName() {
    const firstNames = [
      "Abel", "Tunde", "Kwame", "Amina", "Fatou", "Sibusiso", "Mohamed", "Lindiwe",
      "Samuel", "Chidi", "Aisha", "Kofi", "Nia", "Thabo", "Zola", "Ama", "Tariq", 
      "Ngozi", "Keita", "Mamadou", "Youssef", "Kwesi", "Nkosi", "Sekou", "Amara",
      "Blessing", "Emmanuel", "Chiamaka", "Tendai", "Rashid", "Kabiru", "Jelani"
    ];
    
    const lastNames = [
      "Mensah", "Nkosi", "Adomako", "Okeke", "Mokoena", "Diallo", "Mohammed",
      "Kamara", "Abebe", "Chukwu", "Dlamini", "Kone", "Otieno", "Sekou",
      "Toure", "Ndlovu", "Okafor", "Musa", "Traore", "Balogun", "Zuma"
    ];

    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
  }

  // Calculate team rating from all players - Encapsulation
  updateTeamRating() {
    if (this.players.length === 0) {
      this.teamRating = 0;
      return;
    }

    const total = this.players.reduce((sum, player) => {
      return sum + player.getOverallRating();
    }, 0);

    this.teamRating = Math.round(total / this.players.length);
  }

  // Get captain - Business logic
  getCaptain() {
    return this.players.find(p => p.isCaptain);
  }

  // Get players by position - Query method
  getPlayersByPosition(position) {
    return this.players.filter(p => p.position === position);
  }

  // Get attackers and midfielders (potential scorers)
  getPotentialScorers() {
    return this.players.filter(p => p.position === "AT" || p.position === "MD");
  }

  // Get squad size
  getSquadSize() {
    return this.players.length;
  }

  // Validate squad completeness
  isValidSquad() {
    return (
      this.players.length === 23 &&
      this.players.some(p => p.isCaptain) &&
      this.players.every(p => p.isValid())
    );
  }

  // Get squad statistics
  getSquadStats() {
    const positionCounts = {
      GK: 0,
      DF: 0,
      MD: 0,
      AT: 0
    };

    this.players.forEach(p => {
      positionCounts[p.position]++;
    });

    return {
      totalPlayers: this.players.length,
      captain: this.getCaptain()?.name,
      teamRating: this.teamRating,
      positionDistribution: positionCounts,
      averageRating: this.teamRating
    };
  }

  // Serialization for Firebase
  toJSON() {
    return {
      country: this.country,
      manager: this.manager,
      createdBy: this.createdBy,
      teamRating: this.teamRating,
      players: this.players.map(p => p.toJSON()),
      createdAt: this.createdAt
    };
  }

  // Deserialization - Factory method
  static fromJSON(data) {
    if (!data || !data.country || !data.manager) {
      throw new Error("Invalid team data");
    }
    
    const team = new Team(data.country, data.manager, data.createdBy);
    team.players = (data.players || []).map(p => Player.fromJSON(p));
    team.teamRating = data.teamRating || 0;
    team.createdAt = data.createdAt || new Date().toISOString();
    return team;
  }

  // String representation
  toString() {
    return `${this.country} (${this.manager}) - Rating: ${this.teamRating} - ${this.getSquadSize()} players`;
  }
}