// User Matching Service
export interface WeClappUser {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  department?: string
  position?: string
  active: boolean
}

export interface AppUser {
  id: string
  email: string
  name: string
  role: 'employee' | 'manager' | 'admin' | 'project_manager'
  weClappUserId?: string
  department?: string
}

export interface UserMatch {
  appUser: AppUser
  weClappUser: WeClappUser
  matchQuality: 'exact' | 'partial' | 'none'
}

// Nutzer über E-Mail-Adresse matching
export function matchUsersByEmail(appUsers: AppUser[], weClappUsers: WeClappUser[]): UserMatch[] {
  const matches: UserMatch[] = []
  
  for (const appUser of appUsers) {
    for (const weClappUser of weClappUsers) {
      const appEmail = appUser.email.toLowerCase().trim()
      const weClappEmail = weClappUser.email.toLowerCase().trim()
      
      if (appEmail === weClappEmail) {
        // Exakter Match
        matches.push({
          appUser,
          weClappUser,
          matchQuality: 'exact'
        })
        break
      } else if (appEmail.includes(weClappEmail) || weClappEmail.includes(appEmail)) {
        // Partieller Match
        matches.push({
          appUser,
          weClappUser,
          matchQuality: 'partial'
        })
      }
    }
  }
  
  return matches
}

// Rolle basierend auf Position/Department bestimmen
export function determineUserRole(position?: string, department?: string): 'employee' | 'manager' | 'admin' | 'project_manager' {
  const pos = (position || '').toLowerCase()
  const dept = (department || '').toLowerCase()
  
  // Admin Keywords
  if (pos.includes('ceo') || pos.includes('geschäftsführer') || pos.includes('director') || dept.includes('leitung')) {
    return 'admin'
  }
  
  // Manager Keywords
  if (pos.includes('manager') || pos.includes('leiter') || pos.includes('head') || dept.includes('management')) {
    return 'manager'
  }
  
  // Project Manager Keywords
  if (pos.includes('project') || pos.includes('projekt') || pos.includes('projektleiter')) {
    return 'project_manager'
  }
  
  // Default: Employee
  return 'employee'
}

// App User mit WeClapp Daten anreichern
export function enrichAppUsers(appUsers: AppUser[], weClappUsers: WeClappUser[]): AppUser[] {
  const matches = matchUsersByEmail(appUsers, weClappUsers)
  
  return appUsers.map(appUser => {
    const match = matches.find(m => m.appUser.id === appUser.id)
    
    if (match && match.matchQuality === 'exact') {
      return {
        ...appUser,
        weClappUserId: match.weClappUser.id,
        department: match.weClappUser.department,
        // Rolle überschreiben falls aus WeClapp ableitbar
        role: appUser.role === 'employee' ? determineUserRole(match.weClappUser.position, match.weClappUser.department) : appUser.role
      }
    }
    
    return appUser
  })
}
