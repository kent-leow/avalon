## Session Flow Debug Guide

### Expected Session Creation Flow

1. **User creates room:**
   - API: `createRoom` → Creates database room + player
   - API: `createJWTSession(player.id, roomCode, hostName, true)`
   - Client: `saveSession()` → Saves to localStorage
   - Client: Redirects to `/room/{roomCode}/lobby`

2. **User joins room:**
   - API: `joinRoom` → Creates/updates database player
   - API: `createJWTSession(player.id, roomCode, playerName, false)`
   - Client: `saveSession()` → Saves to localStorage
   - Client: Redirects to `/room/{roomCode}/lobby`

3. **User visits lobby:**
   - Middleware: `verifySession()` → Checks JWT cookie
   - Client: `getSession()` → Loads from localStorage
   - Client: Renders lobby if session valid

### Debug Steps

1. **Check Console Logs:**
   - Open browser developer tools (F12)
   - Go to Console tab
   - Look for session-related logs

2. **Check Network Tab:**
   - Look for TRPC calls to `createRoom` and `joinRoom`
   - Check if requests succeed

3. **Check Cookies:**
   - Go to Application tab → Cookies
   - Look for `session` cookie
   - Verify it's set with proper domain/path

4. **Check localStorage:**
   - Go to Application tab → Local Storage
   - Look for session data

### Common Issues

1. **JWT Session Not Created:**
   - Check server logs for JWT creation errors
   - Verify JWT_SECRET is set in environment

2. **Middleware Redirect:**
   - Check if JWT session exists
   - Verify room code matches

3. **Timing Issues:**
   - Session might not be created before redirect
   - Check if delay is sufficient

### Test Commands

```bash
# Test database connection
node test-session.js

# Start development server
yarn dev

# Check database in GUI
yarn db:studio
```

### Expected Console Logs

**On Room Creation:**
```
Creating JWT session for host: {userId} {roomCode} {hostName}
JWT session created successfully for host
Room created successfully, redirecting to lobby with session: {session}
```

**On Room Join:**
```
Creating JWT session for player: {userId} {roomCode} {playerName}
JWT session created successfully for player
Join successful, redirecting to lobby
```

**On Lobby Load:**
```
Middleware protecting room route: /room/{roomCode}/lobby
Session verification result: {sessionData}
```
