'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { Loader2, Users, CheckSquare, FileText, LogOut, Folder, TrendingUp, Target } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { PageLayout, PageHeader, ContentGrid, Card, CardHeader, KPICard, List, ListItem } from '@/components/ui/page-layout'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/'
    }
  }, [status])

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="mb-4">Nicht eingeloggt</p>
            <button onClick={() => window.location.href = '/'} className="btn btn-primary">
              Zum Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const userRole = session?.user?.role || 'USER'
  const isAdmin = userRole === 'ADMIN'

  return (
    <DashboardLayout>
      <PageLayout>
        {/* Page Header */}
        <PageHeader 
          title="Dashboard" 
          subtitle={`Willkommen zurück, ${session?.user?.name}!`}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            icon={<Folder className="h-4 w-4" />}
            label="Gesamtprojekte"
            value="12"
            description="Alle Projekte"
            trend="+2 diesen Monat"
            trendType="positive"
            color="info"
          />
          <KPICard
            icon={<CheckSquare className="h-4 w-4" />}
            label="Aktive Aufgaben"
            value="28"
            description="Aktuell bearbeitet"
            trend="5 fällig heute"
            trendType="neutral"
            color="warning"
          />
          <KPICard
            icon={<Users className="h-4 w-4" />}
            label="Team-Mitglieder"
            value="8"
            description="Gesamtteam"
            trend="Alle aktiv"
            trendType="positive"
            color="accent"
          />
          <KPICard
            icon={<Target className="h-4 w-4" />}
            label="Abschlussquote"
            value="94%"
            description="Erfolgsrate"
            trend="+3% vs. letztes Quartal"
            trendType="positive"
            color="accent"
          />
        </div>

        {/* Content Cards */}
        <ContentGrid columns={2}>
          {/* Aktuelle Projekte */}
          <Card>
            <CardHeader title="Aktuelle Projekte" subtitle="Letzte Projekt-Updates" />
            <List>
              <ListItem title="Website Redesign" subtitle="Fällig: 15. Dezember" action={<span className="badge badge-warning">In Bearbeitung</span>} />
              <ListItem title="Mobile App" subtitle="Fällig: 20. Dezember" action={<span className="badge badge-success">Planung</span>} />
              <ListItem title="Marketing Kampagne" subtitle="Fällig: 10. Dezember" action={<span className="badge">Aktiv</span>} />
            </List>
          </Card>

          {/* Anstehende Aufgaben */}
          <Card>
            <CardHeader title="Anstehende Aufgaben" subtitle="Heutige und bevorstehende Aufgaben" />
            <List>
              <ListItem title="Design Review" subtitle="Heute, 14:00" action={<span className="badge badge-error">Hoch</span>} />
              <ListItem title="Client Meeting" subtitle="Morgen, 10:00" action={<span className="badge badge-warning">Mittel</span>} />
              <ListItem title="Code Review" subtitle="Freitag, 16:00" action={<span className="badge badge-success">Niedrig</span>} />
            </List>
          </Card>
        </ContentGrid>

        {/* Schnellaktionen */}
        <Card span="full">
          <CardHeader title="Schnellaktionen" subtitle="Häufig verwendete Funktionen" />
          <div className="content-grid-4">
            {isAdmin && (
              <Link href="/admin">
                <button className="btn btn-primary w-full">
                  <Users className="h-4 w-4" />
                  Benutzerverwaltung
                </button>
              </Link>
            )}
            <button className="btn btn-secondary w-full">
              <FileText className="h-4 w-4" />
              Neues Projekt
            </button>
            <button className="btn btn-secondary w-full">
              <CheckSquare className="h-4 w-4" />
              Aufgabe erstellen
            </button>
            <button className="btn btn-secondary w-full" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </div>
        </Card>
      </PageLayout>
    </DashboardLayout>
  )
}
