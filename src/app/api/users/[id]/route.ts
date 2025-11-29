import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Diese Route verwendet die DWEapp interne Benutzer-ID (nicht die WeClapp ID!)
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
    const { firstName, lastName, email, role, department, isActive, weClappUserId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Benutzer-ID ist erforderlich' }, { status: 400 })
    }

    // Prüfe ob Benutzer existiert
    const existingUser = await (prisma as any).user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // E-Mail-Änderung prüfen (nur erlauben wenn neue E-Mail nicht existiert)
    if (email && email !== existingUser.email) {
      const emailExists = await (prisma as any).user.findUnique({
        where: { email }
      })
      
      if (emailExists) {
        return NextResponse.json({ error: 'E-Mail wird bereits verwendet' }, { status: 409 })
      }
    }

    // Bereite Update-Daten vor
    const updateData: any = {
      firstName: firstName || null,
      lastName: lastName || null,
      name: firstName && lastName ? `${firstName} ${lastName}` : email?.split('@')[0] || existingUser.name,
      role: role || existingUser.role,
      department: department || null,
      isActive: isActive !== undefined ? isActive : existingUser.isActive,
      weClappUserId: weClappUserId || null
    }

    // E-Mail nur aktualisieren wenn angegeben und unterschiedlich
    if (email && email !== existingUser.email) {
      updateData.email = email
    }

    // Aktualisiere Benutzer
    const updatedUser = await (prisma as any).user.update({
      where: { id: userId },
      data: updateData
    })

    // Aktualisiere auch zugehörige Einladungen wenn nötig
    if (firstName || lastName || weClappUserId) {
      await (prisma as any).invitation.updateMany({
        where: { userId },
        data: {
          firstName: firstName || null,
          lastName: lastName || null,
          weClappUserId: weClappUserId || null
        }
      })
    }

    console.log(`Benutzer aktualisiert: ${updatedUser.email}`)

    return NextResponse.json({
      success: true,
      message: 'Benutzer erfolgreich aktualisiert',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: updatedUser.name,
        role: updatedUser.role,
        department: updatedUser.department,
        isActive: updatedUser.isActive,
        weClappUserId: updatedUser.weClappUserId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    })

  } catch (error: any) {
    console.error('Benutzer-Update-Fehler:', error)
    return NextResponse.json(
      { 
        error: 'Benutzer konnte nicht aktualisiert werden',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dweAppUserId } = await params

    if (!dweAppUserId) {
      return NextResponse.json(
        { error: 'DWEapp Benutzer-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Benutzer existiert
    const user = await (prisma as any).user.findUnique({
      where: { id: dweAppUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      )
    }

    // Lösche alle Einladungen des Benutzers
    await (prisma as any).invitation.deleteMany({
      where: { userId: dweAppUserId }
    })

    // Lösche alle Sessions des Benutzers
    await (prisma as any).session.deleteMany({
      where: { userId: dweAppUserId }
    })

    // Lösche alle Accounts des Benutzers
    await (prisma as any).account.deleteMany({
      where: { userId: dweAppUserId }
    })

    // Lösche den Benutzer
    await (prisma as any).user.delete({
      where: { id: dweAppUserId }
    })

    console.log(`Benutzer ${dweAppUserId} (${user.email}) wurde gelöscht`)

    return NextResponse.json({
      success: true,
      message: 'Benutzer erfolgreich gelöscht'
    })

  } catch (error: any) {
    console.error('Benutzer-Lösch-Fehler:', error)
    return NextResponse.json(
      { 
        error: 'Benutzer konnte nicht gelöscht werden',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
