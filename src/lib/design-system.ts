// Design-System v2.1 - Minimales Farbschema
// Basiert auf CSS-Variablen aus design-system.css
// 
// FARBPALETTE (8 + 3 = 11 Farben pro Modus):
// - Primär (3): --primary, --secondary, --muted
// - Sekundär (2): --bg-primary, --bg-secondary, --bg-tertiary
// - Akzent (3): --accent, --accent-hover, --accent-muted
// - Zusätzlich (3): --warning, --error, --info

// Farben für Logo und Branding
export const logoColors = {
  primary: 'var(--info)',       // Teal
  secondary: 'var(--warning)',  // Orange
  accent: 'var(--accent)',      // Grün
  dark: 'var(--primary)',
  light: 'var(--bg-primary)',
  success: 'var(--accent)',
  warning: 'var(--warning)',
  danger: 'var(--error)'
}

// Rollen-Farben
export const getRoleColor = (role: string) => {
  switch (role.toUpperCase()) {
    case 'ADMIN': return 'var(--info)'
    case 'MANAGER': return 'var(--warning)'
    default: return 'var(--primary)'
  }
}

// Status-Farben
export const getStatusColor = (status: string, isActive: boolean = true) => {
  if (status === 'invited') return 'var(--warning)'
  return isActive ? 'var(--accent)' : 'var(--muted)'
}

// CSS-Klassen für konsistente Anwendung
export const colorClasses = {
  primary: 'text-info',
  secondary: 'text-warning',
  accent: 'text-accent',
  dark: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-error',
  light: 'bg-card'
}

// Hover-States
export const hoverClasses = {
  primary: 'hover:bg-hover',
  secondary: 'hover:bg-hover',
  accent: 'hover:bg-hover',
  danger: 'hover:bg-hover'
}

// CSS-Style Helpers
export const getCSSStyle = (color: string) => ({ color: `var(--${color})` })
export const getBorderStyle = (color: string) => ({ borderColor: `var(--${color})` })
export const getBackgroundStyle = (color: string) => ({ backgroundColor: `var(--${color})` })

// Komponenten-Styles
export const componentStyles = {
  badge: {
    primary: { color: 'var(--info)', borderColor: 'var(--info)' },
    secondary: { color: 'var(--warning)', borderColor: 'var(--warning)' },
    accent: { color: 'var(--accent)', borderColor: 'var(--accent)' },
    success: { color: 'var(--accent)', borderColor: 'var(--accent)' },
    warning: { color: 'var(--warning)', borderColor: 'var(--warning)' },
    danger: { color: 'var(--error)', borderColor: 'var(--error)' }
  },
  button: {
    primary: { 
      backgroundColor: 'var(--accent)',
      color: '#1F2121',
      transition: 'all var(--transition)'
    },
    secondary: { 
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--primary)',
      transition: 'all var(--transition)'
    }
  },
  heading: {
    primary: { color: 'var(--primary)' },
    secondary: { color: 'var(--secondary)' }
  }
}
