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

**Color Analysis:**
| Design Color | Semantic Purpose | Element | Implementation Method |
|--------------|-----------------|---------|------------------------|
| #1a1a2e | Primary brand | Section header | Direct hex value (#1a1a2e) |
| #16213e | Secondary brand | Player card background | Direct hex value (#16213e) |
| #0066cc | Interactive | Selected player border | Direct hex value (#0066cc) |
| #4a90e2 | Interactive hover | Player card hover | Direct hex value (#4a90e2) |
| #ffffff | High contrast text | Player names, labels | Direct hex value (#ffffff) |
| #f8f9fa | Subtle background | Requirements panel | Direct hex value (#f8f9fa) |
| #6c757d | Muted text | Mission description | Direct hex value (#6c757d) |
| #28a745 | Success | Valid selection | Direct hex value (#28a745) |
| #dc3545 | Error | Invalid selection | Direct hex value (#dc3545) |
| #ffc107 | Warning | Selection warnings | Direct hex value (#ffc107) |
| #17a2b8 | Info | Mission info | Direct hex value (#17a2b8) |

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
