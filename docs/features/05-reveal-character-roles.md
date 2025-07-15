# User Story: 5 - Reveal Character Roles

**As a** player,
**I want** to privately see my character role and relevant information,
**so that** I understand my objectives and what I know about other players.

## Acceptance Criteria

* Each player receives their role information privately
* Evil players can see other evil players (except Oberon sees no one)
* Merlin can see all evil players (except Mordred)
* Percival can see both Merlin and Morgana (but cannot distinguish between them)
* Regular good players see only their own role
* Role information is sent securely and privately to each player
* Role reveal phase has a timer or manual progression
* Game advances to voting phase after role reveal is complete

## Notes

* Role information sent via private Socket.IO event `player:roleReveal`
* Information visibility follows official Avalon rules
* Backend handles all role-reveal logic for security
* UI clearly displays what each player knows and doesn't know

## Implementation Plan

### 1. Feature Overview

Create a role revelation interface that privately displays each player's character information and knowledge about other players according to Avalon rules. The primary user role is any player who needs to understand their character's abilities and what they know about others.

### 2. Component Analysis & Reuse Strategy

**Existing Components:**
- No existing components are suitable for reuse for this feature

**New Components Required:**
- `RoleRevealScreen` - New component needed for the main role display interface
- `PlayerRoleCard` - New component needed to display player's own role
- `KnownPlayersGrid` - New component needed to show what player knows about others
- `RoleRevealTimer` - New component needed for phase timing
- `ContinueButton` - New component needed for manual progression

### 3. Affected Files

```
- [CREATE] src/app/room/[roomCode]/game/RoleRevealScreen.tsx
- [CREATE] src/app/room/[roomCode]/game/PlayerRoleCard.tsx
- [CREATE] src/app/room/[roomCode]/game/KnownPlayersGrid.tsx
- [CREATE] src/app/room/[roomCode]/game/RoleRevealTimer.tsx
- [CREATE] src/app/room/[roomCode]/game/ContinueButton.tsx
- [CREATE] src/app/room/[roomCode]/game/RoleRevealScreen.test.tsx
- [CREATE] src/app/room/[roomCode]/game/PlayerRoleCard.test.tsx
- [CREATE] src/app/room/[roomCode]/game/KnownPlayersGrid.test.tsx
- [CREATE] src/app/room/[roomCode]/game/RoleRevealTimer.test.tsx
- [CREATE] src/app/room/[roomCode]/game/ContinueButton.test.tsx
- [CREATE] src/app/room/[roomCode]/game/RoleRevealScreen.visual.spec.ts
- [CREATE] src/app/room/[roomCode]/game/PlayerRoleCard.visual.spec.ts
- [CREATE] src/app/room/[roomCode]/game/KnownPlayersGrid.visual.spec.ts
- [CREATE] src/app/room/[roomCode]/game/RoleRevealTimer.visual.spec.ts
- [CREATE] src/app/room/[roomCode]/game/ContinueButton.visual.spec.ts
- [CREATE] src/lib/role-knowledge.ts
- [CREATE] src/lib/role-knowledge.test.ts
- [CREATE] src/types/role-knowledge.ts
- [MODIFY] src/types/roles.ts
- [MODIFY] src/server/api/routers/room.ts
- [MODIFY] docs/erd.md
```

### 4. Component Breakdown

**RoleRevealScreen** (`src/app/room/[roomCode]/game/RoleRevealScreen.tsx`)
- **Type**: Client Component (requires real-time updates and secure data handling)
- **Responsibility**: Main container for role revelation interface
- **Key Props**:
  ```typescript
  interface RoleRevealScreenProps {
    playerId: string;
    roomId: string;
    playerRole: Role;
    knownPlayers: KnownPlayer[];
    timeRemaining?: number;
    onContinue: () => void;
    className?: string;
  }
  ```
- **Child Components**: PlayerRoleCard, KnownPlayersGrid, RoleRevealTimer, ContinueButton

**PlayerRoleCard** (`src/app/room/[roomCode]/game/PlayerRoleCard.tsx`)
- **Type**: Client Component (displays sensitive role information)
- **Responsibility**: Display player's own role information and abilities
- **Key Props**:
  ```typescript
  interface PlayerRoleCardProps {
    role: Role;
    playerName: string;
    team: 'good' | 'evil';
    className?: string;
  }
  ```
