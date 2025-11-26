import { useState, useEffect } from "react";
import { AuthenticatedTemplate } from "@azure/msal-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock, Calendar, TrendingUp, Users, Coffee } from "lucide-react";
import { clockinService } from "@/lib/clockin";
import { ClockInTimeEntry } from "@/types";

function TimeTrackingContent() {
  const [currentTimeEntries, setCurrentTimeEntries] = useState<ClockInTimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<ClockInTimeEntry | null>(null);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const [todayEntries, weekEntries, currentTimer] = await Promise.all([
        clockinService.getTimeEntries("current-user", today.toISOString().split("T")[0], today.toISOString().split("T")[0]),
        clockinService.getTimeEntries("current-user", weekStart.toISOString().split("T")[0], today.toISOString().split("T")[0]),
        clockinService.getCurrentTimer("current-user"),
      ]);
      
      setCurrentTimeEntries(todayEntries);
      setActiveTimer(currentTimer);
      
      const todayHours = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
      const weekHours = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
      
      setTodayTotal(todayHours);
      setWeekTotal(weekHours);
    } catch (error) {
      console.error("Failed to load time data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = async (taskId?: string, description?: string) => {
    try {
      const timer = await clockinService.startTimer("current-user", taskId, description || "Zeiterfassung");
      setActiveTimer(timer);
      loadData();
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    
    try {
      const stoppedTimer = await clockinService.stopTimer(activeTimer.id);
      setActiveTimer(null);
      loadData();
    } catch (error) {
      console.error("Failed to stop timer:", error);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerDuration = () => {
    if (!activeTimer) return 0;
    const startTime = new Date(activeTimer.startTime);
    const now = new Date();
    return Math.floor((now.getTime() - startTime.getTime()) / 1000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "work": return "bg-blue-500";
      case "break": return "bg-yellow-500";
      case "meeting": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "work": return "Arbeit";
      case "break": return "Pause";
      case "meeting": return "Meeting";
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Zeitdaten werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Zeiterfassung</h1>
          <p className="text-muted-foreground">Erfassen und verwalten Sie Ihre Arbeitszeiten</p>
        </div>
        <Button>
          <Clock className="h-4 w-4 mr-2" />
          Manuel Eintrag
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heute</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTotal.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {currentTimeEntries.length} Einträge heute
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diese Woche</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekTotal.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Ø {(weekTotal / 5).toFixed(1)}h pro Tag
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiver Timer</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeTimer ? formatDuration(getTimerDuration()) : "00:00:00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeTimer ? activeTimer.description || "Läuft..." : "Inaktiv"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              6 aktiv heute
            </p>
          </CardContent>
        </Card>
      </div>

      {activeTimer && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              Aktiver Timer
            </CardTitle>
            <CardDescription>
              {activeTimer.description || "Zeiterfassung läuft"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="text-3xl font-mono font-bold">
                  {formatDuration(getTimerDuration())}
                </div>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(activeTimer.type)}>
                    {getTypeText(activeTimer.type)}
                  </Badge>
                  {activeTimer.taskId && (
                    <Badge variant="outline">Aufgabe verknüpft</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleStopTimer} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Beenden
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!activeTimer && (
        <Card>
          <CardHeader>
            <CardTitle>Schnellstart</CardTitle>
            <CardDescription>
              Starten Sie einen Timer für häufige Aufgaben
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleStartTimer(undefined, "Allgemeine Arbeit")}
                className="h-auto p-4 flex flex-col items-start"
              >
                <Play className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Allgemeine Arbeit</div>
                  <div className="text-sm opacity-70">Ohne Aufgabenverknüpfung</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleStartTimer(undefined, "Meeting")}
                className="h-auto p-4 flex flex-col items-start"
              >
                <Users className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Meeting</div>
                  <div className="text-sm opacity-70">Interne oder externe Meetings</div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleStartTimer(undefined, "Pause")}
                className="h-auto p-4 flex flex-col items-start"
              >
                <Coffee className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Pause</div>
                  <div className="text-sm opacity-70">Kaffee- oder Mittagspause</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Heutige Einträge</CardTitle>
          <CardDescription>
            Alle Zeiteinträge für heute
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentTimeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{entry.description || "Ohne Beschreibung"}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getTypeColor(entry.type)}>
                      {getTypeText(entry.type)}
                    </Badge>
                    <Badge variant="outline">
                      {new Date(entry.startTime).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                      {" - "}
                      {entry.endTime ? 
                        new Date(entry.endTime).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) :
                        "Läuft..."
                      }
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold">
                    {formatDuration(entry.duration || getTimerDuration())}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {((entry.duration || getTimerDuration()) / 3600).toFixed(2)}h
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {currentTimeEntries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Zeiteinträge für heute</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TimeTrackingPage() {
  return (
    <AuthenticatedTemplate>
      <TimeTrackingContent />
    </AuthenticatedTemplate>
  );
}
