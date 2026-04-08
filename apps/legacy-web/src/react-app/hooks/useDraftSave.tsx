import { useState, useEffect, useCallback, useRef } from 'react';

interface DraftSaveOptions {
  key: string;
  debounceMs?: number;
  onRestore?: (data: any) => void;
}

export function useDraftSave<T extends Record<string, any>>({
  key,
  debounceMs = 1000,
  onRestore,
}: DraftSaveOptions) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `draft_${key}`;

  // Check for existing draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setHasDraft(true);
        setLastSaved(parsed.savedAt ? new Date(parsed.savedAt) : null);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  // Save draft with debounce
  const saveDraft = useCallback(
    (data: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const draftData = {
          data,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(draftData));
        setHasDraft(true);
        setLastSaved(new Date());
      }, debounceMs);
    },
    [storageKey, debounceMs]
  );

  // Restore draft
  const restoreDraft = useCallback((): T | null => {
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (onRestore) {
          onRestore(parsed.data);
        }
        return parsed.data as T;
      } catch {
        return null;
      }
    }
    return null;
  }, [storageKey, onRestore]);

  // Clear draft
  const clearDraft = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    localStorage.removeItem(storageKey);
    setHasDraft(false);
    setLastSaved(null);
  }, [storageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveDraft,
    restoreDraft,
    clearDraft,
    hasDraft,
    lastSaved,
  };
}

// Helper component for draft restore prompt
export function DraftRestorePrompt({
  onRestore,
  onDiscard,
  lastSaved,
}: {
  onRestore: () => void;
  onDiscard: () => void;
  lastSaved: Date | null;
}) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-medium text-blue-900 dark:text-blue-100">
            Unsaved draft found
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {lastSaved ? `Last saved ${formatTime(lastSaved)}` : 'Would you like to restore it?'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDiscard}
            className="px-3 py-1.5 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
          >
            Discard
          </button>
          <button
            onClick={onRestore}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Restore Draft
          </button>
        </div>
      </div>
    </div>
  );
}