- **Child Components**: None

**KnownPlayersGrid** (`src/app/room/[roomCode]/game/KnownPlayersGrid.tsx`)
- **Type**: Client Component (displays computed knowledge)
- **Responsibility**: Display what the player knows about other players
- **Key Props**:
  ```typescript
  interface KnownPlayersGridProps {
    knownPlayers: KnownPlayer[];
    playerRole: Role;
    className?: string;
  }
  ```
- **Child Components**: None

**RoleRevealTimer** (`src/app/room/[roomCode]/game/RoleRevealTimer.tsx`)
- **Type**: Client Component (requires real-time countdown)
- **Responsibility**: Display countdown timer for role reveal phase
- **Key Props**:
  ```typescript
  interface RoleRevealTimerProps {
    timeRemaining: number;
    onTimeUp: () => void;
    className?: string;
  }
  ```
- **Child Components**: None

### 5. Design Specifications

**Modern UI/UX Principles:**
- **Dramatic Reveal**: Cinematic animation for role disclosure
- **Privacy-First Design**: Secure, personalized experience for each player
- **Atmospheric Immersion**: Medieval/fantasy theming with particle effects
- **Emotional Storytelling**: Character-driven narrative presentation
- **Contextual Knowledge**: Clear visualization of player relationships

**Color System (Enhanced):**
| Design Color | Semantic Purpose | Element | Implementation Method |
|--------------|-----------------|---------|------------------------|
| #0a0a0f | Deep mystical | Main background | bg-[#0a0a0f] with starfield |
| #1a1a2e | Primary brand | Screen header | bg-[#1a1a2e] with gradient |
| #252547 | Elevated surface | Role card bg | bg-[#252547] with glass effect |
| #2d2d5f | Interactive | Knowledge cards | bg-[#2d2d5f] with hover glow |
| #3d3d7a | Accent primary | Role borders | border-[#3d3d7a] with pulse |
| #4a4a96 | Accent hover | Card hover states | bg-[#4a4a96] with scale |
| #ffffff | High contrast | Role names | text-white with text-shadow |
| #f8fafc | Subtle | Descriptions | text-slate-100 with opacity |
| #22c55e | Success/Good | Good team glow | text-green-500 with aura |
| #ef4444 | Error/Evil | Evil team glow | text-red-500 with flame |
| #f59e0b | Warning | Timer warnings | text-amber-500 with pulse |
| #3b82f6 | Info | Knowledge hints | text-blue-500 with shimmer |
| #8b5cf6 | Mystical | Magic effects | text-purple-500 with glow |
| #ec4899 | Arcane | Special abilities | text-pink-500 with sparkle |

**Animation & Interaction Design:**
- **Role Reveal Sequence**:
  - Fade in: Screen fades from black with particles
  - Card flip: 3D rotation revealing role with magical particles
  - Glow effect: Team-colored aura surrounding role card
  - Text typewriter: Role description appears with typing effect
- **Knowledge Visualization**:
  - Player cards: Fade in with staggered timing (100ms delays)
  - Connection lines: Animated lines showing relationships
  - Pulse indicators: Rhythmic pulsing for known players
  - Uncertainty effects: Flickering/shimmer for ambiguous knowledge
- **Magical Effects**:
  - Particle systems: Floating magical motes throughout screen
  - Glow animations: Soft pulsing glows around team indicators
  - Sparkle effects: Twinkling stars for special abilities
  - Mystic transitions: Ethereal fade/dissolve effects

**Enhanced Visual Hierarchy:**
```
RoleRevealScreen (bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#252547])
├── Particle System (floating magical motes)
├── Header ("Your Destiny" - text-4xl with mystical glow)
├── PlayerRoleCard (prominent, centered with 3D flip)
│   ├── Role Portrait (circular with team aura)
│   ├── Role Name (text-3xl font-bold with text-shadow)
│   ├── Team Badge (animated with glow effect)
│   └── Role Description (typewriter animation)
├── KnownPlayersGrid (conditional, slide-up)
│   ├── Section Title ("Your Knowledge")
│   └── Player Knowledge Cards (staggered fade-in)
│       ├── Player Avatar (with certainty indicator)
│       ├── Knowledge Type (icon with tooltip)
│       └── Confidence Level (progress bar)
├── RoleRevealTimer (floating countdown with particle trail)
└── ContinueButton (mystical button with hover glow)
```

