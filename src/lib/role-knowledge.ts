import { type Role } from "~/types/roles";
import { type KnownPlayer, type RoleKnowledge } from "~/types/role-knowledge";

/**
 * Compute what a player knows about other players based on their role
 * Following official Avalon rules
 */
export function computeRoleKnowledge(
  playerId: string,
  playerRole: Role,
  allPlayers: { id: string; name: string; role: Role }[]
): RoleKnowledge {
  const knownPlayers: KnownPlayer[] = [];
  const restrictions: string[] = [];
  const hints: string[] = [];

  // Filter out the current player
  const otherPlayers = allPlayers.filter(p => p.id !== playerId);

  for (const player of otherPlayers) {
    const knownPlayer: KnownPlayer = {
      id: player.id,
      name: player.name,
      knowledgeType: 'unknown',
      confidence: 'unknown'
    };

    // Apply role-specific knowledge rules
    switch (playerRole.id) {
      case 'merlin':
        // Merlin sees all evil players except Mordred
        if (player.role.team === 'evil' && player.role.id !== 'mordred') {
          knownPlayer.knowledgeType = 'team';
          knownPlayer.revealedTeam = 'evil';
          knownPlayer.confidence = 'certain';
        }
        break;

      case 'percival':
        // Percival sees Merlin and Morgana but can't distinguish
        if (player.role.id === 'merlin' || player.role.id === 'morgana') {
          knownPlayer.knowledgeType = 'ambiguous';
          knownPlayer.isAmbiguous = true;
          knownPlayer.confidence = 'suspected';
        }
        break;

      case 'morgana':
      case 'assassin':
      case 'mordred':
        // Evil players see other evil players (except Oberon)
        if (player.role.team === 'evil' && player.role.id !== 'oberon') {
          knownPlayer.knowledgeType = 'team';
          knownPlayer.revealedTeam = 'evil';
          knownPlayer.confidence = 'certain';
        }
        break;

      case 'oberon':
        // Oberon sees no one and is not seen by other evil players
        break;

      default:
        // Regular good players see no one
        break;
    }

    // Only add players with meaningful knowledge
    if (knownPlayer.knowledgeType !== 'unknown') {
      knownPlayers.push(knownPlayer);
    }
  }

  // Add role-specific restrictions and hints
  switch (playerRole.id) {
    case 'merlin':
      restrictions.push("Do not reveal your identity to evil players");
      restrictions.push("Be careful not to make your knowledge too obvious");
      hints.push("You can see all evil players except Mordred");
      hints.push("Guide the good team subtly without exposing yourself");
      break;

    case 'percival':
      restrictions.push("You cannot distinguish between Merlin and Morgana");
      hints.push("One of the highlighted players is Merlin, the other may be Morgana");
      hints.push("Watch their behavior to determine who is who");
      break;

    case 'assassin':
      restrictions.push("You must identify and kill Merlin if good wins");
      hints.push("Look for players with too much knowledge about evil players");
      hints.push("Merlin will try to guide good without being obvious");
      break;

    case 'morgana':
      restrictions.push("Appear like Merlin to confuse Percival");
      hints.push("Act knowledgeable but lead the good team astray");
      break;

    case 'mordred':
      restrictions.push("You are hidden from Merlin");
      hints.push("Use your invisibility to Merlin strategically");
      break;

    case 'oberon':
      restrictions.push("You do not know your evil teammates");
      restrictions.push("Your teammates do not know you are evil");
      hints.push("Work alone to sabotage missions");
      break;

    default:
      hints.push("Trust in your fellow servants of Arthur");
      hints.push("Look for suspicious behavior to identify evil players");
      break;
  }

  return {
    playerId,
    playerRole,
    knownPlayers,
    restrictions,
    hints
  };
}

/**
 * Get a formatted description of what the player knows
 */
export function getKnowledgeDescription(knownPlayers: KnownPlayer[]): string {
  if (knownPlayers.length === 0) {
    return "You have no special knowledge about other players.";
  }

  const certainKnowledge = knownPlayers.filter(p => p.confidence === 'certain');
  const suspectedKnowledge = knownPlayers.filter(p => p.confidence === 'suspected');

  let description = "";

  if (certainKnowledge.length > 0) {
    const names = certainKnowledge.map(p => p.name).join(", ");
    description += `You know that ${names} ${certainKnowledge.length === 1 ? 'is' : 'are'} on the evil team.`;
  }

  if (suspectedKnowledge.length > 0) {
    const names = suspectedKnowledge.map(p => p.name).join(", ");
    if (description) description += " ";
    description += `You see ${names} but cannot determine their true alignment.`;
  }

  return description;
}

/**
 * Mock data for testing and demonstration
 */
export const mockRoleKnowledge: RoleKnowledge = {
  playerId: "player1",
  playerRole: {
    id: 'merlin',
    name: 'Merlin',
    team: 'good',
    description: 'You know the servants of Mordred, but they must not discover you.',
    abilities: ['See evil players (except Mordred)'],
    seesEvil: true,
    seenByMerlin: false,
    isAssassin: false
  },
  knownPlayers: [
    {
      id: "player2",
      name: "Alice",
      knowledgeType: 'team',
      revealedTeam: 'evil',
      confidence: 'certain'
    },
    {
      id: "player3",
      name: "Bob",
      knowledgeType: 'team',
      revealedTeam: 'evil',
      confidence: 'certain'
    }
  ],
  restrictions: [
    "Do not reveal your identity to evil players",
    "Be careful not to make your knowledge too obvious"
  ],
  hints: [
    "You can see all evil players except Mordred",
    "Guide the good team subtly without exposing yourself"
  ]
};
