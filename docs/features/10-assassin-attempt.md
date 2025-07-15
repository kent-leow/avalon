# User Story: 10 - Assassin Attempt

**As an** assassin (evil player),
**I want** to attempt to identify and kill Merlin when good wins 3 missions,
**so that** evil can still win the game.

## Acceptance Criteria

* Assassin phase triggers only if good team wins 3 missions
* Only the assassin can make the kill attempt
* Assassin can see all players and select their target
* Assassin has one attempt to identify Merlin
* If Merlin is correctly identified, evil wins
* If wrong player is selected, good wins
* All players can see the assassin's choice
* Game ends immediately after assassin's decision
* Final game result is displayed to all players

## Notes

* This is the final phase of the game
* Assassin role must be included in game configuration
* Uses Socket.IO for real-time assassination attempt
* Game result is final and cannot be changed
