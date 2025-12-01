import { useState } from 'react';
import { weclappService, WeClappTask } from '@/lib/weclapp';

export function useWeClappSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncTasks = async (projectId?: string): Promise<WeClappTask[]> => {
    setIsSyncing(true);
    setError(null);
    try {
      return await weclappService.getTasks(projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      return [];
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncTasks,
    isSyncing,
    error
  };
}
