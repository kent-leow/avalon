# Page snapshot

```yaml
- alert
- main:
  - heading "Avalon" [level=1]
  - paragraph: "The ultimate online experience for The Resistance: Avalon"
  - link "Create Room Start a new game and invite friends to join your Avalon adventure":
    - /url: /create-room
    - img
    - heading "Create Room" [level=2]
    - paragraph: Start a new game and invite friends to join your Avalon adventure
  - link "Join Room Enter a room code to join an existing game with your friends":
    - /url: /join?force=true
    - img
    - heading "Join Room" [level=2]
    - paragraph: Enter a room code to join an existing game with your friends
  - heading "Game Features" [level=3]
  - img
  - heading "Character Selection" [level=4]
  - paragraph: Choose from all official Avalon characters with proper validation
  - img
  - heading "Real-time Play" [level=4]
  - paragraph: Synchronized gameplay with live updates for all players
  - img
  - heading "Mobile Friendly" [level=4]
  - paragraph: Optimized for mobile devices with QR code joining
```