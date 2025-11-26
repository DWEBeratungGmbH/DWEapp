"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { Check, X, Users, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  name: string
  email: string
  firstName?: string
  lastName?: string
  department?: string
  position?: string
  active?: boolean
}

interface MultiSelectDropdownProps {
  selectedUsers: string[]
  onSelectionChange: (selectedUserIds: string[]) => void
  placeholder?: string
  className?: string
}

export default function MultiSelectDropdown({ 
  selectedUsers, 
  onSelectionChange, 
  placeholder = "Benutzer auswählen...",
  className = ""
}: MultiSelectDropdownProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Benutzer von API laden
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        
        if (data.result) {
          setUsers(data.result.filter((user: User) => user.active !== false))
        } else if (data.users) {
          setUsers(data.users.filter((user: User) => user.active !== false))
        }
      } catch (error) {
        console.error('Fehler beim Laden der Benutzer:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Gefilterte Benutzer basierend auf Suchbegriff
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Toggle user selection
  const toggleUser = useCallback((userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId]
    
    onSelectionChange(newSelection)
  }, [selectedUsers, onSelectionChange])

  // Alle auswählen/abwählen
  const toggleAll = useCallback(() => {
    if (selectedUsers.length === filteredUsers.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredUsers.map(user => user.id))
    }
  }, [selectedUsers, filteredUsers, onSelectionChange])

  // Ausgewählte Benutzer anzeigen
  const selectedUserNames = users
    .filter(user => selectedUsers.includes(user.id))
    .map(user => user.name)
    .join(', ')

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between text-left font-normal"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="truncate">
            {selectedUsers.length > 0 
              ? `${selectedUsers.length} ausgewählt: ${selectedUserNames}`
              : placeholder
            }
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Benutzer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Select All Option */}
          <div className="p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleAll()
              }}
              className="w-full justify-start"
            >
              {selectedUsers.length === filteredUsers.length ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Alle abwählen
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Alle auswählen
                </>
              )}
            </Button>
          </div>

          {/* User List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Benutzer werden geladen...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchTerm ? 'Keine Benutzer gefunden' : 'Keine Benutzer verfügbar'}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 transition-colors ${
                    selectedUsers.includes(user.id) ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => toggleUser(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      {user.department && (
                        <div className="text-xs text-muted-foreground">{user.department}</div>
                      )}
                    </div>
                    <div className="ml-2">
                      {selectedUsers.includes(user.id) ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4 border border-muted-foreground rounded" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t bg-accent/30">
            <div className="text-xs text-muted-foreground text-center">
              {selectedUsers.length} von {filteredUsers.length} ausgewählt
            </div>
          </div>
        </div>
      )}

      {/* Close overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
