/**
 * Game Rules Reference Utility Functions
 * 
 * Comprehensive utility functions for game rules management, search functionality,
 * contextual help, and rule content generation.
 */

import type {
  RuleContent,
  RuleSection,
  RuleSearchResult,
  RuleSearchState,
  RuleSearchFilters,
  ContextualHelp,
  HelpContextType,
  CharacterType,
  MissionRequirement,
  CharacterAbility,
  GameRulesState,
  RuleProgress,
} from '~/types/game-rules';

import {
  MISSION_REQUIREMENTS,
  CHARACTER_ABILITIES,
  SEARCH_CONFIG,
  HELP_CONFIG
} from '~/types/game-rules';

/**
 * Create initial game rules state
 */
export function createInitialRulesState(): GameRulesState {
  return {
    isOpen: false,
    activeSection: 'overview',
    searchState: {
      query: '',
      results: [],
      isSearching: false,
      selectedIndex: -1,
      filters: {
        sections: [],
        types: [],
        difficulty: []
      },
      suggestions: []
    },
    contextualHelp: [],
    userProgress: {
      sectionsRead: [],
      examplesCompleted: [],
      charactersStudied: [],
      totalTimeSpent: 0,
      lastAccessed: new Date().toISOString()
    },
    offlineMode: false,
    preferences: {
      defaultSection: 'overview',
      showContextualHelp: true,
      helpFrequency: 'normal',
      autoExpandDiagrams: true,
      preferredDifficulty: 'beginner',
      colorBlindMode: false
    }
  };
}

/**
 * Get mission requirements for specific player count
 */
export function getMissionRequirements(playerCount: number): MissionRequirement | null {
  return MISSION_REQUIREMENTS.find(req => req.playerCount === playerCount) || null;
}

/**
 * Get character ability information
 */
export function getCharacterAbility(character: CharacterType): CharacterAbility | null {
  return CHARACTER_ABILITIES.find(ability => ability.character === character) || null;
}

/**
 * Get all character abilities
 */
export function getAllCharacterAbilities(): CharacterAbility[] {
  return CHARACTER_ABILITIES;
}

/**
 * Generate rule content for different sections
 */
export function generateRuleContent(): RuleContent[] {
  const rules: RuleContent[] = [];

  // Overview section
  rules.push({
    id: 'overview-basic',
    title: 'Game Overview',
    content: `Avalon is a social deduction game where players are either Good or Evil. 
    Good players must complete 3 out of 5 missions to win, while Evil players try to 
    fail 3 missions or have the Assassin successfully identify Merlin.`,
    section: 'overview',
    tags: ['basic', 'objective', 'winning'],
    difficulty: 'beginner',
    lastUpdated: new Date().toISOString()
  });

  rules.push({
    id: 'overview-setup',
    title: 'Game Setup',
    content: `Each player receives a character card. Good characters include Merlin, 
    Percival, and Loyal Servants. Evil characters include the Assassin, Morgana, 
    Mordred, Oberon, and Minions of Mordred.`,
    section: 'overview',
    tags: ['setup', 'characters', 'teams'],
    difficulty: 'beginner',
    lastUpdated: new Date().toISOString()
  });

  // Mission section
  rules.push({
    id: 'missions-proposal',
    title: 'Mission Proposals',
    content: `The leader proposes a team of the required size for the current mission. 
    All players vote to approve or reject the proposal. If approved, the mission proceeds. 
    If rejected, leadership passes to the next player.`,
    section: 'missions',
    tags: ['proposal', 'voting', 'leadership'],
    difficulty: 'beginner',
    lastUpdated: new Date().toISOString()
  });

  rules.push({
    id: 'missions-execution',
    title: 'Mission Execution',
    content: `Selected team members vote secretly on the mission outcome. 
    Good players must vote Success, while Evil players may vote Success or Fail. 
    The mission succeeds only if all votes are Success (except Mission 4 with 7+ players).`,
    section: 'missions',
    tags: ['execution', 'voting', 'success', 'fail'],
    difficulty: 'beginner',
    lastUpdated: new Date().toISOString()
  });

  // Character section
  CHARACTER_ABILITIES.forEach(ability => {
    rules.push({
      id: `character-${ability.character}`,
      title: ability.name,
      content: `${ability.description}. ${ability.specialAbilities.join('. ')}.`,
      section: 'characters',
      tags: ['character', ability.character, 'abilities'],
      difficulty: 'intermediate',
      lastUpdated: new Date().toISOString()
    });
  });

  // Voting section
  rules.push({
    id: 'voting-proposal',
    title: 'Proposal Voting',
    content: `All players vote simultaneously on mission proposals. 
    A simple majority is required to approve. If 5 proposals are rejected 
    in a row, Evil wins automatically.`,
    section: 'voting',
    tags: ['proposal', 'majority', 'rejection'],
    difficulty: 'beginner',
    lastUpdated: new Date().toISOString()
  });

  rules.push({
    id: 'voting-mission',
    title: 'Mission Voting',
    content: `Only selected team members vote on mission outcomes. 
    Votes are secret and simultaneous. Good players must vote Success, 
    while Evil players choose Success or Fail.`,
    section: 'voting',
    tags: ['mission', 'secret', 'success', 'fail'],
    difficulty: 'beginner',
    lastUpdated: new Date().toISOString()
  });

  // Winning section
  rules.push({
    id: 'winning-good',
    title: 'Good Victory',
    content: `Good wins by completing 3 out of 5 missions successfully. 
    However, if Good achieves 3 successful missions, the Assassin gets 
    one chance to identify and eliminate Merlin.`,
    section: 'winning',
    tags: ['good', 'missions', 'assassin', 'merlin'],
    difficulty: 'beginner',
    lastUpdated: new Date().toISOString()
  });

  rules.push({
    id: 'winning-evil',
    title: 'Evil Victory',
    content: `Evil wins by failing 3 missions, rejecting 5 proposals in a row, 
    or having the Assassin successfully identify Merlin after Good completes 3 missions.`,
    section: 'winning',
    tags: ['evil', 'missions', 'rejection', 'assassin'],
    difficulty: 'beginner',
    lastUpdated: new Date().toISOString()
  });

  return rules;
}

