import { NextRequest, NextResponse } from 'next/server'

// Temporarily set admin role for logged-in user
export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json()
    
    // This is a temporary fix - in production this should come from the database
    if (email === 'sebastian@dwe-beratung.de') {
      console.log(`🔧 Temporarily setting role: ${role} for ${email}`)
      return NextResponse.json({
        success: true,
        message: `Role ${role} set for ${email}`,
        note: 'This is a temporary fix - database integration needed'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'User not found or not authorized'
    }, { status: 404 })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
