import { useEffect, useRef, useState } from 'react';
import { useSaveQueue } from './useSaveQueue';
import { toast } from './use-toast';

interface UseEnhancedAutosaveOptions<T> {
  data: T;
  saveFunction: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
  componentName: string;
  maxRetries?: number;
}

interface UseEnhancedAutosaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  retryCount: number;
}

export function useEnhancedAutosave<T>({
  data,
  saveFunction,
  debounceMs = 1000,
  enabled = true,
  componentName,
  maxRetries = 3,
}: UseEnhancedAutosaveOptions<T>): UseEnhancedAutosaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const { queueSave, clearSave } = useSaveQueue();

  useEffect(() => {
    // Skip autosave on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Clear previous save from queue
    clearSave();

    // Set new timer
    timerRef.current = setTimeout(() => {
      const saveWithRetry = async (attemptsLeft: number = maxRetries): Promise<void> => {
        try {
          setIsSaving(true);
          setError(null);
          await saveFunction(data);
          setLastSaved(new Date());
          setRetryCount(0);
          clearSave();
        } catch (err) {
          const saveError = err instanceof Error ? err : new Error('Failed to autosave');
          console.error(`[${componentName}] Autosave error (${maxRetries - attemptsLeft + 1}/${maxRetries}):`, saveError);
          
          if (attemptsLeft > 0) {
            setRetryCount(maxRetries - attemptsLeft + 1);
            // Exponential backoff: 1s, 2s, 4s
            const backoffMs = 1000 * Math.pow(2, maxRetries - attemptsLeft);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            return saveWithRetry(attemptsLeft - 1);
          } else {
            setError(saveError);
            toast({
              title: 'Autosave failed',
              description: `Changes to ${componentName} could not be saved. Please use manual save.`,
              variant: 'destructive',
            });
          }
        } finally {
          setIsSaving(false);
        }
      };

      // Queue the save operation
      queueSave(componentName, () => saveWithRetry());
    }, debounceMs);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, saveFunction, debounceMs, enabled, componentName, maxRetries, queueSave, clearSave]);

  return { isSaving, lastSaved, error, retryCount };
}
