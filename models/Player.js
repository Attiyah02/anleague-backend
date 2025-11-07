// --------------------------------------------------
// Player.js - Player Class (OOP)
// --------------------------------------------------
// Demonstrates: Encapsulation, Methods, Data Abstraction
// --------------------------------------------------

export class Player {
  constructor(name, position, isCaptain = false) {
    // Private-like properties (encapsulation)
    this.name = name;
    this.position = position; // GK, DF, MD, AT
    this.isCaptain = isCaptain;
    this.ratings = {};
    
    // Auto-generate ratings on instantiation
    this.generateRatings();
  }

  // Private method - Encapsulation principle
  generateRatings() {
    const positions = ["GK", "DF", "MD", "AT"];
    
    positions.forEach(pos => {
      if (pos === this.position) {
        // Natural position: 50-100 (as per requirements)
        this.ratings[pos] = this.weightedRandom(50, 100, 0.8);
      } else {
        // Off-position: 0-50 (as per requirements)
        this.ratings[pos] = this.weightedRandom(0, 50, 2);
      }
    });
  }

  // Helper method with weighted randomization
  weightedRandom(min, max, weight = 1) {
    return Math.floor(Math.pow(Math.random(), weight) * (max - min + 1)) + min;
  }

  // Public method - Data abstraction
  getOverallRating() {
    const sum = Object.values(this.ratings).reduce((a, b) => a + b, 0);
    return Math.round(sum / 4);
  }

  // Get rating for specific position
  getRating(position) {
    return this.ratings[position] || 0;
  }

  // Business logic - Check if player can play position effectively
  canPlayPosition(position) {
    return this.ratings[position] >= 50;
  }

  // Validate player data
  isValid() {
    return (
      this.name &&
      this.position &&
      ["GK", "DF", "MD", "AT"].includes(this.position) &&
      Object.keys(this.ratings).length === 4
    );
  }

  // Serialization - Convert to plain object for Firebase
  toJSON() {
    return {
      name: this.name,
      position: this.position,
      isCaptain: this.isCaptain,
      ratings: this.ratings
    };
  }

  // Deserialization - Factory method pattern
  static fromJSON(data) {
    if (!data || !data.name || !data.position) {
      throw new Error("Invalid player data");
    }
    
    const player = new Player(data.name, data.position, data.isCaptain);
    player.ratings = data.ratings;
    return player;
  }

  // String representation
  toString() {
    return `${this.name} (${this.position}${this.isCaptain ? " - Captain" : ""}) - Rating: ${this.getOverallRating()}`;
  }
}