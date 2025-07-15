# User Story: 6 - Select Mission Team

**As a** mission leader,
**I want** to select players for the current mission,
**so that** I can propose a team to complete the quest.

## Acceptance Criteria

* Current leader can select the required number of players for the mission
* Mission requirements (number of players) are displayed clearly
* Leader can change their selection before submitting
* Selected players are highlighted in the UI
* Leader cannot select themselves if not required
* Selection is validated against mission requirements
* Once submitted, the proposal goes to voting phase
* All players can see the proposed team
* Leader selection rotates in round-robin fashion

## Notes

* Mission team size varies by round number and player count
* Uses Socket.IO `mission:select` event for real-time updates
* Backend validates team composition
* UI shows current leader with visual indicator

## Implementation Plan

### 1. Feature Overview

Create a mission team selection interface that allows the current leader to choose players for the mission according to game rules. The primary user role is the mission leader who must select the appropriate number of players for each round.

### 2. Component Analysis & Reuse Strategy

**Existing Components:**
- No existing components are suitable for reuse for this feature

**New Components Required:**
- `MissionTeamSelector` - New component needed for the main team selection interface
- `PlayerSelectionGrid` - New component needed for player selection grid
- `MissionRequirements` - New component needed to display mission requirements
- `SelectedTeamDisplay` - New component needed to show current selection
- `SubmitTeamButton` - New component needed for team submission

### 3. Affected Files

```
- [CREATE] src/app/room/[roomCode]/game/MissionTeamSelector.tsx
- [CREATE] src/app/room/[roomCode]/game/PlayerSelectionGrid.tsx
- [CREATE] src/app/room/[roomCode]/game/MissionRequirements.tsx
- [CREATE] src/app/room/[roomCode]/game/SelectedTeamDisplay.tsx
- [CREATE] src/app/room/[roomCode]/game/SubmitTeamButton.tsx
- [CREATE] src/app/room/[roomCode]/game/MissionTeamSelector.test.tsx
- [CREATE] src/app/room/[roomCode]/game/PlayerSelectionGrid.test.tsx
- [CREATE] src/app/room/[roomCode]/game/MissionRequirements.test.tsx
- [CREATE] src/app/room/[roomCode]/game/SelectedTeamDisplay.test.tsx
- [CREATE] src/app/room/[roomCode]/game/SubmitTeamButton.test.tsx
- [CREATE] src/app/room/[roomCode]/game/MissionTeamSelector.visual.spec.ts
- [CREATE] src/app/room/[roomCode]/game/PlayerSelectionGrid.visual.spec.ts
- [CREATE] src/app/room/[roomCode]/game/MissionRequirements.visual.spec.ts
- [CREATE] src/app/room/[roomCode]/game/SelectedTeamDisplay.visual.spec.ts
- [CREATE] src/app/room/[roomCode]/game/SubmitTeamButton.visual.spec.ts
- [CREATE] src/lib/mission-rules.ts
- [CREATE] src/lib/mission-rules.test.ts
- [CREATE] src/types/mission.ts
- [MODIFY] src/types/game-state.ts
- [MODIFY] src/server/api/routers/room.ts
- [MODIFY] docs/erd.md
```

### 4. Component Breakdown

**MissionTeamSelector** (`src/app/room/[roomCode]/game/MissionTeamSelector.tsx`)
- **Type**: Client Component (requires user interaction and state management)
- **Responsibility**: Main container for mission team selection process
- **Key Props**:
  ```typescript
  interface MissionTeamSelectorProps {
    roomId: string;
    playerId: string;
    isLeader: boolean;
    mission: Mission;
    players: Player[];
    onTeamSubmit: (teamIds: string[]) => void;
    className?: string;
  }
  ```
- **Child Components**: PlayerSelectionGrid, MissionRequirements, SelectedTeamDisplay, SubmitTeamButton

**PlayerSelectionGrid** (`src/app/room/[roomCode]/game/PlayerSelectionGrid.tsx`)
- **Type**: Client Component (requires interactive selection)
- **Responsibility**: Display players as selectable grid with selection state
- **Key Props**:
  ```typescript
  interface PlayerSelectionGridProps {
    players: Player[];
    selectedPlayerIds: string[];
    onPlayerToggle: (playerId: string) => void;
    maxSelections: number;
    disabled?: boolean;
    className?: string;
  }
  ```
- **Child Components**: None

