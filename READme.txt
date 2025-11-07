# African Nations League 2026 - Tournament Management System

## Table of Contents

- 1.Features
- 2.Technologies Used
- 3.Project Structure
- 4.Installation & Setup
- 5.Database Setup
- 6.Configuration
- 7.Running the Application
- 8.User Roles
- 9.API Endpoints
- 10. Available scripts
.Credits
----------------------------------------------------------------------------------------------------

## 1.Features

### Core Functionality
- Team Registration: Representatives can register their national team (auto-generates 23 players)
- Tournament Bracket: Knockout format (Quarter-Finals → Semi-Finals → Final)
- Match Simulation: Two modes - Quick simulate or AI commentary
- Real-time Updates: Live bracket and statistics
- User Authentication: Firebase Auth with role-based access (Admin/Representative)
- Top Scorers Leaderboard: Track leading goal scorers across the tournament
- AI Match Commentary: GEMINI AI integration for realistic play-by-play narration
- Penalty Shootouts: Detailed penalty tracking with sudden death support
- Team Analytics: Performance metrics, win/loss records, goal statistics
- Responsive Design: CAF-themed interface with stadium backgrounds
--------------------------------------------------------------------------------------------------------

## 2.Technologies Used

### Frontend
- React 18 - UI framework
- React Router - Client-side routing
- React Icons - Icon library
- CSS3 - Custom styling with CAF theme

### Backend
- Node.js - Runtime environment
- Express.js - REST API framework
- Firebase Firestore- NoSQL database
- Firebase Authentication - User authentication

### External APIs
- GEMINI AI API- AI match commentary generation

### Development Tools
- Vite - Build tool
- dotenv - Environment variables
- CORS - Cross-origin resource sharing
------------------------------------------------------------------------------

## 3.Project Structure
```
african-nations-league/
├── ANLeague2026/                  # Backend
│   ├── api/
│   │   └── server.js              # Express API server
│   ├── models/                    # OOP Classes
│   │   ├── Player.js              # Player class
│   │   ├── Team.js                # Team class
│   │   └── Match.js               # Match class
│   ├── utils/
│   │   └── validation.js          # Input validation & security
│   ├── scripts/                   # Utility scripts
│   │   ├── clearDatabase.js       # Clear Firestore data
│   │   ├── seedAdminOnly.js       # Create admin account
│   │   ├── seed7Teams.js          # Create 7 teams for demo
│   │   ├── simulateAllMatches.js  # Auto-simulate tournament
│   │   └── testEmail.js           # Test email configuration
│   ├── firebase.js                # Firebase configuration
│   ├── userManagement.js          # User CRUD operations
│   ├── teamGenerator.js           # Team generation logic
│   ├── matchSimulator.js          # Match simulation engine
│   ├── emailNotifications.js      # Email service
│   ├── .env                       # Environment variables
│   └── package.json
│
└── anleague-frontend/             # Frontend
    ├── public/
    │   └── images/
    │       └── stadium-dark.jpg   # Background image
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js          # Navigation component
    │   ├── pages/
    │   │   ├── HomePage.js        # Landing page
    │   │   ├── LoginPage.js       # User login
    │   │   ├── SignUpPage.js      # User registration
    │   │   ├── RegisterTeamPage.js # Team registration
    │   │   ├── AdminPage.js       # Admin dashboard
    │   │   ├── RepresentativePage.js # Team dashboard
    │   │   ├── BracketPage.js     # Tournament bracket
    │   │   ├── MatchPage.js       # Match details
    │   │   └── TopScorersPage.js  # Scorers leaderboard
    │   ├── utils/
    │   │   └── countryFlags.js    # Country flag emojis
    │   ├── firebase.js            # Firebase config
    │   ├── App.js                 # Main app component
    │   └── main.jsx               # Entry point
    └── package.json
```
--------------------------------------------------------------------------
## 4. Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm 
- Firebase Account (free tier)
- GEMINI AI API Key

### Step 1:Clone Repository
```bash
git clone <your-repo-url>
cd african-nations-league
```

### Step 2:Install Backend Dependencies
```bash
cd ANLeague2026
npm install
```

### Step 3:Install Frontend Dependencies
```bash
cd anleague-frontend
npm install
```

------------------------------------------------------------------------

## 5.Database Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name: `African Nations League`

### 2. Enable Authentication
1. In Firebase Console → Authentication
2. Click "Get Started"
3. Enable "Email/Password" sign-in method

### 3. Create Firestore Database
1. In Firebase Console → Firestore Database
2. Click "Create Database"
3. Select "Start in test mode" (for development)
4. Choose location closest to you

### 4. Get Firebase Configuration
1. Project Settings → General
2. Scroll to "Your apps"
3. Click Web icon (`</>`)
4. Register app name: `anleague-frontend`
5. Copy the `firebaseConfig` object

----------------------------------------------------------------------

## 6.Configuration

### Backend Configuration

Create `ANLeague2026/.env`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# GEMINI AI API Configuration (For AI commentary)
GEMINIAI_API_KEY=sk-your-openai-api-key

# Server Configuration
PORT=3001
```

### Frontend Configuration

Create `anleague-frontend/.env`:
```env
# Same Firebase config as backend
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

-----------------------------------------------------------------------------

## 7.Running the Application

### Manual Start 

Terminal 1 - Backend:
```bash
cd ANLeague2026
npm run api
```
Backend runs on: `http://localhost:3001`

Terminal 2 - Frontend:
```bash
cd anleague-frontend
npm start
```
Frontend runs on: `http://localhost:3000`

# Clear all data
npm run clear:db

# Create admin account
npm run seed:admin

# Create 7 teams (leaving space for 8th team demo)
npm run seed:7teams
```

---------------------------------------------------------------------------

## 8.User Roles

### 1. Admin
Login: `admin@afnl.com` / `admin123`

Permissions:
- Start tournament
- Simulate matches
- Reset tournament
- View all teams
- Access admin dashboard

### 2. Representative
Example: `southafrica@afnl.com` / `sa123456`

Permissions:
- Register team
- View team dashboard
- Track team performance
- View match history
- See tournament bracket

### 3. Visitor (No login required)
Permissions:
- View homepage
- View tournament bracket
- View top scorers
- View match details

-----------------------------------------------------------------------------------------

## 9.API Endpoints

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/count` - Get team count
- `POST /api/teams/create` - Create team

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get specific match
- `POST /api/match/simulate` - Simulate match (quick)
- `POST /api/match/play` - Play match (with AI commentary)

### Tournament
- `GET /api/tournament/status` - Get tournament status
- `POST /api/tournament/start` - Start tournament
- `POST /api/tournament/reset` - Reset tournament

------------------------------------------------------------------------------------------
## 10.Available Scripts

### Backend (ANLeague2026)
```bash
npm run api              # Start API server
npm run clear:db         # Clear all Firestore data
npm run seed:admin       # Create admin account
npm run seed:7teams      # Create 7 teams
npm run simulate:all     # Auto-simulate all matches
npm run verify:users     # List all users
npm run verify:teams     # List all teams
```

### Frontend (`anleague-frontend/`)
```bash
npm start               # Start development server

