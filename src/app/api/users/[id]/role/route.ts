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
    const { role } = await request.json()

    if (!role) {
      return NextResponse.json({ error: 'Rolle ist erforderlich' }, { status: 400 })
    }

    const user = await (prisma as any).user.update({
      where: { id: userId },
      data: { role }
    })

    console.log(`Benutzerrolle aktualisiert: ${user.email} -> ${role}`)

    return NextResponse.json({ 
      success: true,
      message: 'Rolle erfolgreich aktualisiert',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })
  } catch (error: any) {
    console.error('Fehler beim Aktualisieren der Rolle:', error)
    return NextResponse.json(
      { error: 'Rolle konnte nicht aktualisiert werden' },
      { status: 500 }
    )
  }
}
