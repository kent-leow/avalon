# User Story: 8 - Execute Mission

**As a** selected mission team member,
**I want** to vote for the mission to succeed or fail,
**so that** I can contribute to my team's victory condition.

## Acceptance Criteria

* Only selected team members can vote on mission outcome with role-based restrictions
* Good players can only vote for success with clear visual constraints
* Evil players can choose to vote for success or failure with strategic indicators
* Mission outcome is determined by presence of any fail votes with dramatic calculation
* One fail vote causes mission to fail (except for certain missions requiring 2 fails)
* Vote is anonymous until results are revealed with suspenseful buildup
* All team members must vote before results are shown with progress tracking
* Mission result is broadcast to all players with cinematic reveal
* Game state updates with mission outcome and affects overall progression

## Enhanced UI/UX Specifications

### Modern Mission Interface Design
- **Role-Based UI**: Different interfaces for good vs evil players
- **Strategic Tension**: Visual elements that build suspense
- **Cinematic Reveals**: Dramatic animations for mission outcomes
- **Team Coordination**: Clear indication of who is voting
- **Consequence Visualization**: Clear display of what's at stake

### Color System (Enhanced)
| Design Color | Semantic Purpose | Element | Implementation Method |
|--------------|-----------------|---------|------------------------|
| #0a0a0f | Deep background | Mission chamber | bg-[#0a0a0f] with flickering |
| #1a1a2e | Primary brand | Mission panels | bg-[#1a1a2e] with gradient |
| #252547 | Elevated surface | Vote interface | bg-[#252547] with glass |
| #22c55e | Mission success | Success button | bg-green-600 with radiance |
| #ef4444 | Mission failure | Failure button | bg-red-600 with ominous glow |
| #f59e0b | Warning | Critical moments | text-amber-500 with pulse |
| #3b82f6 | Info | Mission details | text-blue-500 with shimmer |
| #8b5cf6 | Mystical | Outcome reveal | text-purple-500 with explosion |

### Animation & Interaction Design
- **Mission Voting**:
  - Button activation: Dramatic scale with screen flash
  - Vote submission: Fade to "voted" state with particle effects
  - Waiting state: Pulsing indicator for other voters
  - Tension building: Subtle screen vibration during countdown
- **Results Reveal**:
  - Dramatic pause: 3-second silence with heartbeat sound
  - Vote reveal: Each vote appears with impact animation
  - Outcome calculation: Mathematical visualization of success/failure
  - Victory/defeat: Explosive celebration or dramatic failure

### Enhanced Visual Hierarchy
```
MissionScreen (bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547])
├── Mission Context Panel (glass-card with mission details)
│   ├── Mission Number (large badge with progress)
│   ├── Team Members (avatar-grid with roles)
│   ├── Success Requirements (visual indicators)
│   └── Failure Consequences (warning badges)
├── Voting Interface (role-specific design)
│   ├── Success Button (always available, green glow)
│   ├── Failure Button (evil only, red ominous glow)
│   ├── Role Reminder (subtle indicator)
│   └── Strategic Hints (contextual tooltips)
├── Team Status (floating-panel)
│   ├── Votes Submitted (progress-bar)
│   ├── Waiting Indicators (pulsing avatars)
│   └── Countdown Timer (tension-building)
└── Results Theater (full-screen overlay)
    ├── Vote Reveal (dramatic-sequence)
    ├── Outcome Calculation (mathematical-animation)
    ├── Mission Result (explosive-reveal)
    └── Game Impact (progression-update)
```

### Role-Based Interface Design
- **Good Players**: Only success button visible, with golden glow
- **Evil Players**: Both buttons available, failure button with subtle temptation
- **Strategic Indicators**: Contextual hints about optimal choices
- **Psychological Elements**: Color psychology to influence decision-making
- **Tension Building**: Countdown and waiting indicators create suspense

### Mission Outcome Animations
- **Success**: Bright explosion of light, celebration particles
- **Failure**: Dark implosion effect, ominous shadows
- **Critical Success**: Extra dramatic effects for pivotal missions
- **Critical Failure**: Enhanced failure animations for game-ending moments
- **Transition**: Smooth movement to next game phase

## Notes

* Mission voting rules vary by game size and mission number with clear visual indicators
* Uses Socket.IO `mission:vote` and `mission:result` events with real-time synchronization
* Backend enforces role-based voting constraints with security validation
* Mission results affect overall game progression with dramatic state updates
* Psychological design elements enhance the tension and strategic decision-making
* Cinematic reveal sequences create memorable moments for players
* Mobile-optimized for touch interactions with haptic feedback