**MissionRequirements** (`src/app/room/[roomCode]/game/MissionRequirements.tsx`)
- **Type**: Client Component (displays mission info)
- **Responsibility**: Display mission requirements and current progress
- **Key Props**:
  ```typescript
  interface MissionRequirementsProps {
    mission: Mission;
    selectedCount: number;
    requiredCount: number;
    className?: string;
  }
  ```
- **Child Components**: None

**SelectedTeamDisplay** (`src/app/room/[roomCode]/game/SelectedTeamDisplay.tsx`)
- **Type**: Client Component (shows current selection)
- **Responsibility**: Display currently selected team members
- **Key Props**:
  ```typescript
  interface SelectedTeamDisplayProps {
    selectedPlayers: Player[];
    onPlayerRemove: (playerId: string) => void;
    className?: string;
  }
  ```
- **Child Components**: None

**SubmitTeamButton** (`src/app/room/[roomCode]/game/SubmitTeamButton.tsx`)
- **Type**: Client Component (handles submission)
- **Responsibility**: Submit team selection with validation
- **Key Props**:
  ```typescript
  interface SubmitTeamButtonProps {
    onSubmit: () => void;
    disabled: boolean;
    isSubmitting: boolean;
    className?: string;
  }
  ```
- **Child Components**: None

### 5. Design Specifications

**Modern UI/UX Principles:**
- **Strategic Interface**: War-room aesthetic with tactical elements
- **Decision-Making Support**: Clear visual hierarchy for complex choices
- **Collaborative Design**: Transparent team selection process
- **Tension Building**: Visual elements that create strategic tension
- **Feedback-Rich**: Immediate response to selection changes

**Color System (Enhanced):**
| Design Color | Semantic Purpose | Element | Implementation Method |
|--------------|-----------------|---------|------------------------|
| #0a0a0f | Deep strategic | Main background | bg-[#0a0a0f] with grid overlay |
| #1a1a2e | Primary brand | Section headers | bg-[#1a1a2e] with gradient |
| #252547 | Elevated surface | Player cards | bg-[#252547] with glass effect |
| #2d2d5f | Interactive | Card hover states | bg-[#2d2d5f] with glow |
| #3d3d7a | Selection primary | Selected borders | border-[#3d3d7a] with pulse |
| #4a4a96 | Selection hover | Active selections | bg-[#4a4a96] with scale |
| #ffffff | High contrast | Player names | text-white with shadow |
| #f8fafc | Subtle | Requirements text | text-slate-100 with opacity |
| #22c55e | Success | Valid selection | text-green-500 with glow |
| #ef4444 | Error | Invalid selection | text-red-500 with shake |
| #f59e0b | Warning | Selection warnings | text-amber-500 with pulse |
| #3b82f6 | Info | Mission info | text-blue-500 with shimmer |
| #8b5cf6 | Strategic | Leader indicators | text-purple-500 with crown |
| #ec4899 | Highlight | Current focus | text-pink-500 with spotlight |

**Animation & Interaction Design:**
- **Selection Animations**:
  - Player card selection: `transform: scale(1.1)` with glow ring
  - Multi-select: Staggered selection with number badges
  - Deselection: Smooth scale-down with fade-out glow
  - Hover preview: Subtle lift with shadow expansion
- **Mission Progression**:
  - Requirements panel: Slide-in from left with checkmark animations
  - Team composition: Dynamic reflow with smooth transitions
  - Submit button: Pulse effect when selection is complete
  - Validation feedback: Immediate visual response to changes
- **Strategic Elements**:
  - Grid overlay: Subtle tactical grid in background
  - Connection lines: Animated lines showing relationships
  - Spotlight effects: Focused lighting on current selections
  - Tactical indicators: Military-style badges and markers

**Enhanced Visual Hierarchy:**
```
MissionTeamSelector (bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547])
├── Strategic Grid Overlay (subtle tactical background)
├── Header ("Select Your Team" - text-3xl with tactical font)
├── MissionRequirements (glass-panel with slide-in)
│   ├── Mission Number (large badge with glow)
│   ├── Required Players (progress indicator)
│   ├── Special Rules (info badges)
│   └── Current Progress (animated progress bar)
├── PlayerSelectionGrid (elevated-cards with hover-lift)
│   └── Player Cards (interactive with selection states)
│       ├── Player Avatar (circular with online indicator)
│       ├── Player Name (text-lg font-medium)
│       ├── Selection Badge (animated number indicator)
│       └── Hover Glow (team-colored aura on hover)
├── SelectedTeamDisplay (prominent showcase)
│   ├── Selected Players (avatar stack with names)
│   ├── Team Composition (visual breakdown)
│   └── Remove Controls (hover-reveal close buttons)
└── SubmitTeamButton (tactical CTA with pulse)
    ├── Button Text (text-xl font-bold)
    ├── Loading State (tactical spinner)
    └── Success Animation (checkmark with explosion)
```

