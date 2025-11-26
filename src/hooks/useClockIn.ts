"use client";

import { useState, useEffect } from "react";
import { clockinService } from "@/lib/clockin";
import { ClockInTimeEntry } from "@/types";

export function useClockIn() {
  const [currentTimeEntries, setCurrentTimeEntries] = useState<ClockInTimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<ClockInTimeEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTimer = async (userId: string, taskId?: string, description?: string) => {
    try {
      setLoading(true);
      setError(null);
      const timer = await clockinService.startTimer(userId, taskId, description);
      setActiveTimer(timer);
      return timer;
    } catch (err) {
      setError("Fehler beim Starten des Timers");
      console.error("Failed to start timer:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async (timerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const stoppedTimer = await clockinService.stopTimer(timerId);
      setActiveTimer(null);
      return stoppedTimer;
    } catch (err) {
      setError("Fehler beim Stoppen des Timers");
      console.error("Failed to stop timer:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTimer = async (userId: string) => {
    try {
      const timer = await clockinService.getCurrentTimer(userId);
      setActiveTimer(timer);
      return timer;
    } catch (err) {
      setActiveTimer(null);
      return null;
    }
  };

  const getTimeEntries = async (userId?: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const entries = await clockinService.getTimeEntries(userId, startDate, endDate);
      setCurrentTimeEntries(entries);
      return entries;
    } catch (err) {
      setError("Fehler beim Laden der Zeiteinträge");
      console.error("Failed to get time entries:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTimeEntry = async (entry: Omit<ClockInTimeEntry, "id">) => {
    try {
      setLoading(true);
      setError(null);
      const newEntry = await clockinService.createTimeEntry(entry);
      setCurrentTimeEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      setError("Fehler beim Erstellen des Zeiteintrags");
      console.error("Failed to create time entry:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTimeEntry = async (id: string, entry: Partial<ClockInTimeEntry>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedEntry = await clockinService.updateTimeEntry(id, entry);
      setCurrentTimeEntries(prev => prev.map(e => e.id === id ? updatedEntry : e));
      return updatedEntry;
    } catch (err) {
      setError("Fehler beim Aktualisieren des Zeiteintrags");
      console.error("Failed to update time entry:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeEntry = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await clockinService.deleteTimeEntry(id);
      setCurrentTimeEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError("Fehler beim Löschen des Zeiteintrags");
      console.error("Failed to delete time entry:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncWithWeClapp = async (timeEntry: ClockInTimeEntry) => {
    if (!timeEntry.taskId) {
      throw new Error("Keine Aufgaben-ID für Synchronisierung vorhanden");
    }

    try {
      setLoading(true);
      setError(null);
      
      // Stop timer first if still running
      if (!timeEntry.endTime) {
        const stoppedTimer = await clockinService.stopTimer(timeEntry.id);
        timeEntry = stoppedTimer;
      }

      // Calculate hours and update WeClapp
      const durationInHours = (timeEntry.duration || 0) / 3600;
      return durationInHours;
    } catch (err) {
      setError("Fehler bei der Synchronisierung mit WeClapp");
      console.error("Failed to sync with WeClapp:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-load current timer on mount
  useEffect(() => {
    getCurrentTimer("current-user");
  }, []);

  return {
    currentTimeEntries,
    activeTimer,
    loading,
    error,
    startTimer,
    stopTimer,
    getCurrentTimer,
    getTimeEntries,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    syncWithWeClapp,
  };
}
