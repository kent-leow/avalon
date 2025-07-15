**Avalon Online Game Platform Architecture & Requirements (T3 Stack)**

---

### 🌌 Project Overview

A mobile-responsive web platform to host and play the game **Avalon** in real-time with multiplayer support, using the **T3 Stack**.

---

### 🏢 Tech Stack

| Layer          | Technology Example                  | Purpose                                        |
| -------------- | ----------------------------------- | ---------------------------------------------- |
| Frontend       | Next.js (React) + Tailwind CSS      | Responsive UI & gameplay interaction           |
| Backend API    | tRPC + Next.js API Routes           | Game logic, session control                    |
| Real-Time Sync | Socket.IO via `/api/socket.ts`      | Live updates (vote, state, turn, mission, etc) |
| Database       | Prisma + PostgreSQL (Neon) | Player data, game rooms, results               |
| Auth/Session   | UUID + Cookies / JWT                | Player identification without formal login     |
| Hosting        | Vercel                              | Web + API deployment                           |
| Optional Cache | Redis (Upstash)                     | Pub-Sub, room expiration, fast state access    |

---

### 🔢 Development Requirements

#### 1. Host Room Creation

- Host creates a game room.
- Room has unique `roomId`, generated on the backend.
- Host receives:
  - Room code (e.g., `ABCD1234`)
  - Join URL (`https://avalon.game/room/ABCD1234`)
  - QR code (generated via `qrcode` npm lib)

#### 2. Player Join

- Players open link or scan QR.
- They provide name and are added to the room.
- Assigned UUID and tracked in `room.players[]`.
- Realtime broadcast via `player:join` event.

#### 3. Game Setup Options

- Host selects which characters to include (Merlin, Morgana, etc.).
- Settings validated before game start (e.g., Merlin required if Percival included).
- API: `trpc.room.updateSettings()`

#### 4. Start Game Conditions

- Host can only start game when minimum number of players (5) are ready.
- Roles randomly assigned based on character selection.
- Roles stored in `room.players[].role`
- Phase changes to `roleReveal`

#### 5. Character Info Session

- Backend handles role-reveal logic:
  - Evil see each other (except Oberon)
  - Merlin sees evil (except Mordred)
  - Percival sees Merlin + Morgana (ambiguous)
- Role info sent privately via socket event `player:roleReveal`

#### 6. Game Flow State Machine (FSM)

- Centralized FSM enforces transitions:
  - lobby → roleReveal → voting → mission → result → nextRound
- Prevent illegal actions via state validation
- Example states:

```ts
'lobby' | 'roleReveal' | 'voting' | 'missionSelect' | 'missionVote' | 'reveal' | 'gameOver'
```

#### 7. Leader Rotation

- Leader is chosen in round-robin fashion.
- `room.leaderIndex` tracked on backend.
- Highlighted on all players’ UIs via socket `leader:update`

#### 8. Mission Proposal + Voting

- Leader selects mission team.
- All players vote via UI: approve / reject.
- Votes submitted with `vote:submit`, collected on server.
- Once all votes are in, server emits `vote:result`.
- Rejected proposals rotate leader; 5 rejections = evil wins.

#### 9. Mission Execution

- Selected team members vote success/fail.
- Evil may choose fail.
- Result collected and revealed to all via `mission:result`

#### 10. Game Progression

- Game state updated and broadcast after each round.
- Next leader, round number, mission tracker.
- Socket event: `game:state:sync`

#### 11. Game End Conditions

- 3 successful missions = good wins.
- 3 failed = evil wins.
- If good wins missions, assassin attempts to kill Merlin.
- Correct = evil wins. Incorrect = good wins.

---

### 🔗 Realtime Socket.IO Events

| Event               | Description                                |
| ------------------- | ------------------------------------------ |
| `player:join`       | Player joins room                          |
| `room:update`       | General room state update                  |
| `game:start`        | Host starts game                           |
| `player:roleReveal` | Private role info sent to player           |
| `leader:update`     | Current leader updated                     |
| `vote:submit`       | Vote sent to backend                       |
| `vote:result`       | Aggregated vote result                     |
| `mission:select`    | Leader selects mission team                |
| `mission:vote`      | Selected players vote mission success/fail |
| `mission:result`    | Mission result broadcast                   |
| `game:state:sync`   | Sync latest game state to all players      |
| `game:end`          | Announce game end and result               |

---

### 🎯 Bonus Features

- **FSM with **`` or manual enum logic
- **Host Panel**:
  - Start Game, Kick Player, Reset Room
  - Show QR and shareable link
- **Room Expiration**:
  - Auto cleanup of inactive rooms after 1 hour (Redis TTL or DB cron)
- **UI Indicators**:
  - Leader badge, voting results, mission results
- **Optional Spectator View**
- **Future Support**:
  - Rejoin logic using UUID
  - Game replay or summary view

---

### ✅ Deployment via Vercel

1. Push T3 repo to GitHub
2. Connect repo to Vercel
3. ENV vars:
   - `DATABASE_URL` (e.g., Supabase)
   - `REDIS_URL` (if used)
4. Enable serverless WebSocket via `/pages/api/socket.ts`
5. Add `vercel.json` for custom socket route

```json
{
  "rewrites": [
    { "source": "/socket.io/:match*", "destination": "/api/socket" }
  ]
}
```

---

### 🚀 Summary

This architecture covers a full-featured Avalon implementation using T3 Stack, supporting:

- Room creation and join
- Character-based role reveal
- Real-time sync for every game phase
- FSM-controlled game logic
- Full deployment on Vercel with Socket.IO support

Let me know if you want a code scaffold or example implementations!

