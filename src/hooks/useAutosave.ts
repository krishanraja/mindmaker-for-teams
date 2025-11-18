import { useEffect, useRef, useState } from 'react';

interface UseAutosaveOptions<T> {
  data: T;
  saveFunction: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseAutosaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

export function useAutosave<T>({
  data,
  saveFunction,
  debounceMs = 1000,
  enabled = true,
}: UseAutosaveOptions<T>): UseAutosaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip autosave on first render to avoid saving initial empty state
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setError(null);
        await saveFunction(data);
        setLastSaved(new Date());
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to autosave'));
        console.error('Autosave error:', err);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, saveFunction, debounceMs, enabled]);

  return { isSaving, lastSaved, error };
}
