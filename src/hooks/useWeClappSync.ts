import { useState } from 'react';
import { weclappService } from '@/lib/weclapp';
import { Task } from '@/types';

export function useWeClappSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncTasks = async (projectId?: string) => {
    setIsSyncing(true);
    setError(null);
    try {
      const weClappTasks = await weclappService.getTasks(projectId);

      const transformedTasks: Task[] = weClappTasks.map(task => ({
        ...task,
        projectId: task.projectId ?? projectId ?? "",
        // Fix: Convert number timestamp to ISO string if present
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
        assignee: undefined,
        comments: [],
        attachments: [],
        timeEntries: [],
        description: task.description ?? "",
        estimatedHours: task.estimatedHours ?? 0,
        actualHours: task.actualHours ?? 0,
      }));

      return transformedTasks;
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
