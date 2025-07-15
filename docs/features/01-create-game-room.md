# User Story: 1 - Create Game Room

**As a** game host,
**I want** to create a new Avalon game room,
**so that** I can invite friends to play together.

## Acceptance Criteria

* Host can create a new game room with a unique room ID
* Room generates a unique room code (e.g., `ABCD1234`)
* Host receives a shareable join URL (`https://avalon.game/room/ABCD1234`)
* Host receives a QR code for easy mobile sharing
* Room is created with initial state (lobby phase)
* Host is automatically assigned as the room leader
* Room data is persisted in the database

## Notes

* Room code should be easy to read and share verbally
* QR code generation uses `qrcode` npm library
* Room expires after 1 hour of inactivity

## Implementation Plan

### 1. Feature Overview

Create a game room creation feature that allows hosts to generate unique Avalon game rooms with shareable codes, URLs, and QR codes. The primary user role is the game host who initiates the multiplayer game session.

### 2. Component Analysis & Reuse Strategy

**Existing Components:**
- No existing components are suitable for reuse for this feature

**New Components Required:**
- `CreateRoomForm` - New component needed for room creation UI
- `RoomCodeDisplay` - New component needed to display room code, URL, and QR code
- `QRCodeGenerator` - New component needed for QR code generation

### 3. Affected Files

```
- [CREATE] src/app/create-room/page.tsx
- [CREATE] src/app/create-room/CreateRoomForm.tsx
- [CREATE] src/app/create-room/RoomCodeDisplay.tsx
- [CREATE] src/components/ui/QRCodeGenerator.tsx
- [CREATE] src/components/ui/QRCodeGenerator.test.tsx
- [CREATE] src/app/create-room/CreateRoomForm.test.tsx
- [CREATE] src/app/create-room/RoomCodeDisplay.test.tsx
- [CREATE] src/app/create-room/CreateRoomForm.visual.spec.ts
- [CREATE] src/app/create-room/RoomCodeDisplay.visual.spec.ts
- [CREATE] src/components/ui/QRCodeGenerator.visual.spec.ts
- [CREATE] src/app/api/rooms/route.ts
- [CREATE] src/types/room.ts
- [CREATE] src/server/api/routers/room.ts
- [CREATE] src/lib/room-code-generator.ts
- [CREATE] src/lib/room-code-generator.test.ts
- [MODIFY] src/server/api/root.ts
- [MODIFY] prisma/schema.prisma
- [CREATE] docs/erd.md
```

### 4. Component Breakdown

**CreateRoomForm** (`src/app/create-room/CreateRoomForm.tsx`)
- **Type**: Client Component (requires user interaction)
- **Responsibility**: Handle room creation form submission and display creation status
- **Key Props**:
  ```typescript
  interface CreateRoomFormProps {
    onRoomCreated: (room: Room) => void;
    className?: string;
  }
  ```
- **Child Components**: QRCodeGenerator, RoomCodeDisplay

**RoomCodeDisplay** (`src/app/create-room/RoomCodeDisplay.tsx`)
- **Type**: Client Component (requires copy to clipboard functionality)
- **Responsibility**: Display room code, URL, and provide sharing options
- **Key Props**:
  ```typescript
  interface RoomCodeDisplayProps {
    roomCode: string;
    joinUrl: string;
    className?: string;
  }
  ```
- **Child Components**: QRCodeGenerator

**QRCodeGenerator** (`src/components/ui/QRCodeGenerator.tsx`)
- **Type**: Client Component (requires canvas rendering)
- **Responsibility**: Generate and display QR code for room URL
- **Key Props**:
  ```typescript
  interface QRCodeGeneratorProps {
    value: string;
    size?: number;
    className?: string;
  }
  ```
- **Child Components**: None

### 5. Design Specifications

