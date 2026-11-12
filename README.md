# 🏈 Fantasy Football Simulator & Monte Carlo Strategy Lab

An agentic, high-performance fantasy football drafting simulator and 14-week head-to-head season engine built with React, TypeScript, Tailwind CSS, and hosted live on Firebase.

🌐 **Live Application**: [https://fantasy-football-sim.web.app](https://fantasy-football-sim.web.app)  
📦 **GitHub Repository**: [nikhilgrover/fantasy-football-simulator](https://github.com/nikhilgrover/fantasy-football-simulator)

---

## 🌟 Key Features

### 1. Dual Simulation Modes
- **Interactive Draft Room**:
  - Live 15-round snake draft board (Rounds 1–15 with 1→N, N→1 round reversal).
  - Draft clock with user turn detection and notifications.
  - Controls: "Draft Player", "Sim 1 Pick", "Sim to My Turn", "Fast-Forward Draft", and "Reset Draft".
  - Player search by name and team.
  - Position filters: `ALL`, `QB`, `RB`, `WR`, `TE`, `K`, `DEF`, and a dedicated **`Rookies Only`** toggle.
  - Dual right-panel toggle between **My Roster** (positional starters + 6 bench slots) and **Live Pick History**.
- **Monte Carlo Strategy Benchmark Lab**:
  - Benchmark draft philosophies against each other across **25 to 500 complete seasons**.
  - Compare **Hero RB**, **Zero RB**, **Best Player Available (BPA)**, **Robust RB**, **Elite QB Early**, and **Elite TE Early**.
  - Detailed output: Championship Rate %, Playoff Qualification %, Average Regular Season Wins, Average Season Points, and Finish distribution.

### 2. Full 14-Week Head-to-Head Regular Season Sim & Playoffs
- **Realistic Schedule Generator**:
  - Creates a balanced round-robin head-to-head schedule for 8, 10, or 12 teams across 14 regular season weeks.
- **Start/Sit Optimization**:
  - Solves the optimal weekly starting lineup (1 QB, 2 RB, 2 WR, 1 TE, 1 FLEX, 1 K, 1 DEF) while benching lower scorers.
  - Properly enforces NFL bye weeks (benched players receive 0 points during their bye).
- **Weekly Score Distribution (Box-Muller Transform)**:
  - Models realistic game-to-game variance using position-specific standard deviations (boom/bust games for WRs/QBs, steady floors for RBs/Ks).
- **Interactive Box Scores**:
  - Week-by-week matchup scores with expandable starter vs starter duels.
- **Playoff Tournament & Podium (Weeks 15–16)**:
  - Top 4 seeds battle in single-elimination Semifinals and Championship Game, plus a 3rd Place consolation game.
  - League champion celebration with gold trophy and confetti.

### 3. Customizable League Rules & Projections
- **League Sizes**: 8 Teams (Deep/Casual), 10 Teams (Standard), 12 Teams (Competitive).
- **Scoring Formats**:
  - Standard (0.0 PPR)
  - Half PPR (0.5 PPR - Default)
  - Full PPR (1.0 PPR)
- **Draft Positions**: Slot #1 through #12.
- **Rich Player Database (194+ Players)**:
  - 2025 Projections + Incoming Rookies (Marvin Harrison Jr., Jayden Daniels, Caleb Williams, Malik Nabers, Brock Bowers, Rome Odunze, Jonathon Brooks, Trey Benson, Brian Thomas Jr., Ladd McConkey, etc.).
  - Historical stats for 2024, 2023, and 2022 actuals.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 18+ with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS (Dark Mode by default)
- **Icons**: Lucide React
- **Visuals**: Canvas Confetti
- **Hosting**: Firebase Hosting (`fantasy-sim-12184`)
- **Code Quality**: Strict `verbatimModuleSyntax` and zero unused local variables enforced.

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/nikhilgrover/fantasy-football-simulator.git
cd fantasy-football-simulator

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run production build & verify strict linting
npm run build
```

---

## 🚢 Deployment to Firebase

```bash
# Build the production bundle
npm run build

# Deploy hosting
npx firebase-tools deploy --only hosting
```

