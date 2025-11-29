'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Theme beim Laden prüfen
    const savedDarkMode = localStorage.getItem('dweapp-dark-mode') === 'true'
    setIsDarkMode(savedDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    
    // Theme speichern
    localStorage.setItem('dweapp-dark-mode', newDarkMode.toString())
    
    // HTML Attribut setzen
    if (newDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    
    console.log(`Theme switched to: ${newDarkMode ? 'Dark' : 'Light'} Mode`)
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="icon-button"
      title={isDarkMode ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'}
    >
      {isDarkMode ? <Sun /> : <Moon />}
    </button>
  )
}

export default DarkModeToggle
