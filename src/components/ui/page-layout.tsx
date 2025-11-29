'use client'

import { ReactNode } from 'react'

/* ==========================================================================
   PageLayout - Wiederverwendbares Seitenlayout
   ========================================================================== */

interface PageLayoutProps {
  children: ReactNode
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode // Für Aktions-Buttons
  badges?: ReactNode   // Für Status-Badges
}

interface PageContentProps {
  children: ReactNode
  className?: string
}

/* Haupt-Container für Seiteninhalte */
export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="space-y-6 p-6">
      {children}
    </div>
  )
}

/* Seitenkopf mit Titel, Untertitel und Aktionen */
export function PageHeader({ title, subtitle, children, badges }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {badges && <div className="flex gap-2 mt-2">{badges}</div>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  )
}

/* Grid für KPI-Karten (4 Spalten) */
export function KPIGrid({ children }: { children: ReactNode }) {
  return (
    <div className="content-grid-4">
      {children}
    </div>
  )
}

/* Grid für Content-Karten */
export function ContentGrid({ children, columns = 2 }: { children: ReactNode; columns?: 2 | 3 | 4 }) {
  const gridClass = columns === 4 ? 'content-grid-4' : columns === 3 ? 'content-grid-3' : 'content-grid-2'
  return (
    <div className={gridClass}>
      {children}
    </div>
  )
}

/* Seiten-Content Container */
export function PageContent({ children, className = '' }: PageContentProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  )
}

/* Card Komponente */
interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'kpi'
  span?: 1 | 2 | 3 | 4 | 'full'
}

export function Card({ children, className = '', variant = 'default', span }: CardProps) {
  const spanClass = span === 'full' ? 'span-full' : span ? `span-${span}` : ''
  const variantClass = variant === 'kpi' ? 'card card-kpi' : 'card'
  
  return (
    <div className={`${variantClass} ${spanClass} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, title, subtitle }: { children?: ReactNode; title?: string; subtitle?: string }) {
  return (
    <div className="card-header">
      {title && <h2 className="card-title">{title}</h2>}
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      {children}
    </div>
  )
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`card-content ${className}`}>
      {children}
    </div>
  )
}

/* KPI Werte */
export function KPIValue({ value, label, trend, trendType = 'neutral' }: { 
  value: string | number
  label: string
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
}) {
  return (
    <>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {trend && <div className={`kpi-trend ${trendType}`}>{trend}</div>}
    </>
  )
}

/* ==========================================================================
   KPICard - Zentrale KPI-Karten Komponente
   ========================================================================== */
interface KPICardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  description?: string
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  color?: 'accent' | 'info' | 'warning' | 'error' | 'default'
}

export function KPICard({ icon, label, value, description, trend, trendType = 'neutral', color = 'default' }: KPICardProps) {
  const getColorStyle = (colorType: string) => {
    switch (colorType) {
      case 'accent': return { color: 'var(--accent)' }
      case 'info': return { color: 'var(--info)' }
      case 'warning': return { color: 'var(--warning)' }
      case 'error': return { color: 'var(--error)' }
      default: return { color: 'var(--primary)' }
    }
  }

  const getTrendStyle = (type: string) => {
    switch (type) {
      case 'positive': return { color: 'var(--accent)' }
      case 'negative': return { color: 'var(--error)' }
      default: return { color: 'var(--muted)' }
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <span style={getColorStyle(color)}>
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold" style={getColorStyle(color)}>{value}</div>
      {description && <p className="text-sm font-medium mt-1">{description}</p>}
      {trend && <p className="text-xs mt-1" style={getTrendStyle(trendType)}>{trend}</p>}
    </div>
  )
}

/* List Komponenten */
export function List({ children }: { children: ReactNode }) {
  return <div className="list">{children}</div>
}

export function ListItem({ children, title, subtitle, action }: { 
  children?: ReactNode
  title?: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="list-item">
      <div className="list-item-content">
        {title && <div className="list-item-title">{title}</div>}
        {subtitle && <div className="list-item-subtitle">{subtitle}</div>}
        {children}
      </div>
      {action}
    </div>
  )
}
