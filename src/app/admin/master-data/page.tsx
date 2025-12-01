'use client'

import { useSession } from 'next-auth/react'
import { Building2, Users, Package, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function MasterDataPage() {
  const { data: session } = useSession()

  const masterDataItems = [
    { 
      title: 'Kunden', 
      count: 860, 
      icon: Building2, 
      href: '/parties?type=customer',
      description: 'Kunden und Organisationen verwalten'
    },
    { 
      title: 'Lieferanten', 
      count: 45, 
      icon: Building2, 
      href: '/parties?type=supplier',
      description: 'Lieferanten und Partner verwalten'
    },
    { 
      title: 'Mitarbeiter', 
      count: 19, 
      icon: Users, 
      href: '/admin',
      description: 'WeClapp Benutzer synchronisieren'
    },
    { 
      title: 'Artikel', 
      count: 0, 
      icon: Package, 
      href: '/admin/articles',
      description: 'Artikel und Dienstleistungen'
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Stammdaten</h1>
          <p className="page-subtitle">Zentrale Datenverwaltung</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Alle synchronisieren
          </button>
        </div>
      </div>

      {/* Master Data Grid */}
      <div className="content-grid-2">
        {masterDataItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.title} href={item.href} className="card hover:border-accent transition-colors">
              <div className="card-content">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent-muted">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="text-2xl font-bold text-accent">{item.count}</span>
                    </div>
                    <p className="text-sm text-muted">{item.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
