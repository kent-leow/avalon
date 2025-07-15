# User Story: 9 - Track Game Progress

**As a** player,
**I want** to see the current game state and progress,
**so that** I can understand where we are in the game and make informed decisions.

## Acceptance Criteria

* Players can see current round number with clear visual progression
* Mission results (success/fail) are displayed for completed missions with detailed history
* Current leader is clearly indicated with prominent visual markers
* Score tracker shows good vs evil mission wins with animated counters
* Game phase is clearly communicated (voting, mission, etc.) with contextual UI
* Player roles are hidden from other players with secure information architecture
* Vote history is accessible for reference with filterable timeline
* Mission team compositions are visible for completed missions with detailed breakdowns
* Game timer (if applicable) is displayed with tension-building countdown
* Real-time activity indicators show what each player is currently doing

## Enhanced UI/UX Specifications

### Modern Progress Tracking Design
- **Dashboard Layout**: Comprehensive game state overview with intuitive navigation
- **Progressive Disclosure**: Information revealed based on relevance and timing
- **Historical Context**: Easy access to past decisions and outcomes
- **Predictive Elements**: Hints about possible future states
- **Contextual Awareness**: UI adapts based on current game phase

### Color System (Enhanced)
| Design Color | Semantic Purpose | Element | Implementation Method |
|--------------|-----------------|---------|------------------------|
| #0a0a0f | Deep background | Dashboard base | bg-[#0a0a0f] with grid pattern |
| #1a1a2e | Primary brand | Progress panels | bg-[#1a1a2e] with gradient |
| #252547 | Elevated surface | History cards | bg-[#252547] with glass effect |
| #22c55e | Mission success | Success indicators | text-green-500 with glow |
| #ef4444 | Mission failure | Failure indicators | text-red-500 with pulse |
| #f59e0b | Current phase | Active indicators | text-amber-500 with bounce |
| #3b82f6 | Information | Data displays | text-blue-500 with shimmer |
| #8b5cf6 | Leadership | Leader indicators | text-purple-500 with crown |

### Animation & Interaction Design
- **Progress Indicators**:
  - Mission completion: Smooth progress bar fills
  - Score updates: Animated number counting
  - Phase transitions: Smooth state changes
  - Leader rotation: Crown transfer animation
- **Historical Views**:
  - Timeline scrolling: Smooth horizontal scroll
  - Mission details: Expandable cards with smooth transitions
  - Vote history: Filterable list with fade-in animations
  - Team compositions: Grid layout with hover effects

### Enhanced Visual Hierarchy
```
GameProgressDashboard (bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547])
├── Current Status Bar (fixed-top with key info)
│   ├── Round Number (large badge with progress)
│   ├── Current Phase (animated status indicator)
│   ├── Game Timer (countdown with tension)
│   └── Leader Indicator (crown with glow)
├── Mission Progress Track (central-timeline)
│   ├── Completed Missions (success/fail icons)
│   ├── Current Mission (highlighted with pulse)
│   ├── Future Missions (grayed out placeholders)
│   └── Score Tracker (animated tallies)
├── Player Status Panel (side-panel)
│   ├── Player List (avatars with status)
│   ├── Activity Indicators (real-time updates)
│   ├── Role Reminders (personal info only)
│   └── Connection Status (network indicators)
└── Historical Details (expandable-sections)
    ├── Mission History (detailed breakdowns)
    ├── Vote History (filterable timeline)
    ├── Team Compositions (visual grids)
    └── Decision Analytics (performance metrics)
```

### Progress Visualization Patterns
- **Mission Timeline**: Horizontal track with success/failure markers
- **Score Tracker**: Animated counters with team colors
- **Phase Indicators**: Clear visual state with smooth transitions
- **Leader Rotation**: Crown icon with smooth transfer animations
- **Activity Status**: Real-time indicators for player actions

### Interactive Elements
- **Mission Details**: Click to expand with detailed information
- **Vote History**: Filterable timeline with smooth animations
- **Player Status**: Hover for detailed activity information
- **Score Tracking**: Animated updates with celebration effects
- **Phase Transitions**: Smooth UI changes with loading states

### Information Architecture
- **Public Information**: Visible to all players (missions, scores, phases)
- **Private Information**: Player-specific data (role, personal notes)
- **Historical Data**: Past decisions and outcomes with context
- **Predictive Data**: Hints about upcoming phases and requirements
- **Real-time Data**: Live updates on player activity and game state

### Responsive Design
- **Mobile Layout**: Tabbed interface for different information types
- **Tablet Layout**: Side-by-side panels with smooth transitions
- **Desktop Layout**: Dashboard with multiple simultaneous views
- **Accessibility**: Screen reader support for all game state information

## Notes

* Real-time updates via Socket.IO `game:state:sync` event with optimistic UI
* UI adapts based on current game phase with contextual information
* Information visibility respects game rules with secure architecture
* State persisted in database for reliability with conflict resolution
* Historical data provides strategic context for decision-making
* Performance optimized for smooth real-time updates
* Mobile-first responsive design with touch-friendly interactions