/**
 * Search through rule content
 */
export function searchRules(
  query: string,
  rules: RuleContent[],
  filters: RuleSearchFilters
): RuleSearchResult[] {
  if (query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
    return [];
  }

  const normalizedQuery = query.toLowerCase();
  const results: RuleSearchResult[] = [];

  rules.forEach(rule => {
    // Apply filters
    if (filters.sections.length > 0 && !filters.sections.includes(rule.section)) {
      return;
    }
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(rule.difficulty)) {
      return;
    }

    // Calculate relevance score
    let relevanceScore = 0;
    const titleMatch = rule.title.toLowerCase().includes(normalizedQuery);
    const contentMatch = rule.content.toLowerCase().includes(normalizedQuery);
    const tagMatch = rule.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));

    if (titleMatch) relevanceScore += 1.0;
    if (contentMatch) relevanceScore += 0.7;
    if (tagMatch) relevanceScore += 0.5;

    // Add exact match bonus
    if (rule.title.toLowerCase() === normalizedQuery) relevanceScore += 0.5;
    if (rule.tags.some(tag => tag.toLowerCase() === normalizedQuery)) relevanceScore += 0.3;

    if (relevanceScore >= SEARCH_CONFIG.RELEVANCE_THRESHOLD) {
      // Create highlight
      const highlight = createHighlight(rule.content, normalizedQuery);
      const breadcrumb = createBreadcrumb(rule.section, rule.title);

      results.push({
        id: rule.id,
        title: rule.title,
        content: rule.content,
        type: getSearchResultType(rule),
        section: rule.section,
        relevanceScore,
        highlight,
        breadcrumb
      });
    }
  });

  // Sort by relevance score
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results.slice(0, SEARCH_CONFIG.MAX_RESULTS);
}

/**
 * Create highlighted text for search results
 */
function createHighlight(text: string, query: string): string {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, `${SEARCH_CONFIG.HIGHLIGHT_TAG}$1${SEARCH_CONFIG.HIGHLIGHT_END_TAG}`);
}

/**
 * Create breadcrumb for search results
 */
function createBreadcrumb(section: RuleSection, title: string): string[] {
  const sectionNames: Record<RuleSection, string> = {
    overview: 'Game Overview',
    characters: 'Characters',
    missions: 'Missions',
    voting: 'Voting',
    winning: 'Victory Conditions',
    strategies: 'Strategies',
    advanced: 'Advanced Rules'
  };

  return [sectionNames[section], title];
}

