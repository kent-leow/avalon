# User Story: 10 - Assassin Attempt

**As an** assassin (evil player),
**I want** to attempt to identify and kill Merlin when good wins 3 missions,
**so that** evil can still win the game.

## Acceptance Criteria

* Assassin phase triggers only if good team wins 3 missions with dramatic transition
* Only the assassin can make the kill attempt with exclusive interface
* Assassin can see all players and select their target with strategic information
* Assassin has one attempt to identify Merlin with high-stakes tension
* If Merlin is correctly identified, evil wins with dramatic victory sequence
* If wrong player is selected, good wins with celebration animation
* All players can see the assassin's choice with suspenseful reveal
* Game ends immediately after assassin's decision with final results
* Final game result is displayed to all players with comprehensive breakdown

## Enhanced UI/UX Specifications

### Modern Assassin Interface Design
- **High-Stakes Atmosphere**: Dark, tense visual design with dramatic lighting
- **Strategic Information**: Clear display of all relevant game information
- **Pressure Elements**: Countdown timer and tension-building effects
- **Dramatic Reveal**: Cinematic sequence for the final decision
- **Finality Emphasis**: Clear indication that this is the game's decisive moment

### Color System (Enhanced)
| Design Color | Semantic Purpose | Element | Implementation Method |
|--------------|-----------------|---------|------------------------|
| #0a0a0f | Deep darkness | Assassin chamber | bg-[#0a0a0f] with shadows |
| #1a1a2e | Primary brand | Interface panels | bg-[#1a1a2e] with ominous glow |
| #252547 | Elevated surface | Player cards | bg-[#252547] with dark glass |
| #ef4444 | Deadly intent | Assassin UI | text-red-500 with blood-red glow |
| #8b5cf6 | Mystical power | Merlin hints | text-purple-500 with ethereal glow |
| #22c55e | Life/Good | Target selection | text-green-500 with holy light |
| #f59e0b | Final warning | Decision timer | text-amber-500 with urgency |
| #3b82f6 | Strategic info | Game context | text-blue-500 with wisdom |

### Animation & Interaction Design
- **Assassin Reveal**:
  - Phase transition: Screen darkens with ominous music
  - Assassin identity: Dramatic reveal with red spotlight
  - Power visualization: Swirling dark energy effects
  - Interface emergence: UI elements fade in with menace
- **Target Selection**:
  - Player cards: Hover effects with life/death implications
  - Selection indicator: Red targeting crosshair with pulse
  - Confirmation: Dramatic "Are you sure?" modal with consequences
  - Final choice: Slow-motion selection with screen flash
- **Result Revelation**:
  - Suspenseful pause: 3-second silence with heartbeat
  - Identity reveal: Dramatic unveiling of Merlin's true identity
  - Victory/defeat: Explosive animation based on outcome
  - Game conclusion: Smooth transition to final results

### Enhanced Visual Hierarchy
```
AssassinScreen (bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547])
├── Assassin Identity Panel (dark-glass with red accents)
│   ├── Assassin Badge (skull icon with red glow)
│   ├── Power Description (ominous text with shadows)
│   ├── Strategic Context (mission results summary)
│   └── Decision Timer (countdown with red pulse)
├── Player Selection Grid (target-grid layout)
│   └── Player Target Cards (hover-glow with life indicators)
│       ├── Player Avatar (circular with targeting overlay)
│       ├── Player Name (text-lg with dramatic font)
│       ├── Strategic Hints (subtle clues about behavior)
│       └── Selection State (red crosshair when targeted)
├── Game Context Panel (floating-sidebar)
│   ├── Mission Results (3 good wins reminder)
│   ├── Voting Patterns (strategic analysis)
│   ├── Team Compositions (historical data)
│   └── Behavioral Clues (subtle hints)
└── Confirmation Modal (dramatic-overlay)
    ├── Target Confirmation (large avatar with name)
    ├── Consequence Warning (win/lose implications)
    ├── Final Decision (kill/spare buttons)
    └── Result Sequence (cinematic reveal)
```

### Strategic Information Display
- **Mission History**: Visual timeline of all completed missions
- **Voting Patterns**: Analysis of each player's voting behavior
- **Team Participation**: Who was on which mission teams
- **Behavioral Clues**: Subtle hints about player behavior patterns
- **Merlin Indicators**: Strategic information to help identify Merlin

### Dramatic Sequence Design
- **Phase Transition**: Smooth darkening with ominous music
- **Assassin Reveal**: Spotlight effect with power visualization
- **Target Selection**: High-contrast player cards with targeting
- **Decision Moment**: Slow-motion effects with screen flash
- **Result Reveal**: Cinematic unveiling with dramatic music
- **Game Conclusion**: Smooth transition to victory/defeat screen

### Tension-Building Elements
- **Countdown Timer**: Red pulsing timer with urgency effects
- **Atmospheric Effects**: Subtle particle systems and shadows
- **Sound Design**: Heartbeat, whispers, and dramatic stings
- **Visual Pressure**: Darkening screen edges, spotlight effects
- **Psychological Elements**: Color psychology to enhance tension

## Notes

* This is the final phase of the game with maximum dramatic impact
* Assassin role must be included in game configuration with proper setup
* Uses Socket.IO for real-time assassination attempt with immediate feedback
* Game result is final and cannot be changed with secure validation
* Strategic information helps assassin make informed decision
* Cinematic presentation creates memorable climax moment
* Mobile-optimized with touch-friendly target selection
* Comprehensive analytics track decision-making patterns
