/**
 * SearchBar Component - Phase 2.7
 * Search input component with icon and submit functionality
 * Prepared for Phase 3 full-text search integration
 */

import { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, onClear, placeholder = 'Search LifeSync...', className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onClear) {
      onClear();
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="relative">
        {/* Search Input Container */}
        <div
          className={`flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-700 rounded-lg border-2 transition-all ${
            isFocused
              ? 'border-blue-500 dark:border-blue-400 shadow-lg'
              : 'border-gray-200 dark:border-gray-600 shadow-sm'
          }`}
        >
          {/* Search Icon */}
          <Search className={`h-5 w-5 flex-shrink-0 transition-colors ${
            isFocused
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-400 dark:text-gray-500'
          }`} />

          {/* Input Field */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none"
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Suggestions Placeholder (for Phase 3) */}
        {isFocused && searchQuery.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50">
            <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-2">Search Ready (Phase 3)</p>
              <p className="text-xs">
                Full-text search across all LifeSync data will be available in Phase 3
              </p>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