**Modern UI/UX Principles:**
- **Glassmorphism**: Semi-transparent cards with backdrop blur effects
- **Smooth Animations**: Micro-interactions with 300ms easing transitions
- **Depth & Shadow**: Layered depth using shadow-xl and shadow-2xl
- **Gradient Accents**: Subtle gradients for interactive elements
- **Progressive Disclosure**: Information revealed progressively to reduce cognitive load
- **Haptic Feedback**: Visual feedback mimicking tactile interactions

**Color System (Enhanced):**
| Design Color | Semantic Purpose | Element | Implementation Method |
|--------------|-----------------|---------|------------------------|
| #0f0f23 | Deep primary | Main background | bg-[#0f0f23] with grain texture |
| #1a1a2e | Primary brand | Header, navigation | bg-[#1a1a2e] with subtle gradient |
| #252547 | Elevated surface | Card backgrounds | bg-[#252547] with glass effect |
| #2d2d5f | Interactive surface | Button backgrounds | bg-[#2d2d5f] with hover transform |
| #3d3d7a | Accent primary | CTAs, highlights | bg-[#3d3d7a] with glow effect |
| #4a4a96 | Accent secondary | Hover states | bg-[#4a4a96] with scale transform |
| #ffffff | High contrast | Text, icons | text-white with proper contrast |
| #f8fafc | Subtle contrast | Secondary text | text-slate-100 |
| #22c55e | Success | Success states | text-green-500 with pulse animation |
| #ef4444 | Error | Error states | text-red-500 with shake animation |
| #f59e0b | Warning | Warning states | text-amber-500 with bounce |
| #3b82f6 | Info | Info states | text-blue-500 with fade-in |

**Animation & Interaction Design:**
- **Micro-animations**: 
  - Button hover: `transform: scale(1.05)` with `transition: all 300ms ease-out`
  - Card appearance: `opacity: 0 → 1` with `transform: translateY(20px) → translateY(0)`
  - QR code generation: Spinning loader with fade-in reveal
  - Copy button: Success checkmark animation with 2s auto-hide
- **Loading States**:
  - Skeleton loading for room creation process
  - Progress indicator for QR code generation
  - Shimmer effect for pending states
- **Feedback Animations**:
  - Success: Green checkmark with bounce keyframe
  - Error: Red shake animation with haptic-like feedback
  - Copy success: Ripple effect from button center

**Spacing & Layout (Enhanced):**
- **Responsive Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with proper gaps
- **Card Layout**: `p-8 rounded-2xl` with `shadow-xl backdrop-blur-lg`
- **Button Layout**: `px-8 py-4 rounded-xl` with `shadow-lg hover:shadow-xl`
- **Dynamic Spacing**: `space-y-6 md:space-y-8 lg:space-y-10` for vertical rhythm
- **Container Constraints**: `max-w-md mx-auto` with `min-h-screen` for proper centering

**Visual Hierarchy (Enhanced):**
```
CreateRoomPage (bg-gradient-to-br from-[#0f0f23] to-[#1a1a2e])
├── Header (text-4xl font-bold bg-gradient-to-r from-white to-slate-200)
├── CreateRoomForm (glass-card with backdrop-blur-xl)
│   ├── Description (text-lg opacity-90 leading-relaxed)
│   └── Create Button (gradient-button with hover:scale-105)
└── RoomCodeDisplay (slide-up animation, glass-card)
    ├── Room Code (text-3xl font-mono tracking-wider)
    ├── Join URL (copy-button with success-animation)
    └── QR Code (fade-in with scale-up from 0.8 to 1)
```

