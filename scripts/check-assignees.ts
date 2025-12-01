import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Hole einige Tasks und prüfe Assignees
  const tasks = await prisma.weClappTask.findMany({
    select: {
      id: true,
      subject: true,
      assignees: true
    },
    take: 20
  })
  
  const withAssignees = tasks.filter(t => t.assignees !== null && Array.isArray(t.assignees) && (t.assignees as any[]).length > 0)
  const withoutAssignees = tasks.filter(t => t.assignees === null || !Array.isArray(t.assignees) || (t.assignees as any[]).length === 0)
  
  console.log(`\nVon ${tasks.length} geprüften Tasks:`)
  console.log(`  Mit Assignees: ${withAssignees.length}`)
  console.log(`  Ohne Assignees: ${withoutAssignees.length}`)
  
  if (withAssignees.length > 0) {
    console.log('\nBeispiel-Assignees:')
    withAssignees.slice(0, 3).forEach(t => {
      console.log(`\nTask ${t.id}: ${t.subject}`)
      console.log('  Assignees:', JSON.stringify(t.assignees, null, 2))
    })
  } else {
    console.log('\n⚠️  KEINE Assignees in der Datenbank gefunden!')
    console.log('Die Sync-Funktion speichert die Assignees möglicherweise nicht.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