**Typography (Enhanced):**
- **Section Titles**: `text-3xl font-bold font-tactical tracking-wide`
- **Player Names**: `text-lg font-medium tracking-wide`
- **Mission Details**: `text-base leading-relaxed opacity-90`
- **Button Text**: `text-xl font-bold tracking-wide uppercase`
- **Requirements**: `text-sm font-medium tabular-nums`
- **Status Text**: `text-sm opacity-75 leading-normal`

**Interactive Elements (Enhanced):**
- **Player Cards**:
  - Default: `bg-[#252547]/80 backdrop-blur-xl border border-slate-600/30`
  - Hover: `transform: translateY(-4px) scale(1.05) shadow-2xl`
  - Selected: `ring-4 ring-purple-500/50 bg-[#3d3d7a]/30 glow-purple`
  - Leader: `border-2 border-purple-500 crown-indicator`
- **Selection Grid**:
  - Responsive: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
  - Gap: `gap-4 md:gap-6` with smooth transitions
  - Masonry: CSS Grid with optimal card arrangement
- **Submit Button**:
  - Enabled: `bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 to-pink-700`
  - Disabled: `bg-gray-500 opacity-50 cursor-not-allowed`
  - Loading: `animate-pulse bg-gradient-to-r animate-spin`
  - Success: `bg-green-500 checkmark-animation`

**Visual Hierarchy:**
```
MissionTeamSelector
├── Header ("Select Mission Team" - h2)
├── MissionRequirements (info panel)
├── PlayerSelectionGrid (interactive grid)
├── SelectedTeamDisplay (current selection)
└── SubmitTeamButton (primary action)
```

### 6. Data Flow & State Management

**TypeScript Types** (`src/types/mission.ts`):
```typescript
export interface Mission {
  id: string;
  round: number;
  requiredPlayers: number;
  requiresTwoFails: boolean;
  selectedPlayers: string[];
  votes: MissionVote[];
  result?: 'success' | 'failure';
  leaderId: string;
}

export interface MissionVote {
  playerId: string;
  vote: 'success' | 'failure';
  submittedAt: Date;
}
```

**State Management:**
- Local state for selected player IDs
- Local state for submission status
- Real-time updates via Socket.IO
- Validation state for team composition

### 7. API Endpoints & Contracts

**tRPC Router** (`src/server/api/routers/room.ts`):
```typescript
submitMissionTeam: publicProcedure
  .input(z.object({
    roomId: z.string(),
    playerId: z.string(),
    selectedPlayerIds: z.array(z.string())
  }))
  .mutation(async ({ ctx, input }) => {
    // Validate and submit team selection
  })
```

### 8. Styling

**Color Implementation:**
- Interactive blue (#0066cc) for selected players
- Hover states (#4a90e2) for player cards
- Success green (#28a745) for valid selections
- Error red (#dc3545) for invalid selections
- Player card backgrounds (#16213e)

### 9. Implementation Steps

**Phase 1: UI Implementation with Mock Data**

**1. Setup & Types:**
- [ ] Define Mission types in `src/types/mission.ts`
- [ ] Create mission rules utilities in `src/lib/mission-rules.ts`
- [ ] Set up mock mission and player data

**2. UI Components:**
- [ ] Create all component files
- [ ] Configure with mock data
- [ ] Implement selection logic

**3. Styling:**
- [ ] Verify all colors match design system EXACTLY
- [ ] Implement responsive grid layout
- [ ] Add hover and selection states

**4. Testing:**
- [ ] Create comprehensive visual tests
- [ ] Test selection validation
- [ ] Test responsive behavior

**Phase 2: API Integration**

**5. Backend:**
- [ ] Implement team submission logic
- [ ] Add validation rules
- [ ] Implement Socket.IO events

**6. Integration:**
- [ ] Replace mock data with real API calls
- [ ] Add real-time synchronization
- [ ] Test end-to-end flow

### References

- [Official Avalon Mission Rules](https://boardgamegeek.com/boardgame/128882/the-resistance-avalon)
- [Grid Layout Best Practices](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