/**
 * Determine search result type
 */
function getSearchResultType(rule: RuleContent): RuleSearchResult['type'] {
  if (rule.section === 'characters') return 'character';
  if (rule.section === 'missions') return 'mission';
  if (rule.section === 'strategies') return 'strategy';
  if (rule.examples && rule.examples.length > 0) return 'example';
  return 'rule';
}

/**
 * Generate search suggestions
 */
export function generateSearchSuggestions(query: string, rules: RuleContent[]): string[] {
  if (query.length < 2) return [];

  const suggestions = new Set<string>();
  const normalizedQuery = query.toLowerCase();

  // Add character names
  CHARACTER_ABILITIES.forEach(ability => {
    if (ability.name.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(ability.name);
    }
  });

  // Add rule titles
  rules.forEach(rule => {
    if (rule.title.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(rule.title);
    }
    
    // Add tags
    rule.tags.forEach(tag => {
      if (tag.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(tag);
      }
    });
  });

  // Add common terms
  const commonTerms = [
    'mission', 'vote', 'proposal', 'assassin', 'merlin', 'evil', 'good',
    'success', 'fail', 'rejection', 'victory', 'character', 'ability'
  ];
  
  commonTerms.forEach(term => {
    if (term.includes(normalizedQuery)) {
      suggestions.add(term);
    }
  });

  return Array.from(suggestions).slice(0, 5);
}

/**
 * Generate contextual help for different game phases
 */
export function generateContextualHelp(context: HelpContextType): ContextualHelp[] {
  const helpItems: ContextualHelp[] = [];

  switch (context) {
    case 'lobby':
      helpItems.push({
        id: 'lobby-character-selection',
        context: 'lobby',
        title: 'Character Selection',
        content: 'Choose characters carefully. Merlin and Percival provide information to good players, while Morgana and Mordred can confuse them.',
        priority: 'medium',
        trigger: { type: 'automatic', delay: 3000 },
        displayConfig: {
          position: 'top',
          animation: 'slide',
          duration: 5000,
          dismissible: true,
          hasCloseButton: true,
          showArrow: true
        }
      });
      break;

    case 'role-reveal':
      helpItems.push({
        id: 'role-reveal-information',
        context: 'role-reveal',
        title: 'Role Information',
        content: 'Remember your character\'s abilities and what information you have. This knowledge will guide your decisions throughout the game.',
        priority: 'high',
        trigger: { type: 'automatic', delay: 1000 },
        displayConfig: {
          position: 'center',
          animation: 'fade',
          duration: 8000,
          dismissible: true,
          hasCloseButton: true,
          showArrow: false
        }
      });
      break;

    case 'mission-proposal':
      helpItems.push({
        id: 'mission-proposal-strategy',
        context: 'mission-proposal',
        title: 'Mission Proposal Strategy',
        content: 'As leader, choose team members you trust. Consider who has been selected before and their voting patterns.',
        priority: 'high',
        trigger: { type: 'conditional' },
        displayConfig: {
          position: 'bottom',
          animation: 'slide',
          duration: 6000,
          dismissible: true,
          hasCloseButton: true,
          showArrow: true
        },
        conditions: [
          { type: 'userAction', operator: 'equals', value: 'isCurrentLeader' }
        ]
      });
      break;

    case 'voting':
      helpItems.push({
        id: 'voting-considerations',
        context: 'voting',
        title: 'Voting Considerations',
        content: 'Consider the team composition and the proposal history. Remember that 5 rejections in a row means evil wins.',
        priority: 'medium',
        trigger: { type: 'automatic', delay: 2000 },
        displayConfig: {
          position: 'top',
          animation: 'bounce',
          duration: 5000,
          dismissible: true,
          hasCloseButton: true,
          showArrow: true
        }
      });
      break;

    case 'mission-execution':
      helpItems.push({
        id: 'mission-execution-rules',
        context: 'mission-execution',
        title: 'Mission Execution',
        content: 'Good players must vote Success. Evil players can choose Success or Fail. Remember, only one Fail is needed to fail most missions.',
        priority: 'high',
        trigger: { type: 'automatic', delay: 500 },
        displayConfig: {
          position: 'center',
          animation: 'pulse',
          duration: 7000,
          dismissible: true,
          hasCloseButton: true,
          showArrow: false
        }
      });
      break;

    case 'assassin-attempt':
      helpItems.push({
        id: 'assassin-attempt-strategy',
        context: 'assassin-attempt',
        title: 'Assassin Attempt',
        content: 'Choose carefully! You have one chance to identify Merlin. Look for players who seemed to have information about evil players.',
        priority: 'high',
        trigger: { type: 'automatic', delay: 1000 },
        displayConfig: {
          position: 'center',
          animation: 'fade',
          duration: 10000,
          dismissible: true,
          hasCloseButton: true,
          showArrow: false
        }
      });
      break;

    case 'game-results':
      helpItems.push({
        id: 'game-results-analysis',
        context: 'game-results',
        title: 'Game Analysis',
        content: 'Review the game timeline and player actions to learn strategies for future games.',
        priority: 'low',
        trigger: { type: 'automatic', delay: 3000 },
        displayConfig: {
          position: 'bottom',
          animation: 'slide',
          duration: 4000,
          dismissible: true,
          hasCloseButton: true,
          showArrow: true
        }
      });
      break;
  }

  return helpItems;
}

