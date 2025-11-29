import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: userId } = await params

    const user = await (prisma as any).user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    const updatedUser = await (prisma as any).user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    })

    console.log(`Benutzerstatus aktualisiert: ${updatedUser.email} -> ${updatedUser.isActive ? 'Aktiv' : 'Inaktiv'}`)

    return NextResponse.json({ 
      success: true,
      message: 'Status erfolgreich aktualisiert',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.isActive
      }
    })
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren des Status:', error)
    return NextResponse.json(
      { error: 'Status konnte nicht aktualisiert werden' },
      { status: 500 }
    )
  }
}
