/**
 * Game Rules Search Interface
 * 
 * Search component for quickly finding specific rules, characters,
 * or game mechanics with autocomplete and filtering.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import type { RuleSearchState, RuleSearchFilters, RuleSearchResult, RuleSection } from '~/types/game-rules';

interface GameRulesSearchProps {
  searchState: RuleSearchState;
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: RuleSearchFilters) => void;
  onResultSelect: (result: RuleSearchResult) => void;
  onClearSearch: () => void;
}

export default function GameRulesSearch({
  searchState,
  onSearchChange,
  onFiltersChange,
  onResultSelect,
  onClearSearch
}: GameRulesSearchProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < searchState.results.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev > 0 ? prev - 1 : searchState.results.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestion >= 0 && searchState.results[selectedSuggestion]) {
        onResultSelect(searchState.results[selectedSuggestion]);
      }
    } else if (e.key === 'Escape') {
      onClearSearch();
    }
  }, [searchState.results, selectedSuggestion, onResultSelect, onClearSearch]);

  const sectionNames: Record<RuleSection, string> = {
    overview: 'Overview',
    characters: 'Characters',
    missions: 'Missions',
    voting: 'Voting',
    winning: 'Victory Conditions',
    strategies: 'Strategies',
    advanced: 'Advanced Rules'
  };

  const filterCount = searchState.filters.sections.length + 
                     searchState.filters.types.length + 
                     searchState.filters.difficulty.length;

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={searchState.query}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search rules, characters, or mechanics..."
          className="
            w-full pl-10 pr-20 py-3 
            bg-gray-800 border border-gray-700 rounded-lg
            text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
          "
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {/* Filter Button */}
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`
              p-1 rounded-md transition-colors duration-200
              ${isFiltersOpen || filterCount > 0 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }
            `}
            aria-label="Toggle filters"
          >
            <Filter className="h-4 w-4" />
            {filterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </button>

          {/* Clear Button */}
          {searchState.query && (
            <button
              onClick={onClearSearch}
              className="p-1 text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-4 z-10 shadow-xl">
          <div className="space-y-4">
            {/* Sections Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sections
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(sectionNames).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => {
                      const sections = searchState.filters.sections.includes(key as RuleSection)
                        ? searchState.filters.sections.filter(s => s !== key)
                        : [...searchState.filters.sections, key as RuleSection];
                      onFiltersChange({ ...searchState.filters, sections });
                    }}
                    className={`
                      px-3 py-1 rounded-full text-sm transition-colors duration-200
                      ${searchState.filters.sections.includes(key as RuleSection)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <div className="flex gap-2">
                {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => {
                      const difficulties = searchState.filters.difficulty.includes(difficulty as any)
                        ? searchState.filters.difficulty.filter(d => d !== difficulty)
                        : [...searchState.filters.difficulty, difficulty as any];
                      onFiltersChange({ ...searchState.filters, difficulty: difficulties });
                    }}
                    className={`
                      px-3 py-1 rounded-full text-sm capitalize transition-colors duration-200
                      ${searchState.filters.difficulty.includes(difficulty as any)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                    `}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => onFiltersChange({ sections: [], types: [], difficulty: [] })}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchState.query && searchState.results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
          {searchState.results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => onResultSelect(result)}
              className={`
                w-full text-left p-4 hover:bg-gray-700 transition-colors duration-200
                ${index === selectedSuggestion ? 'bg-gray-700' : ''}
                ${index < searchState.results.length - 1 ? 'border-b border-gray-700' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-white">{result.title}</h4>
                    <span className={`
                      px-2 py-1 rounded-full text-xs
                      ${result.type === 'character' ? 'bg-purple-100 text-purple-800' :
                        result.type === 'mission' ? 'bg-blue-100 text-blue-800' :
                        result.type === 'strategy' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {result.type}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-2">
                    {result.breadcrumb.join(' > ')}
                  </div>
                  
                  <div 
                    className="text-sm text-gray-400 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: result.highlight }}
                  />
                </div>
                
                <div className="text-xs text-gray-500 ml-4">
                  {Math.round(result.relevanceScore * 100)}% match
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchState.query && searchState.results.length === 0 && !searchState.isSearching && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-4 z-20">
          <p className="text-gray-400 text-center">
            No results found for "{searchState.query}"
          </p>
        </div>
      )}

      {/* Loading */}
      {searchState.isSearching && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg p-4 z-20">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        </div>
      )}
    </div>
  );
}
