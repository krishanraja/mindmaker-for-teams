import { useRef, useCallback } from 'react';

interface SaveTask {
  id: string;
  save: () => Promise<void>;
  component: string;
}

class SaveQueue {
  private queue: Map<string, SaveTask> = new Map();
  private processing = false;
  private listeners: Set<(status: SaveQueueStatus) => void> = new Set();

  addTask(task: SaveTask) {
    this.queue.set(task.id, task);
    this.notifyListeners();
  }

  removeTask(id: string) {
    this.queue.delete(id);
    this.notifyListeners();
  }

  async flushAll(): Promise<void> {
    if (this.processing || this.queue.size === 0) return;

    this.processing = true;
    this.notifyListeners();

    const tasks = Array.from(this.queue.values());
    const results = await Promise.allSettled(
      tasks.map(task => task.save().catch(err => {
        console.error(`[SaveQueue] Failed to save ${task.component}:`, err);
        throw err;
      }))
    );

    // Check for failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error(`[SaveQueue] ${failures.length} saves failed`);
    }

    this.queue.clear();
    this.processing = false;
    this.notifyListeners();
  }

  subscribe(listener: (status: SaveQueueStatus) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const status: SaveQueueStatus = {
      pending: this.queue.size,
      processing: this.processing,
      components: Array.from(this.queue.values()).map(t => t.component),
    };
    this.listeners.forEach(listener => listener(status));
  }

  getStatus(): SaveQueueStatus {
    return {
      pending: this.queue.size,
      processing: this.processing,
      components: Array.from(this.queue.values()).map(t => t.component),
    };
  }
}

export interface SaveQueueStatus {
  pending: number;
  processing: boolean;
  components: string[];
}

// Global singleton
const globalSaveQueue = new SaveQueue();

export const useSaveQueue = () => {
  const taskIdRef = useRef<string | null>(null);

  const queueSave = useCallback((component: string, saveFunction: () => Promise<void>) => {
    const taskId = `${component}-${Date.now()}`;
    taskIdRef.current = taskId;

    globalSaveQueue.addTask({
      id: taskId,
      save: saveFunction,
      component,
    });
  }, []);

  const clearSave = useCallback(() => {
    if (taskIdRef.current) {
      globalSaveQueue.removeTask(taskIdRef.current);
      taskIdRef.current = null;
    }
  }, []);

  const flushAll = useCallback(async () => {
    await globalSaveQueue.flushAll();
  }, []);

  const subscribe = useCallback((listener: (status: SaveQueueStatus) => void) => {
    return globalSaveQueue.subscribe(listener);
  }, []);

  const getStatus = useCallback(() => {
    return globalSaveQueue.getStatus();
  }, []);

  return {
    queueSave,
    clearSave,
    flushAll,
    subscribe,
    getStatus,
  };
};
