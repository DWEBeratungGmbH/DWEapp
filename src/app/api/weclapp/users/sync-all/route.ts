// WeClapp Users Sync-All Route
// Holt alle aktiven User von WeClapp und speichert sie in der DB

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const apiKey = process.env.WECLAPP_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL || 'https://dwe.weclapp.com/webapp/api/v2'

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'WECLAPP_API_KEY nicht konfiguriert' 
      }, { status: 500 })
    }

    console.log('[WeClapp Sync] Starte User-Synchronisation...')

    // Alle aktiven User von WeClapp holen
    const response = await fetch(`${apiUrl}/user?status-eq=ACTIVE&pageSize=500`, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[WeClapp Sync] API Error:', response.status, errorText)
      return NextResponse.json({ 
        success: false, 
        error: `WeClapp API Fehler: ${response.status}` 
      }, { status: 500 })
    }

    const data = await response.json()
    const users = data.result || []

    console.log(`[WeClapp Sync] ${users.length} User von WeClapp erhalten`)

    // User in DB speichern/aktualisieren
    let created = 0
    let updated = 0

    for (const user of users) {
      try {
        await prisma.weClappUser.upsert({
          where: { id: user.id },
          update: {
            email: user.email || null,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            username: user.username || null,
            title: user.title || null,
            status: user.status || 'ACTIVE',
            phoneNumber: user.phoneNumber || null,
            mobilePhoneNumber: user.mobilePhoneNumber || null,
            createdDate: user.createdDate ? new Date(user.createdDate) : null,
            lastModifiedDate: user.lastModifiedDate ? new Date(user.lastModifiedDate) : null,
            lastSyncAt: new Date()
          },
          create: {
            id: user.id,
            email: user.email || null,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            username: user.username || null,
            title: user.title || null,
            status: user.status || 'ACTIVE',
            phoneNumber: user.phoneNumber || null,
            mobilePhoneNumber: user.mobilePhoneNumber || null,
            createdDate: user.createdDate ? new Date(user.createdDate) : null,
            lastModifiedDate: user.lastModifiedDate ? new Date(user.lastModifiedDate) : null,
            lastSyncAt: new Date()
          }
        })
        
        // Zaehlen ob created oder updated
        const existing = await prisma.weClappUser.findUnique({ where: { id: user.id } })
        if (existing?.lastSyncAt && existing.lastSyncAt < new Date(Date.now() - 1000)) {
          updated++
        } else {
          created++
        }
      } catch (err) {
        console.error(`[WeClapp Sync] Fehler bei User ${user.id}:`, err)
      }
    }

    console.log(`[WeClapp Sync] Fertig: ${created} erstellt, ${updated} aktualisiert`)

    return NextResponse.json({
      success: true,
      message: `${users.length} WeClapp User synchronisiert`,
      stats: {
        total: users.length,
        created,
        updated
      }
    })

  } catch (error: any) {
    console.error('[WeClapp Sync] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Sync fehlgeschlagen' 
    }, { status: 500 })
  }
}
