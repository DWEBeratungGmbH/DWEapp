"use client";

import { useState, useEffect } from "react";
import { AuthenticatedTemplate } from "@azure/msal-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Mail, 
  Calendar, 
  Clock, 
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  totalHours: number;
  currentTasks: number;
  completedTasks: number;
}

function TeamContent() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      // Mock data - would fetch from Azure AD or WeClapp
      const mockTeam: TeamMember[] = [
        {
          id: "1",
          name: "Max Mustermann",
          email: "max.mustermann@dwe-beratung.de",
          department: "Entwicklung",
          position: "Senior Entwickler",
          isActive: true,
          lastLogin: new Date().toISOString(),
          totalHours: 156.5,
          currentTasks: 8,
          completedTasks: 42,
        },
        {
          id: "2",
          name: "Sarah Schmidt",
          email: "sarah.schmidt@dwe-beratung.de",
          department: "Projektmanagement",
          position: "Projektmanagerin",
          isActive: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          totalHours: 142.0,
          currentTasks: 12,
          completedTasks: 38,
        },
        {
          id: "3",
          name: "Thomas Weber",
          email: "thomas.weber@dwe-beratung.de",
          department: "Design",
          position: "UI/UX Designer",
          isActive: false,
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          totalHours: 98.5,
          currentTasks: 3,
          completedTasks: 25,
        },
        {
          id: "4",
          name: "Lisa Meyer",
          email: "lisa.meyer@dwe-beratung.de",
          department: "Entwicklung",
          position: "Frontend Entwicklerin",
          isActive: true,
          lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          totalHours: 134.0,
          currentTasks: 6,
          completedTasks: 31,
        },
      ];
      
      setTeamMembers(mockTeam);
    } catch (error) {
      console.error("Failed to load team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
      case "entwicklung": return "bg-blue-500";
      case "projektmanagement": return "bg-green-500";
      case "design": return "bg-purple-500";
      case "marketing": return "bg-orange-500";
      case "vertrieb": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return "Nie";
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffInHours = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "Gerade eben";
    if (diffInHours < 24) return `Vor ${Math.floor(diffInHours)}h`;
    if (diffInHours < 48) return "Gestern";
    return loginDate.toLocaleDateString("de-DE");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Team wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">Übersicht aller Teammitglieder und deren Aktivitäten</p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Mitglied einladen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teammitglieder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {teamMembers.filter(m => m.isActive).length} aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Aufgaben</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.reduce((sum, member) => sum + member.currentTasks, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gesamt über alle Mitglieder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtstunden</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(teamMembers.reduce((sum, member) => sum + member.totalHours, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Diese Woche
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produktivität</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +5% gegenüber letzter Woche
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Teammitglieder suchen..."
            className="pl-10 pr-4 py-2 w-full border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`h-12 w-12 rounded-full ${getDepartmentColor(member.department)} flex items-center justify-center text-white font-semibold`}>
                    {getInitials(member.name)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.position}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getDepartmentColor(member.department)}>
                        {member.department}
                      </Badge>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Letzter Login: {formatLastLogin(member.lastLogin)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Gesamtstunden: {formatHours(member.totalHours)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Aktive Aufgaben: </span>
                    <span className="font-medium">{member.currentTasks}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Erledigt: </span>
                    <span className="font-medium">{member.completedTasks}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Erfolgsquote: </span>
                    <span className="font-medium">
                      {Math.round((member.completedTasks / (member.completedTasks + member.currentTasks)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  Profil ansehen
                </Button>
                <Button variant="outline" size="sm">
                  Aufgaben zuweisen
                </Button>
                <Button variant="outline" size="sm">
                  Nachricht senden
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <div className="text-muted-foreground">
            {searchTerm ? "Keine Teammitglieder gefunden" : "Keine Teammitglieder vorhanden"}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <AuthenticatedTemplate>
      <TeamContent />
    </AuthenticatedTemplate>
  );
}
