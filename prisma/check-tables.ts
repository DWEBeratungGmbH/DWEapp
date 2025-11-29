import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTables() {
  try {
    console.log('🔍 Prüfe exakte Spaltennamen...')
    
    // Prüfe roles Tabelle Struktur mit exakten Namen
    const rolesColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'roles'
      ORDER BY ordinal_position
    ` as any[]
    
    console.log('📋 roles Tabelle Spalten (exakt):')
    rolesColumns.forEach(col => {
      console.log(`  - "${col.column_name}": ${col.data_type}`)
    })
    
    // Prüfe role_permissions Tabelle
    const permColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'role_permissions'
      ORDER BY ordinal_position
    ` as any[]
    
    console.log('📋 role_permissions Tabelle Spalten (exakt):')
    permColumns.forEach(col => {
      console.log(`  - "${col.column_name}": ${col.data_type}`)
    })
    
    // Prüfe role_data_scopes Tabelle
    const scopeColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'role_data_scopes'
      ORDER BY ordinal_position
    ` as any[]
    
    console.log('📋 role_data_scopes Tabelle Spalten (exakt):')
    scopeColumns.forEach(col => {
      console.log(`  - "${col.column_name}": ${col.data_type}`)
    })
    
  } catch (error) {
    console.error('❌ Fehler:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTables()
