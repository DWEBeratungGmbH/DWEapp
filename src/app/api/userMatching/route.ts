import { NextRequest, NextResponse } from 'next/server'
import { enrichAppUsers, determineUserRole } from '@/services/userMatchingService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeRoles = searchParams.get('includeRoles') === 'true'
    
    // Hole App-User (aus Azure AD / Session)
    // Für jetzt simulieren wir App-User
    const mockAppUsers = [
      {
        id: '1',
        email: 'sebastian@dwe-beratung.de',
        name: 'Sebastian Möhrer',
        role: 'admin' as const
      },
      {
        id: '2', 
        email: 'bastian.huber@dwe-beratung.de',
        name: 'Bastian Huber',
        role: 'employee' as const
      }
    ]
    
    // Hole WeClapp User
    const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
    
    if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
      return NextResponse.json(
        { error: 'WeClapp API configuration missing' },
        { status: 500 }
      )
    }
    
    const weClappResponse = await fetch(`${WECLAPP_API_URL}/user`, {
      headers: {
        'AuthenticationToken': WECLAPP_API_KEY,
        'Content-Type': 'application/json',
      },
    })
    
    if (!weClappResponse.ok) {
      throw new Error(`WeClapp API error: ${weClappResponse.status}`)
    }
    
    const weClappData = await weClappResponse.json()
    const weClappUsers = weClappData.result || []
    
    // User Matching durchführen
    const enrichedUsers = enrichAppUsers(mockAppUsers, weClappUsers)
    
    console.log(`User Matching: ${enrichedUsers.filter(u => u.weClappUserId).length} von ${enrichedUsers.length} User gematched`)
    
    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      total: enrichedUsers.length,
      matched: enrichedUsers.filter(u => u.weClappUserId).length,
      weClappUsers: weClappUsers.length
    })
    
  } catch (error: any) {
    console.error('User Matching API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to match users',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appUserId, weClappUserId, role } = body
    
    if (!appUserId || !weClappUserId) {
      return NextResponse.json(
        { error: 'appUserId und weClappUserId sind erforderlich' },
        { status: 400 }
      )
    }
    
    // Hier würde die Speicherung in einer Datenbank erfolgen
    // Für jetzt simulieren wir das Matching
    
    console.log(`Manual User Matching: App User ${appUserId} -> WeClapp User ${weClappUserId} als ${role || 'employee'}`)
    
    return NextResponse.json({
      success: true,
      message: 'User Matching erfolgreich gespeichert',
      matching: {
        appUserId,
        weClappUserId,
        role: role || 'employee',
        matchedAt: new Date().toISOString()
      }
    })
    
  } catch (error: any) {
    console.error('Manual User Matching Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save user matching',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