**Typography (Enhanced):**
- **Screen Title**: `text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200`
- **Role Names**: `text-3xl font-bold tracking-wide text-shadow-lg`
- **Role Descriptions**: `text-lg leading-relaxed opacity-90`
- **Player Names**: `text-base font-medium tracking-wide`
- **Knowledge Labels**: `text-sm font-medium uppercase tracking-widest`
- **Timer Text**: `text-2xl font-mono font-bold tabular-nums`

**Interactive Elements (Enhanced):**
- **Role Card**:
  - Surface: `bg-[#252547]/90 backdrop-blur-xl border-2 border-purple-500/30`
  - Hover: `transform: scale(1.05) shadow-2xl glow-effect`
  - Team Aura: `box-shadow: 0 0 40px rgba(team-color, 0.4)`
- **Knowledge Cards**:
  - Certain: `border-green-500 bg-green-500/10 glow-green`
  - Suspected: `border-amber-500 bg-amber-500/10 glow-amber`
  - Unknown: `border-gray-500 bg-gray-500/10 opacity-60`
- **Continue Button**:
  - Default: `bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 to-pink-700`
  - Hover: `transform: translateY(-2px) scale(1.05) shadow-2xl`
  - Glow: `box-shadow: 0 0 20px rgba(139, 92, 246, 0.5)`

**Spacing Values:**
- Screen padding: 24px (p-6)
- Role card padding: 20px (p-5)
- Grid gap: 16px (gap-4)
- Timer spacing: 16px (mt-4)
- Button spacing: 32px (mt-8)

**Visual Hierarchy:**
```
RoleRevealScreen
├── Header ("Your Role" - h1, text-3xl)
├── PlayerRoleCard (prominent, centered)
│   ├── Role name (h2, text-2xl)
│   ├── Team indicator (badge)
│   └── Role description (p, text-lg)
├── KnownPlayersGrid (conditional)
│   ├── Section title ("You Know")
│   └── Player knowledge cards
├── RoleRevealTimer (countdown)
└── ContinueButton (primary action)
```

**Typography:**
- Screen title: 30px, font-bold, line-height: 1.2
- Role name: 24px, font-bold, line-height: 1.3
- Role description: 18px, font-normal, line-height: 1.5
- Player names: 16px, font-medium, line-height: 1.4
- Timer text: 18px, font-mono, font-semibold
- Button text: 16px, font-semibold, line-height: 1.4

### 6. Data Flow & State Management

**TypeScript Types** (`src/types/role-knowledge.ts`):
```typescript
export interface KnownPlayer {
  id: string;
  name: string;
  knowledgeType: 'role' | 'team' | 'ambiguous' | 'unknown';
  revealedRole?: string;
  revealedTeam?: 'good' | 'evil';
  isAmbiguous?: boolean;
  confidence: 'certain' | 'suspected' | 'unknown';
}

export interface RoleKnowledge {
  playerId: string;
  playerRole: Role;
  knownPlayers: KnownPlayer[];
  restrictions: string[];
  hints: string[];
}
```

**Data Fetching Strategy:**
- **Server Component**: None - all data comes from secure tRPC calls
- **Client Component**: `RoleRevealScreen` receives role data via secure Socket.IO
- **Real-time**: Role information delivered privately per player
- **Security**: Role knowledge computed server-side, never exposed to other players

**State Management:**
- Local state for timer countdown
- Local state for continue button status
- Real-time role data via Socket.IO private events
- No persistent state - data is session-only

### 7. API Endpoints & Contracts

**tRPC Router** (`src/server/api/routers/room.ts`):
```typescript
getRoleKnowledge: publicProcedure
  .input(z.object({
    roomId: z.string(),
    playerId: z.string()
  }))
  .query(async ({ ctx, input }) => {
    // Compute and return role knowledge for player
  })

confirmRoleRevealed: publicProcedure
  .input(z.object({
    roomId: z.string(),
    playerId: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    // Mark player as having seen their role
  })
```

### 8. Integration Diagram

