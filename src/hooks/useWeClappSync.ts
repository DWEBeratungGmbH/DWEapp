"use client";

import { useState, useEffect } from "react";
import { weclappService } from "@/lib/weclapp";
import { Project, Task, TaskTemplate } from "@/types";

export function useWeClappSync() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const weClappProjects = await weclappService.getProjects();
      
      const transformedProjects: Project[] = weClappProjects.map(project => ({
        ...project,
        progress: calculateProjectProgress(project.id),
        teamMembers: [], // Would fetch from WeClapp user service
      }));
      
      setProjects(transformedProjects);
    } catch (err) {
      setError("Fehler beim Synchronisieren der Projekte");
      console.error("Failed to sync projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncTasks = async (projectId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const weClappTasks = await weclappService.getTasks(projectId);
      
      const transformedTasks: Task[] = weClappTasks.map(task => ({
        ...task,
        assignee: undefined, // Would fetch from WeClapp user service
        comments: [],
        attachments: [],
        timeEntries: [],
      }));
      
      setTasks(transformedTasks);
    } catch (err) {
      setError("Fehler beim Synchronisieren der Aufgaben");
      console.error("Failed to sync tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncTaskTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const templates = await weclappService.getTaskTemplates();
      setTaskTemplates(templates);
    } catch (err) {
      setError("Fehler beim Synchronisieren der Aufgabenvorlagen");
      console.error("Failed to sync task templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTaskFromTemplate = async (templateId: string, projectId: string) => {
    try {
      const newTask = await weclappService.createTaskFromTemplate(templateId, projectId);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError("Fehler beim Erstellen der Aufgabe aus Vorlage");
      console.error("Failed to create task from template:", err);
      throw err;
    }
  };

  const updateTaskTime = async (taskId: string, actualHours: number) => {
    try {
      const updatedTask = await weclappService.updateTaskTime(taskId, actualHours);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updatedTask } : task
      ));
      return updatedTask;
    } catch (err) {
      setError("Fehler beim Aktualisieren der Aufgabenzeit");
      console.error("Failed to update task time:", err);
      throw err;
    }
  };

  const calculateProjectProgress = (projectId: string): number => {
    // This would calculate actual progress based on tasks
    // For now, return a random value as placeholder
    return Math.floor(Math.random() * 100);
  };

  const syncAll = async () => {
    await Promise.all([
      syncProjects(),
      syncTasks(),
      syncTaskTemplates(),
    ]);
  };

  useEffect(() => {
    syncAll();
  }, []);

  return {
    projects,
    tasks,
    taskTemplates,
    loading,
    error,
    syncProjects,
    syncTasks,
    syncTaskTemplates,
    createTaskFromTemplate,
    updateTaskTime,
    syncAll,
  };
}
