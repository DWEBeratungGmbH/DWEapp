"use client";

import { weclappService } from "@/lib/weclapp";
import { clockinService } from "@/lib/clockin";
import { ClockInEntry, Task } from "@/types";

export class SyncService {
  /**
   * Syncs time entries from ClockIn to WeClapp tasks
   */
  static async syncTimeEntriesToWeClapp(timeEntries: ClockInEntry[]) {
    const results = [];

    for (const entry of timeEntries) {
      if (!entry.taskId) {
        console.warn(`Skipping time entry ${entry.id} - no task ID`);
        continue;
      }

      try {
        // Stop timer if still running
        let finalEntry = entry;
        if (!entry.endTime) {
          finalEntry = await clockinService.stopTimer(entry.id);
        }

        // Calculate hours and update WeClapp
        const durationInHours = (finalEntry.duration || 0) / 3600;
        const updatedTask = await weclappService.updateTaskTime(entry.taskId, durationInHours);

        results.push({
          timeEntryId: entry.id,
          taskId: entry.taskId,
          duration: durationInHours,
          success: true,
          task: updatedTask,
        });
      } catch (error) {
        console.error(`Failed to sync time entry ${entry.id} to WeClapp:`, error);
        results.push({
          timeEntryId: entry.id,
          taskId: entry.taskId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Syncs projects from WeClapp to ClockIn
   */
  static async syncProjectsToClockIn() {
    try {
      const weClappProjects = await weclappService.getProjects();
      const results = [];

      for (const project of weClappProjects) {
        try {
          const clockInProject = await clockinService.syncProjectWithWeClapp(project.id);
          results.push({
            weClappProjectId: project.id,
            clockInProjectId: clockInProject.id,
            success: true,
          });
        } catch (error) {
          console.error(`Failed to sync project ${project.id} to ClockIn:`, error);
          results.push({
            weClappProjectId: project.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Failed to sync projects to ClockIn:", error);
      throw error;
    }
  }

  /**
   * Real-time sync when a project is created in WeClapp
   */
  static async handleWeClappProjectCreated(projectId: string) {
    try {
      // Get project details from WeClapp
      const project = await weclappService.getProject(projectId);
      
      // Sync to ClockIn
      const clockInProject = await clockinService.syncProjectWithWeClapp(projectId);
      
      return {
        weClappProject: project,
        clockInProject,
      };
    } catch (error) {
      console.error(`Failed to handle WeClapp project creation:`, error);
      throw error;
    }
  }

  /**
   * Real-time sync when a task is updated in WeClapp
   */
  static async handleWeClappTaskUpdated(taskId: string) {
    try {
      // Get task details from WeClapp
      const task = await weclappService.getTask(taskId);
      
      // Update local state if needed
      return task;
    } catch (error) {
      console.error(`Failed to handle WeClapp task update:`, error);
      throw error;
    }
  }

  /**
   * Batch sync for all data
   */
  static async performFullSync() {
    const startTime = Date.now();
    const results = {
      projects: { success: 0, failed: 0 },
      tasks: { success: 0, failed: 0 },
      timeEntries: { success: 0, failed: 0 },
    };

    try {
      // Sync projects from WeClapp to ClockIn
      const projectSyncResults = await this.syncProjectsToClockIn();
      projectSyncResults.forEach(result => {
        if (result.success) {
          results.projects.success++;
        } else {
          results.projects.failed++;
        }
      });

      // Sync time entries from ClockIn to WeClapp
      const today = new Date().toISOString().split("T")[0];
      const timeEntries = await clockinService.getTimeEntries("current-user", today, today);
      const timeSyncResults = await this.syncTimeEntriesToWeClapp(timeEntries);
      timeSyncResults.forEach(result => {
        if (result.success) {
          results.timeEntries.success++;
        } else {
          results.timeEntries.failed++;
        }
      });

      const duration = Date.now() - startTime;
      console.log(`Full sync completed in ${duration}ms`, results);

      return {
        duration,
        results,
        success: results.projects.failed === 0 && results.timeEntries.failed === 0,
      };
    } catch (error) {
      console.error("Full sync failed:", error);
      throw error;
    }
  }

  /**
   * Validates data consistency between WeClapp and ClockIn
   */
  static async validateDataConsistency() {
    const issues = [];

    try {
      // Get projects from both systems
      const weClappProjects = await weclappService.getProjects();
      const clockInProjects = await clockinService.getProjects();

      // Check for missing projects in ClockIn
      const clockInProjectIds = new Set(clockInProjects.map(p => p.id));
      const missingInClockIn = weClappProjects.filter(p => !clockInProjectIds.has(p.id));
      
      if (missingInClockIn.length > 0) {
        issues.push({
          type: "missing_projects_in_clockin",
          count: missingInClockIn.length,
          projects: missingInClockIn.map(p => ({ id: p.id, name: p.name })),
        });
      }

      // Check for orphaned time entries (entries without valid tasks)
      const today = new Date().toISOString().split("T")[0];
      const timeEntries = await clockinService.getTimeEntries("current-user", today, today);
      const tasks = await weclappService.getTasks();
      const taskIds = new Set(tasks.map(t => t.id));
      
      const orphanedEntries = timeEntries.filter(entry => entry.taskId && !taskIds.has(entry.taskId));
      
      if (orphanedEntries.length > 0) {
        issues.push({
          type: "orphaned_time_entries",
          count: orphanedEntries.length,
          entries: orphanedEntries.map(e => ({ id: e.id, taskId: e.taskId })),
        });
      }

      return {
        issues,
        healthy: issues.length === 0,
      };
    } catch (error) {
      console.error("Data validation failed:", error);
      throw error;
    }
  }
}