```mermaid
sequenceDiagram
    participant Player as Player
    participant UI as RoleRevealScreen
    participant API as tRPC
    participant Knowledge as RoleKnowledge
    participant Socket as Socket.IO
    participant GameState as GameState
    
    Player->>UI: Load role reveal screen
    UI->>API: getRoleKnowledge({ roomId, playerId })
    API->>Knowledge: Compute player knowledge
    Knowledge-->>API: Return role and known players
    API-->>UI: Return role knowledge
    UI->>Socket: Listen for timer updates
    Socket-->>UI: Timer countdown updates
    Player->>UI: Click continue
    UI->>API: confirmRoleRevealed({ roomId, playerId })
    API->>GameState: Update player revealed status
    GameState-->>Socket: Check if all players revealed
    Socket-->>UI: Phase transition (if all ready)
```

### 9. Styling

**Color Implementation:**
- Primary brand color (#1a1a2e) for screen headers
- Role card background (#16213e) with high contrast text
- Good team indicators use success green (#28a745)
- Evil team indicators use error red (#dc3545)
- Interactive blue (#0066cc) for continue button
- Timer warnings use warning yellow (#ffc107)
- Info blue (#17a2b8) for knowledge indicators

**Layout & Spacing:**
- Screen container: max-w-4xl with mx-auto centering
- Role card: prominent centering with generous padding
- Grid layout: responsive columns for known players
- Timer: fixed positioning or prominent placement
- Button: centered with proper spacing

### 10. Testing Strategy

**Component Tests:**
- Role information display accuracy
- Knowledge computation for different roles
- Timer countdown functionality
- Continue button enabling/disabling
- Private data security

**Playwright Visual Tests:**
- Role card appearance and styling
- Known players grid layout
- Timer display and countdown
- Team indicator colors
- Button states and interactions

### 11. Accessibility (A11y) Considerations

- Screen reader support for role information
- High contrast for team indicators
- Timer announcements for countdown
- Keyboard navigation for continue button
- Clear labeling of all role information
- Proper heading hierarchy

### 12. Security Considerations

- Role information never exposed to other players
- Server-side computation of all knowledge
- Secure Socket.IO events for private data
- No client-side role logic
- Audit logging of role revelations
- Anti-tampering measures

### 13. Implementation Steps

**Phase 1: UI Implementation with Mock Data**

**1. Setup & Types:**
- [ ] Define RoleKnowledge types in `src/types/role-knowledge.ts`
- [ ] Create role knowledge utilities in `src/lib/role-knowledge.ts`
- [ ] Set up mock role and knowledge data
- [ ] Create knowledge computation algorithms

**2. UI Components:**
- [ ] Create `src/app/room/[roomCode]/game/PlayerRoleCard.tsx`
- [ ] Create `src/app/room/[roomCode]/game/KnownPlayersGrid.tsx`
- [ ] Create `src/app/room/[roomCode]/game/RoleRevealTimer.tsx`
- [ ] Create `src/app/room/[roomCode]/game/ContinueButton.tsx`
- [ ] Create `src/app/room/[roomCode]/game/RoleRevealScreen.tsx`
- [ ] Configure components with mock data

**3. Styling:**
- [ ] Verify role card background (#16213e) EXACTLY
- [ ] Verify good team color (#28a745) EXACTLY
- [ ] Verify evil team color (#dc3545) EXACTLY
- [ ] Verify continue button color (#0066cc) EXACTLY
- [ ] Verify timer warning color (#ffc107) EXACTLY
- [ ] Apply direct hex values for all colors
- [ ] Implement responsive layout

**4. Testing:**
- [ ] Create comprehensive visual tests
- [ ] Test all role knowledge scenarios
- [ ] Test timer functionality
- [ ] Add accessibility tests

**Phase 2: API Integration**

**5. Backend:**
- [ ] Implement secure role knowledge computation
- [ ] Add tRPC procedures for role data
- [ ] Implement Socket.IO private events
- [ ] Add security measures

**6. Integration:**
- [ ] Replace mock data with real API calls
- [ ] Implement real-time timer synchronization
- [ ] Add error handling
- [ ] Test end-to-end flow

### References

- [Official Avalon Rules](https://boardgamegeek.com/boardgame/128882/the-resistance-avalon)
- [Socket.IO Private Messages](https://socket.io/docs/v4/private-messages/)
- [Cryptographic Security](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)
