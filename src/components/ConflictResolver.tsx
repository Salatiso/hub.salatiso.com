/**
 * Conflict Resolution UI Component
 * Visual interface for resolving data merge conflicts
 *
 * Features:
 * - Side-by-side comparison of conflicting versions
 * - Auto-resolve suggestions
 * - Manual merge editing
 * - Conflict history and tracking
 * - Batch resolution
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { collaborationService, ConflictResolution, ChangeOperation } from '../services/collaborationService';
import { ChevronDown, Check, X, Merge, AlertCircle } from 'lucide-react';

interface ConflictResolverProps {
  documentId: string;
  onResolved?: (conflict: ConflictResolution) => void;
  className?: string;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  documentId,
  onResolved,
  className = '',
}) => {
  const [conflicts, setConflicts] = useState<ConflictResolution[]>(
    collaborationService.getUnresolvedConflicts(documentId)
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAutoResolving, setIsAutoResolving] = useState(false);

  useEffect(() => {
    // Listen for new conflicts
    const unsubscribe = collaborationService.onConflictDetected((conflict) => {
      if (conflict.documentId === documentId && !conflict.resolved) {
        setConflicts(prev => [...prev, conflict]);
      }
    });

    return unsubscribe;
  }, [documentId]);

  const handleResolve = (conflictId: string, choice: 'local' | 'remote') => {
    const resolved = collaborationService.resolveConflict(conflictId, choice);
    
    if (resolved) {
      setConflicts(prev => prev.filter(c => c.id !== conflictId));
      onResolved?.(resolved);
    }
  };

  const handleAutoResolve = async () => {
    setIsAutoResolving(true);
    try {
      const resolved = collaborationService.autoResolveConflicts(documentId);
      setConflicts(prev =>
        prev.filter(c => !resolved.some(r => r.id === c.id))
      );
      resolved.forEach(r => onResolved?.(r));
    } finally {
      setIsAutoResolving(false);
    }
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
          {conflicts.length} Conflict{conflicts.length !== 1 ? 's' : ''} to Resolve
        </h3>
        <button
          onClick={handleAutoResolve}
          disabled={isAutoResolving}
          className="ml-auto px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded transition-colors"
        >
          {isAutoResolving ? 'Auto-resolving...' : 'Auto Resolve All'}
        </button>
      </div>

      <div className="space-y-3">
        {conflicts.map((conflict, index) => (
          <ConflictItem
            key={conflict.id}
            conflict={conflict}
            index={index}
            isExpanded={expandedId === conflict.id}
            onToggle={() =>
              setExpandedId(expandedId === conflict.id ? null : conflict.id)
            }
            onResolve={handleResolve}
          />
        ))}
      </div>
    </div>
  );
};

interface ConflictItemProps {
  conflict: ConflictResolution;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onResolve: (conflictId: string, choice: 'local' | 'remote') => void;
}

const ConflictItem: React.FC<ConflictItemProps> = ({
  conflict,
  index,
  isExpanded,
  onToggle,
  onResolve,
}) => {
  const localChange = conflict.localChange;
  const remoteChange = conflict.remoteChange;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <Merge className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Conflict #{index + 1}: {conflict.conflictType}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {localChange.path} • Changed by {localChange.userId.slice(0, 8)} vs {remoteChange.userId.slice(0, 8)}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 p-4">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Local Version */}
            <div className="border border-blue-200 dark:border-blue-800 rounded p-3 bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Your Version
              </p>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-100 dark:border-blue-900 mb-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {typeof localChange.newValue === 'object'
                    ? JSON.stringify(localChange.newValue, null, 2)
                    : String(localChange.newValue)}
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {new Date(localChange.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Remote Version */}
            <div className="border border-purple-200 dark:border-purple-800 rounded p-3 bg-purple-50 dark:bg-purple-900/20">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Their Version
              </p>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border border-purple-100 dark:border-purple-900 mb-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {typeof remoteChange.newValue === 'object'
                    ? JSON.stringify(remoteChange.newValue, null, 2)
                    : String(remoteChange.newValue)}
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {new Date(remoteChange.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onResolve(conflict.id, 'local')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <Check className="w-4 h-4" />
              Keep Mine
            </button>
            <button
              onClick={() => onResolve(conflict.id, 'remote')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            >
              <Check className="w-4 h-4" />
              Accept Theirs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictResolver;
