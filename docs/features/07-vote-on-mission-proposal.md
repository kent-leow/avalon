# User Story: 7 - Vote on Mission Proposal

**As a** player,
**I want** to vote to approve or reject the proposed mission team,
**so that** I can influence whether the mission proceeds.

## Acceptance Criteria

* All players can vote to approve or reject the proposed team
* Players can see the proposed team members before voting
* Vote options are clearly labeled (Approve/Reject)
* Players can change their vote before submission deadline
* Voting is anonymous until results are revealed
* All players must vote before results are shown
* Vote results show approval/rejection counts
* If approved, mission proceeds; if rejected, leadership rotates
* After 5 rejections in a round, evil team wins automatically

## Notes

* Uses Socket.IO `vote:submit` and `vote:result` events
* Backend collects and validates all votes
* Voting deadline enforced to prevent stalling
* Vote history tracked for game analysis
