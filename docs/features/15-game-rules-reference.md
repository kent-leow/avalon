# User Story: 15 - Game Rules Reference

**As a** player,
**I want** to access comprehensive game rules and character information during gameplay,
**so that** I can make informed decisions and understand game mechanics.

## Acceptance Criteria

* Players can access a floating rules reference from any screen
* Character abilities and restrictions are clearly explained
* Mission requirements are detailed for all player counts
* Interactive examples demonstrate complex rules
* Rules adapt based on current game configuration
* Search functionality helps find specific rules quickly
* Rules are available offline for mobile players
* Visual diagrams illustrate game flow and relationships

## Official Avalon Rules Integration

### Mission Team Sizes by Player Count
| Players | Mission 1 | Mission 2 | Mission 3 | Mission 4 | Mission 5 |
|---------|-----------|-----------|-----------|-----------|-----------|
| 5       | 2         | 3         | 2         | 3         | 3         |
| 6       | 2         | 3         | 4         | 3         | 4         |
| 7       | 2         | 3         | 3         | 4         | 4         |
| 8       | 3         | 4         | 4         | 5         | 5         |
| 9       | 3         | 4         | 4         | 5         | 5         |
| 10      | 3         | 4         | 4         | 5         | 5         |

### Two-Fail Rule
* Mission 4 requires 2 fail votes to fail (for 7+ players)
* All other missions require only 1 fail vote to fail

### Character Dependencies
* Merlin must be included if Percival is selected
* Morgana must be included if Percival is selected
* Assassin must be included if Merlin is selected
* Mordred can only be included if Merlin is present

### Character Abilities
* **Merlin**: Sees all evil except Mordred
* **Percival**: Sees Merlin and Morgana (cannot distinguish)
* **Morgana**: Appears as Merlin to Percival
* **Mordred**: Hidden from Merlin's sight
* **Oberon**: Does not see other evil, other evil don't see Oberon
* **Assassin**: Can attempt to kill Merlin if good wins

## Implementation Notes

* Floating action button provides quick access to rules
* Context-sensitive help appears during relevant game phases
* Interactive diagrams show character relationships and abilities
* Search functionality with autocomplete for quick rule lookup