**Typography (Enhanced):**
- **Font Stack**: `font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- **Heading Scale**: `text-4xl (36px) → text-3xl (30px) → text-2xl (24px)` with proper line-height
- **Body Text**: `text-lg (18px)` with `leading-relaxed (1.625)`
- **Monospace**: `font-mono` for room codes with `tracking-wider` letter-spacing
- **Font Weights**: `font-bold` for headings, `font-semibold` for buttons, `font-medium` for labels

**Interactive Elements:**
- **Hover States**: `hover:scale-105 hover:shadow-xl transition-all duration-300`
- **Focus States**: `focus:ring-4 focus:ring-blue-500/30 focus:outline-none`
- **Active States**: `active:scale-95 active:shadow-inner`
- **Disabled States**: `disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`

**Responsive Behavior (Enhanced):**
- **Mobile First (320px+)**: Single column, touch-optimized buttons (48px min-height)
- **Small Mobile (375px+)**: QR code 200px, improved spacing
- **Large Mobile (425px+)**: Enhanced card padding, larger touch targets
- **Tablet (768px+)**: Two-column layout, QR code 256px, hover states enabled
- **Desktop (1024px+)**: Three-column layout, enhanced animations, larger QR code
- **Large Desktop (1440px+)**: Spacious layout, full animation suite, optimal UX

**Accessibility (Enhanced):**
- **ARIA Labels**: Comprehensive screen reader support with live regions
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Color Contrast**: WCAG AA compliance with 4.5:1 minimum contrast ratio
- **Motion Preferences**: `prefers-reduced-motion` support with alternate animations
- **Touch Targets**: Minimum 44px touch target size on mobile
- **High Contrast Mode**: Support for system high contrast preferences

### 6. Data Flow & State Management

**TypeScript Types** (`src/types/room.ts`):
```typescript
export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  gameState: GameState;
  settings: GameSettings;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  role?: string;
  joinedAt: Date;
}

export interface GameState {
  phase: 'lobby' | 'roleReveal' | 'voting' | 'mission' | 'gameOver';
  round: number;
  leaderIndex: number;
  votes: Vote[];
  missions: Mission[];
}

export interface GameSettings {
  characters: string[];
  playerCount: number;
  timeLimit?: number;
}
```

**Data Fetching Strategy:**
- **Server Component**: `src/app/create-room/page.tsx` - Static page, no data fetching required
- **Client Component**: `CreateRoomForm` - Calls tRPC mutation to create room
- **API Route**: `src/app/api/rooms/route.ts` - Handles room creation with validation

**State Management:**
- Local state in `CreateRoomForm` for form submission status
- Local state in `RoomCodeDisplay` for copy-to-clipboard status
- No global state management required for this feature

**Database Schema Changes:**
Required models and fields:
```prisma
model Room {
  id          String   @id @default(cuid())
  code        String   @unique
  hostId      String
  gameState   Json
  settings    Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  expiresAt   DateTime
  players     Player[]
  
  @@index([code])
  @@index([expiresAt])
}

