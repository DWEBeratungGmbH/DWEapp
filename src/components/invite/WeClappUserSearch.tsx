// WeClapp Benutzer-Suche Komponente

'use client'

import { Search, User, Loader2, Link } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WeClappUserInvite } from '@/hooks/useInviteDialog'

interface WeClappUserSearchProps {
  searchValue: string
  onSearchChange: (value: string) => void
  users: WeClappUserInvite[]
  allUsersCount: number
  loading: boolean
  selectedUser: WeClappUserInvite | null
  onSelectUser: (user: WeClappUserInvite) => void
  hasSearchedOnce: boolean
}

export function WeClappUserSearch({
  searchValue,
  onSearchChange,
  users,
  allUsersCount,
  loading,
  selectedUser,
  onSelectUser,
  hasSearchedOnce
}: WeClappUserSearchProps) {
  return (
    <div>
      <Label>WeClapp Benutzer auswählen</Label>
      
      {/* Suchfeld */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
        <Input
          type="text"
          placeholder="Mindestens 1 Buchstabe eingeben..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Suchergebnisse */}
      <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg">
        {searchValue.trim().length < 1 ? (
          <EmptyState message="Bitte mindestens 1 Buchstabe eingeben..." />
        ) : loading ? (
          <LoadingState />
        ) : users.length > 0 ? (
          <UserList
            users={users}
            allUsersCount={allUsersCount}
            selectedUser={selectedUser}
            onSelectUser={onSelectUser}
            hasSearchedOnce={hasSearchedOnce}
          />
        ) : hasSearchedOnce ? (
          <EmptyState message={`Keine Treffer für "${searchValue}"`} subtitle="Versuche einen anderen Buchstaben" />
        ) : (
          <EmptyState message="Keine aktiven Benutzer gefunden" />
        )}
      </div>

      {/* Ausgewählter Benutzer */}
      {selectedUser && <SelectedUserCard user={selectedUser} />}
    </div>
  )
}

// Sub-Komponenten
function EmptyState({ message, subtitle }: { message: string; subtitle?: string }) {
  return (
    <div className="p-8 text-center text-muted">
      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
      {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-muted" />
      <span className="ml-2 text-muted">Lade WeClapp Benutzer...</span>
    </div>
  )
}

function UserList({
  users,
  allUsersCount,
  selectedUser,
  onSelectUser,
  hasSearchedOnce
}: {
  users: WeClappUserInvite[]
  allUsersCount: number
  selectedUser: WeClappUserInvite | null
  onSelectUser: (user: WeClappUserInvite) => void
  hasSearchedOnce: boolean
}) {
  return (
    <>
      {hasSearchedOnce && (
        <div className="px-3 py-2 text-xs text-muted border-b">
          {allUsersCount} aktive Benutzer gefunden
        </div>
      )}
      {users.map((user) => (
        <div
          key={user.id}
          className={`p-3 cursor-pointer transition-colors border-b last:border-b-0 ${
            selectedUser?.id === user.id
              ? 'bg-accent-muted'
              : 'hover:bg-muted'
          }`}
          onClick={() => onSelectUser(user)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted">{user.email}</p>
              <p className="text-xs text-muted">@{user.username}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs px-2 py-1 rounded bg-accent-muted text-accent">
                Aktiv
              </span>
              {selectedUser?.id === user.id && (
                <div className="w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

function SelectedUserCard({ user }: { user: WeClappUserInvite }) {
  return (
    <div className="mt-4 bg-accent-muted border border-accent rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Link className="h-4 w-4 text-accent" />
        <h4 className="font-medium text-accent">Ausgewählter WeClapp Benutzer</h4>
      </div>
      <div className="text-sm">
        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>E-Mail:</strong> {user.email}</p>
        <p className="text-xs mt-1 text-muted">Daten werden direkt übernommen und mit WeClapp verbunden.</p>
      </div>
    </div>
  )
}
