/**
 * Main Game Rules Modal
 * 
 * Complete game rules interface with search, navigation, and content display.
 * Provides comprehensive rule access with contextual help integration.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Download, Share2, Bookmark } from 'lucide-react';
import type { GameRulesState, RuleContent, RuleSection } from '~/types/game-rules';
import { createInitialRulesState, generateRuleContent, searchRules, generateSearchSuggestions } from '~/lib/game-rules-utils';
import GameRulesSearch from './GameRulesSearch';
import GameRulesContent from './GameRulesContent';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: RuleSection;
  playerCount?: number;
  selectedCharacters?: string[];
}

export default function GameRulesModal({
  isOpen,
  onClose,
  initialSection = 'overview',
  playerCount = 7,
  selectedCharacters = []
}: GameRulesModalProps) {
  const [rulesState, setRulesState] = useState<GameRulesState>(createInitialRulesState());
  const [ruleContent] = useState<RuleContent[]>(generateRuleContent());
  const [selectedRule, setSelectedRule] = useState<RuleContent | null>(null);

  // Initialize section
  useEffect(() => {
    if (isOpen) {
      setRulesState(prev => ({
        ...prev,
        isOpen: true,
        activeSection: initialSection
      }));
    }
  }, [isOpen, initialSection]);

  // Search functionality
  const handleSearchChange = useCallback((query: string) => {
    setRulesState(prev => ({
      ...prev,
      searchState: {
        ...prev.searchState,
        query,
        isSearching: true
      }
    }));

    // Debounced search
    const timeoutId = setTimeout(() => {
      const results = searchRules(query, ruleContent, rulesState.searchState.filters);
      const suggestions = generateSearchSuggestions(query, ruleContent);
      
      setRulesState(prev => ({
        ...prev,
        searchState: {
          ...prev.searchState,
          results,
          suggestions,
          isSearching: false
        }
      }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [ruleContent, rulesState.searchState.filters]);

  const handleFiltersChange = useCallback((filters: typeof rulesState.searchState.filters) => {
    setRulesState(prev => ({
      ...prev,
      searchState: {
        ...prev.searchState,
        filters
      }
    }));

    // Re-run search with new filters
    if (rulesState.searchState.query) {
      const results = searchRules(rulesState.searchState.query, ruleContent, filters);
      setRulesState(prev => ({
        ...prev,
        searchState: {
          ...prev.searchState,
          results
        }
      }));
    }
  }, [ruleContent, rulesState.searchState.query]);

  const handleResultSelect = useCallback((result: typeof rulesState.searchState.results[0]) => {
    const rule = ruleContent.find(r => r.id === result.id);
    if (rule) {
      setSelectedRule(rule);
      setRulesState(prev => ({
        ...prev,
        activeSection: rule.section,
        searchState: {
          ...prev.searchState,
          query: '',
          results: []
        }
      }));
    }
  }, [ruleContent]);

  const handleClearSearch = useCallback(() => {
    setRulesState(prev => ({
      ...prev,
      searchState: {
        ...prev.searchState,
        query: '',
        results: [],
        suggestions: []
      }
    }));
  }, []);

  const handleSectionChange = useCallback((section: RuleSection) => {
    setRulesState(prev => ({
      ...prev,
      activeSection: section
    }));
    setSelectedRule(null);
  }, []);

  // Export rules as PDF (placeholder)
  const handleExport = useCallback(() => {
    // Implementation would generate PDF
    console.log('Exporting rules as PDF...');
  }, []);

  // Share current section (placeholder)
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: 'Avalon Game Rules',
        text: `Check out these Avalon game rules: ${rulesState.activeSection}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }, [rulesState.activeSection]);

  // Bookmark current section (placeholder)
  const handleBookmark = useCallback(() => {
    // Implementation would save to user preferences
    console.log('Bookmarking section:', rulesState.activeSection);
  }, [rulesState.activeSection]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">Avalon Game Rules</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{playerCount} players</span>
              {selectedCharacters.length > 0 && (
                <span>• {selectedCharacters.length} characters</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBookmark}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
              title="Bookmark this section"
            >
              <Bookmark className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
              title="Share rules"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleExport}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
              title="Export as PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
              title="Close rules"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-700">
          <GameRulesSearch
            searchState={rulesState.searchState}
            onSearchChange={handleSearchChange}
            onFiltersChange={handleFiltersChange}
            onResultSelect={handleResultSelect}
            onClearSearch={handleClearSearch}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden p-6">
          <GameRulesContent
            activeSection={rulesState.activeSection}
            onSectionChange={handleSectionChange}
            selectedRule={selectedRule || undefined}
            playerCount={playerCount}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Rules last updated: {new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span>{ruleContent.length} rules available</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">ESC</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