model Player {
  id       String  @id @default(cuid())
  name     String
  isHost   Boolean @default(false)
  role     String?
  joinedAt DateTime @default(now())
  roomId   String
  room     Room    @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  @@index([roomId])
}
```

**MermaidJS ER Diagram:**
```mermaid
erDiagram
    Room {
        string id PK
        string code UK
        string hostId
        json gameState
        json settings
        datetime createdAt
        datetime updatedAt
        datetime expiresAt
    }
    
    Player {
        string id PK
        string name
        boolean isHost
        string role
        datetime joinedAt
        string roomId FK
    }
    
    Room ||--o{ Player : "has"
```

### 7. API Endpoints & Contracts

**POST /api/rooms** (`src/app/api/rooms/route.ts`):
- **HTTP Method**: POST
- **Request Body**:
  ```typescript
  {
    hostName: string;
    settings?: {
      characters?: string[];
      timeLimit?: number;
    };
  }
  ```
- **Response**:
  ```typescript
  {
    id: string;
    code: string;
    joinUrl: string;
    hostId: string;
    expiresAt: string;
  }
  ```
- **Core Logic**:
  - Generate unique room code
  - Create room in database
  - Create host player record
  - Set expiration time (1 hour)
  - Return room details

**tRPC Router** (`src/server/api/routers/room.ts`):
```typescript
createRoom: publicProcedure
  .input(z.object({
    hostName: z.string().min(1).max(50),
    settings: z.object({
      characters: z.array(z.string()).optional(),
      timeLimit: z.number().optional()
    }).optional()
  }))
  .mutation(async ({ ctx, input }) => {
    // Room creation logic
  })
```

### 8. Integration Diagram

```mermaid
sequenceDiagram
    participant User as Host
    participant UI as CreateRoomForm
    participant API as tRPC/API
    participant DB as Database
    participant QR as QRCodeGenerator
    
    User->>UI: Click "Create Room"
    UI->>API: createRoom({ hostName })
    API->>DB: Insert room & player records
    DB-->>API: Return room data
    API-->>UI: Return room details
    UI->>QR: Generate QR code for join URL
    QR-->>UI: Return QR code image
    UI-->>User: Display room code, URL, QR code
```

### 9. Styling

**Color Implementation:**
- Primary brand color (#1a1a2e) for headers and navigation
- Interactive blue (#0066cc) for primary buttons with hover state (#4a90e2)
- Success green (#28a745) for successful room creation
- Error red (#dc3545) for validation errors
- Neutral backgrounds (#f8f9fa) for inputs and cards

**Typography Implementation:**
- Font family: Geist Sans (--font-geist-sans)
- Heading sizes: text-3xl (30px) for main title, text-2xl (24px) for room code
- Body text: text-lg (18px) for descriptions, text-sm (14px) for URLs
- Font weights: font-bold for headings, font-semibold for important text

**Layout & Spacing:**
- Container max-width: max-w-md (448px) for form
- Padding: p-6 (24px) for cards, p-4 (16px) for inputs
- Margins: mb-8 (32px) between sections, mb-4 (16px) between elements
- Border radius: rounded-lg (8px) for cards and buttons

**Visual Implementation Checklist:**
- [ ] Header uses brand color (#1a1a2e) with white text
- [ ] Create button uses interactive blue (#0066cc) with hover effect
- [ ] Room code displayed in monospace font for clarity
- [ ] QR code is properly centered and sized (256px desktop, 200px mobile)
- [ ] Copy button provides visual feedback on click
- [ ] Success messages use green color (#28a745)
- [ ] Error states use red color (#dc3545)
- [ ] Responsive layout works on all screen sizes

### 10. Testing Strategy

**Unit Tests:**
- `src/lib/room-code-generator.test.ts` - Room code generation logic
- `src/app/create-room/CreateRoomForm.test.tsx` - Form submission and validation
- `src/app/create-room/RoomCodeDisplay.test.tsx` - Display and copy functionality
- `src/components/ui/QRCodeGenerator.test.tsx` - QR code generation

**Component Tests:**
- Form validation and submission behavior
- Copy to clipboard functionality
- QR code generation with different URLs
- Error handling for failed room creation

**Playwright Visual Tests:**
- `src/app/create-room/CreateRoomForm.visual.spec.ts` - Form appearance and interactions
- `src/app/create-room/RoomCodeDisplay.visual.spec.ts` - Room code display layout
- `src/components/ui/QRCodeGenerator.visual.spec.ts` - QR code rendering

**Test Coverage:**
- All viewport sizes (375px, 768px, 1280px, 1920px)
- Color validation with exact RGB values
- Typography and spacing verification
- Interactive states (hover, focus, disabled)

### 11. Accessibility (A11y) Considerations

- Form labels properly associated with inputs
- Button states clearly communicated to screen readers
- QR code has alternative text describing its purpose
- Copy functionality provides screen reader feedback
- High contrast ratios maintained for all text
- Keyboard navigation support for all interactive elements
- Error messages are announced to screen readers

### 12. Security Considerations

- Room codes are cryptographically secure and unpredictable
- Room expiration prevents indefinite database growth
- Input validation prevents malicious room names
- Rate limiting on room creation to prevent abuse
- Host identification secured through session management
- Room data sanitized before storage and retrieval

### 13. Implementation Steps

**Phase 1: UI Implementation with Mock Data**

**1. Setup & Types:**
- [ ] Define Room, Player, GameState types in `src/types/room.ts`
- [ ] Create mock room data structure in `src/mocks/room-mock.ts`
- [ ] Install qrcode library: `yarn add qrcode @types/qrcode`

**2. Utility Functions:**
- [ ] Create room code generator in `src/lib/room-code-generator.ts`
- [ ] Write tests for room code generator
- [ ] Implement code validation and uniqueness logic

**3. UI Components:**
- [ ] Create `src/components/ui/QRCodeGenerator.tsx`
- [ ] Create `src/app/create-room/CreateRoomForm.tsx`
- [ ] Create `src/app/create-room/RoomCodeDisplay.tsx`
- [ ] Create `src/app/create-room/page.tsx`
- [ ] Configure components to use mock data
- [ ] Implement copy-to-clipboard functionality

**4. Styling:**
- [ ] Verify header color (#1a1a2e) matches design system EXACTLY
- [ ] Verify button color (#0066cc) with hover state (#4a90e2) EXACTLY
- [ ] Verify card background (#16213e) and text contrast EXACTLY
- [ ] Verify typography sizes (text-3xl, text-2xl, text-lg) EXACTLY
- [ ] Verify spacing values (p-6, mb-8, gap-4) EXACTLY
- [ ] Apply direct hex values for all colors in className attributes
- [ ] Apply Tailwind classes for spacing and layout
- [ ] Implement responsive behavior for all breakpoints

**5. UI Testing:**
- [ ] Write component tests for all components with mock data
- [ ] Create Playwright visual test `src/app/create-room/CreateRoomForm.visual.spec.ts`
- [ ] Create Playwright visual test `src/app/create-room/RoomCodeDisplay.visual.spec.ts`
- [ ] Create Playwright visual test `src/components/ui/QRCodeGenerator.visual.spec.ts`
- [ ] Configure tests for all viewport sizes (375px, 768px, 1280px, 1920px)
- [ ] Add visual color verification tests with exact RGB values using CSS property assertions
- [ ] Add spacing/layout verification tests with pixel measurements using DOM properties
- [ ] Add typography verification tests for font sizes and weights using computed styles
- [ ] Add comprehensive data-testid attributes: `data-testid="create-room-form"`, `data-testid="room-code-display"`, `data-testid="qr-code-generator"`
- [ ] Manual testing and A11y checks for all UI elements

**Phase 2: API Integration with Real Data**

**6. Database Schema:**
- [ ] Add Room and Player models to `prisma/schema.prisma`
- [ ] Create and run database migration
- [ ] Update database ERD in `docs/erd.md`

**7. Backend Implementation:**
- [ ] Create `src/server/api/routers/room.ts`
- [ ] Implement createRoom tRPC procedure with validation
- [ ] Create `src/app/api/rooms/route.ts` REST endpoint
- [ ] Add room router to `src/server/api/root.ts`
- [ ] Implement room expiration logic
- [ ] Add proper error handling and validation

**8. Integration:**
- [ ] Replace mock data with real tRPC calls in CreateRoomForm
- [ ] Update state management to handle real data fetching
- [ ] Implement proper error handling for API failures
- [ ] Add loading states connected to real data fetching
- [ ] Test room creation end-to-end flow

**9. Integration Testing:**
- [ ] Write unit tests for room creation API validation logic
- [ ] Update component tests to test with real data fetching (mocked)
- [ ] End-to-end testing of room creation flow
- [ ] Test room expiration functionality

**10. Final Documentation & Polishing:**
- [ ] Add JSDoc documentation to all functions and components
- [ ] Final review of integration between UI and API
- [ ] Performance checks with real data and QR generation
- [ ] Security review of room code generation and validation

### References

- [T3 Stack Documentation](https://create.t3.gg/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [tRPC Documentation](https://trpc.io/docs)
- [QRCode.js Documentation](https://github.com/soldair/node-qrcode)
- [Next.js App Router](https://nextjs.org/docs/app)
