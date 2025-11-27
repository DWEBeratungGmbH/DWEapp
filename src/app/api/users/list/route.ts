import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Hole alle User
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Hole alle offenen Einladungen
    const invitations = await prisma.invitation.findMany({
      where: { isUsed: false },
      include: { invitedBy: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      users, 
      invitations 
    })
  } catch (error: any) {
    console.error('Error fetching local users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    )
  }
}