/**
 * Update rule progress tracking
 */
export function updateRuleProgress(
  progress: RuleProgress,
  section: RuleSection,
  timeSpent: number
): RuleProgress {
  const updatedProgress = { ...progress };
  
  if (!updatedProgress.sectionsRead.includes(section)) {
    updatedProgress.sectionsRead.push(section);
  }
  
  updatedProgress.totalTimeSpent += timeSpent;
  updatedProgress.lastAccessed = new Date().toISOString();
  
  return updatedProgress;
}

/**
 * Check if character dependencies are met
 */
export function validateCharacterDependencies(selectedCharacters: CharacterType[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required dependencies
  if (selectedCharacters.includes('percival') && !selectedCharacters.includes('merlin')) {
    errors.push('Percival requires Merlin to be included');
  }

  if (selectedCharacters.includes('percival') && !selectedCharacters.includes('morgana')) {
    errors.push('Percival requires Morgana to be included');
  }

  if (selectedCharacters.includes('merlin') && !selectedCharacters.includes('assassin')) {
    errors.push('Merlin requires Assassin to be included');
  }

  if (selectedCharacters.includes('mordred') && !selectedCharacters.includes('merlin')) {
    errors.push('Mordred can only be included if Merlin is present');
  }

  // Check strategic warnings
  if (selectedCharacters.includes('oberon') && selectedCharacters.filter(c => 
    ['assassin', 'morgana', 'mordred', 'evil-servant'].includes(c)
  ).length < 2) {
    warnings.push('Oberon works best with multiple other evil characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format rule content for display
 */
export function formatRuleContent(content: string): string {
  // Convert markdown-style formatting to HTML
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  return formatted;
}

/**
 * Get appropriate help for current game state
 */
export function getRelevantHelp(
  context: HelpContextType,
  gameState: any,
  userProgress: RuleProgress
): ContextualHelp[] {
  const contextualHelp = generateContextualHelp(context);
  
  // Filter based on user progress and preferences
  return contextualHelp.filter(help => {
    // Check if help has been shown too many times
    const maxRepeats = help.trigger.repeatConfig?.maxRepeats || 3;
    // Implementation would track help display count
    
    // Check conditions
    if (help.conditions) {
      return help.conditions.every(condition => {
        // Implementation would check game state conditions
        return true;
      });
    }
    
    return true;
  });
}

/**
 * Generate rule summary for quick reference
 */
export function generateRuleSummary(playerCount: number, characters: CharacterType[]): string {
  const missionReq = getMissionRequirements(playerCount);
  const summary = [];

  summary.push(`**Player Count:** ${playerCount}`);
  summary.push(`**Characters:** ${characters.map(c => CHARACTER_ABILITIES.find(a => a.character === c)?.name || c).join(', ')}`);
  
  if (missionReq) {
    summary.push(`**Mission Sizes:** ${Object.values(missionReq.missions).join(', ')}`);
    if (missionReq.twoFailRule) {
      summary.push(`**Special Rule:** Mission 4 requires 2 fail votes`);
    }
  }

  summary.push(`**Victory:** Good wins with 3 successful missions, Evil wins with 3 failed missions or successful Assassin attempt`);

  return summary.join('\n');
}
