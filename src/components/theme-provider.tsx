'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Theme beim Initialisieren laden
    const initializeTheme = () => {
      const savedDarkMode = localStorage.getItem('dweapp-dark-mode') === 'true'
      
      // HTML data-theme Attribut setzen für CSS-Selektoren
      if (savedDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
      
      console.log(`Theme initialized: ${savedDarkMode ? 'Dark' : 'Light'} Mode`)
    }
    
    // Sofort ausführen
    initializeTheme()
    
    // Auch nach DOM-Laden ausführen (für Sicherheit)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeTheme)
    }
  }, [])

  return <>{children}</>
}

export default ThemeProvider
