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

**Color Analysis:**
| Design Color | Semantic Purpose | Element | Implementation Method |
|--------------|-----------------|---------|------------------------|
| #1a1a2e | Primary brand | Header background | Direct hex value (#1a1a2e) |
| #16213e | Secondary brand | Card background | Direct hex value (#16213e) |
| #0066cc | Interactive | Button background | Direct hex value (#0066cc) |
| #4a90e2 | Interactive hover | Button hover state | Direct hex value (#4a90e2) |
| #ffffff | High contrast text | Button text, labels | Direct hex value (#ffffff) |
| #f8f9fa | Subtle background | Input background | Direct hex value (#f8f9fa) |
| #28a745 | Success | Success messages | Direct hex value (#28a745) |
| #dc3545 | Error | Error messages | Direct hex value (#dc3545) |

**Spacing Values:**
- Card padding: 24px (p-6)
- Button padding: 12px 24px (px-6 py-3)
- Input padding: 12px 16px (px-4 py-3)
- Gap between elements: 16px (gap-4)
- Margin between sections: 32px (mb-8)

**Visual Hierarchy:**
```
CreateRoomPage
├── Header (h1, text-3xl font-bold)
├── CreateRoomForm (max-w-md mx-auto)
│   ├── Description (p, text-lg)
│   └── Create Button (btn-primary)
└── RoomCodeDisplay (conditional, card layout)
    ├── Room Code (text-2xl font-mono)
    ├── Join URL (text-sm, copyable)
    └── QR Code (256x256px)
```

**Typography:**
- Page title: 30px, font-bold, line-height: 1.2
- Description: 18px, font-normal, line-height: 1.5
- Room code: 24px, font-mono, font-semibold
- URL text: 14px, font-normal, line-height: 1.4

**Responsive Behavior:**
- Mobile (375px): Single column, QR code 200px
- Tablet (768px): Single column, QR code 256px
- Desktop (1280px): Centered layout, QR code 256px

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
