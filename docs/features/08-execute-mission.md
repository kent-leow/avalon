# User Story: 8 - Execute Mission

**As a** selected mission team member,
**I want** to vote for the mission to succeed or fail,
**so that** I can contribute to my team's victory condition.

## Acceptance Criteria

* Only selected team members can vote on mission outcome
* Good players can only vote for success
* Evil players can choose to vote for success or failure
* Mission outcome is determined by presence of any fail votes
* One fail vote causes mission to fail (except for certain missions requiring 2 fails)
* Vote is anonymous until results are revealed
* All team members must vote before results are shown
* Mission result is broadcast to all players
* Game state updates with mission outcome

## Notes

* Mission voting rules vary by game size and mission number
* Uses Socket.IO `mission:vote` and `mission:result` events
* Backend enforces role-based voting constraints
* Mission results affect overall game progression
