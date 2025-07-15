# User Story: 11 - View Game Results

**As a** player,
**I want** to see the final game results and player roles,
**so that** I can understand how the game concluded and learn from the experience.

## Acceptance Criteria

* Final game result clearly shows which team won (good or evil)
* All player roles are revealed after game ends
* Game summary shows mission results and key decisions
* Players can see vote history and mission team compositions
* Winning condition is explained (missions won, assassin success/failure)
* Players can see statistics like successful deceptions
* Game results are saved for future reference
* Players can choose to play again or return to lobby

## Notes

* All hidden information is revealed at game end
* Results help players learn and improve their strategy
* Game data is stored for potential replay functionality
* Uses Socket.IO `game:end` event for final results
