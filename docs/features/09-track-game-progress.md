# User Story: 9 - Track Game Progress

**As a** player,
**I want** to see the current game state and progress,
**so that** I can understand where we are in the game and make informed decisions.

## Acceptance Criteria

* Players can see current round number
* Mission results (success/fail) are displayed for completed missions
* Current leader is clearly indicated
* Score tracker shows good vs evil mission wins
* Game phase is clearly communicated (voting, mission, etc.)
* Player roles are hidden from other players
* Vote history is accessible for reference
* Mission team compositions are visible for completed missions
* Game timer (if applicable) is displayed

## Notes

* Real-time updates via Socket.IO `game:state:sync` event
* UI adapts based on current game phase
* Information visibility respects game rules
* State persisted in database for reliability
