// --------------------------------------------------
// Match.js - Match Class (OOP)
// --------------------------------------------------
// Demonstrates: State Management, Business Logic
// --------------------------------------------------

export class Match {
  constructor(matchId, round, matchNumber, team1, team2) {
    this.matchId = matchId;
    this.round = round; // Quarter-Final, Semi-Final, Final
    this.matchNumber = matchNumber;
    this.team1 = team1;
    this.team2 = team2;
    this.status = "pending"; // pending, completed, locked
    this.score = { team1: null, team2: null };
    this.goalScorers = [];
    this.winner = null;
    this.simulationType = null; // simulated, played
    this.commentary = null;
    this.timestamp = null;
    this.nextMatch = null;
    this.dependsOn = [];
  }

  // Simulate the match - Business logic
  simulate(rating1, rating2) {
    if (this.status === "completed") {
      throw new Error("Match already completed");
    }

    if (this.status === "locked") {
      throw new Error("Match is locked. Previous matches must complete first.");
    }

    const prob1 = rating1 / (rating1 + rating2);
    const prob2 = rating2 / (rating1 + rating2);

    const goals1 = Math.round(Math.max(0, (Math.random() + prob1) * 3));
    const goals2 = Math.round(Math.max(0, (Math.random() + prob2) * 3));

    this.score = { team1: goals1, team2: goals2 };
    this.determineWinner();
    this.status = "completed";
    this.timestamp = new Date().toISOString();
    this.simulationType = "simulated";
  }

  // Determine winner with penalty shootout logic
  determineWinner() {
    if (this.score.team1 > this.score.team2) {
      this.winner = { ...this.team1, wonBy: "normal" };
    } else if (this.score.team2 > this.score.team1) {
      this.winner = { ...this.team2, wonBy: "normal" };
    } else {
      // Penalty shootout for draws
      const penaltyWinner = Math.random() > 0.5 ? this.team1 : this.team2;
      this.winner = { ...penaltyWinner, wonBy: "penalties" };
    }
  }

  // Add goal scorer
  addGoalScorer(playerName, team, minute) {
    if (minute < 1 || minute > 90) {
      throw new Error("Goal minute must be between 1 and 90");
    }

    this.goalScorers.push({
      player: playerName,
      team: team,
      minute: minute
    });
    
    // Sort by minute
    this.goalScorers.sort((a, b) => a.minute - b.minute);
  }

  // Check if match can be played
  canBePlayed() {
    return (
      this.status === "pending" && 
      this.team1.country !== "TBD" && 
      this.team2.country !== "TBD"
    );
  }

  // Check if match is knockout stage
  isKnockout() {
    return ["Quarter-Final", "Semi-Final", "Final"].includes(this.round);
  }

  // Get match result summary
  getResultSummary() {
    if (this.status !== "completed") {
      return "Match not yet played";
    }

    const result = `${this.team1.country} ${this.score.team1} - ${this.score.team2} ${this.team2.country}`;
    const winnerInfo = this.winner.wonBy === "penalties" 
      ? ` (${this.winner.country} won on penalties)`
      : ` (Winner: ${this.winner.country})`;
    
    return result + winnerInfo;
  }

  // Validate match data
  isValid() {
    return (
      this.matchId &&
      this.round &&
      this.team1 &&
      this.team2 &&
      this.team1.country &&
      this.team2.country
    );
  }

  // Serialization for Firebase
  toJSON() {
    return {
      matchId: this.matchId,
      round: this.round,
      matchNumber: this.matchNumber,
      team1: this.team1,
      team2: this.team2,
      status: this.status,
      score: this.score,
      goalScorers: this.goalScorers,
      winner: this.winner,
      simulationType: this.simulationType,
      commentary: this.commentary,
      timestamp: this.timestamp,
      nextMatch: this.nextMatch,
      dependsOn: this.dependsOn
    };
  }

  // Deserialization - Factory method
  static fromJSON(data) {
    if (!data || !data.matchId) {
      throw new Error("Invalid match data");
    }

    const match = new Match(
      data.matchId,
      data.round,
      data.matchNumber,
      data.team1,
      data.team2
    );
    
    Object.assign(match, {
      status: data.status || "pending",
      score: data.score || { team1: null, team2: null },
      goalScorers: data.goalScorers || [],
      winner: data.winner,
      simulationType: data.simulationType,
      commentary: data.commentary,
      timestamp: data.timestamp,
      nextMatch: data.nextMatch,
      dependsOn: data.dependsOn || []
    });
    
    return match;
  }

  // String representation
  toString() {
    if (this.status === "completed") {
      return `${this.round}: ${this.getResultSummary()}`;
    }
    return `${this.round}: ${this.team1.country} vs ${this.team2.country} (${this.status})`;
  }
}