import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Typ für einen Task von der WeClapp API
interface WeClappTask {
  id: string
  name: string
  status: string
  priority: string
  dueDate?: number
  assignedUser?: string
  description?: string
  orderId?: string
  salesOrderId?: string
  orderNumber?: string
  order?: any
  createdDate?: number
  [key: string]: any // Für alle anderen Felder
}

// Typ für Auftragsinformationen
interface OrderInfo {
  id: string
  orderNumber: string
  status: string
  customerNumber: string
  invoiceAddress?: {
    firstName?: string
    lastName?: string
    city?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API-Konfiguration fehlt' },
        { status: 500 }
      )
    }

    // Hole Benutzerrolle und ID aus Query-Parametern (in einer echten App aus Session/Auth)
    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('userRole') || 'employee'
    const userId = searchParams.get('userId')

    console.log(`Rufe Tasks ab für Rolle: ${userRole}, User: ${userId}`)

    // WeClapp API Endpunkt für alle Tasks
    const tasksResponse = await axios.get(`${apiUrl}/task`, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    const allTasks: WeClappTask[] = tasksResponse.data.result || []
    console.log(`Gefunden: ${allTasks.length} Tasks insgesamt`)

    // Zeige einen Beispiel-Task, um die Struktur zu verstehen
    if (allTasks.length > 0) {
      console.log('Beispiel-Task Struktur:', JSON.stringify(allTasks[0], null, 2))
      
      // Zeige alle möglichen Felder, die Auftragsbezüge haben könnten
      const sampleTask = allTasks[0]
      const possibleOrderFields = Object.keys(sampleTask).filter(key => 
        key.toLowerCase().includes('order') || 
        key.toLowerCase().includes('sales') ||
        key.toLowerCase().includes('project')
      )
      console.log('Mögliche Auftragsfelder im Task:', possibleOrderFields)
    }

    // Verschiedene mögliche Felder für Auftragszuordnung prüfen
    const tasksWithOrders = allTasks.filter((task: WeClappTask) => 
      task.orderId || 
      task.salesOrderId || 
      task.orderNumber ||
      task.order ||
      task.salesOrder ||
      task.projectId ||
      task.project
    )
    console.log(`Tasks mit Aufträgen (verschiedene Felder): ${tasksWithOrders.length}`)

    // Erstelle Task→Auftrag Mapping über orderItemId→orderItem→Auftrag
    const taskToOrderMap = new Map<string, OrderInfo>()
    
    try {
      console.log('Erstelle Task→Auftrag Verbindung über orderItemId...')
      
      // Lade alle Aufträge mit ihren OrderItems
      const ordersResponse = await axios.get(`${apiUrl}/salesOrder`, {
        headers: {
          'AuthenticationToken': apiKey,
          'Content-Type': 'application/json',
        },
      })
      
      const orders = ordersResponse.data.result || []
      console.log(`Gefunden: ${orders.length} Aufträge für Task-Zuordnung`)
      
      // Baue orderItemId→Auftrag Mapping auf
      orders.forEach((order: any) => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach((orderItem: any) => {
            const orderItemId = orderItem.id
            if (orderItemId) {
              taskToOrderMap.set(orderItemId, {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                customerNumber: order.customerNumber,
                invoiceAddress: order.invoiceAddress
              })
            }
          })
        }
      })
      
      console.log(`orderItemId→Auftrag Mapping erstellt: ${taskToOrderMap.size} OrderItems zugeordnet`)
      
      // Zeige Beispiel für Debug
      if (taskToOrderMap.size > 0) {
        const firstOrderItemId = taskToOrderMap.keys().next().value
        console.log('Beispiel orderItemId→Auftrag Zuordnung:', {
          orderItemId: firstOrderItemId,
          orderInfo: taskToOrderMap.get(firstOrderItemId)
        })
      }
      
    } catch (orderError: any) {
      console.warn('Konnte Aufträge für Task-Zuordnung nicht laden:', orderError.response?.status)
    }

    // Bereichere alle Tasks mit Auftragsinformationen (wenn verfügbar)
    const enrichedTasks = allTasks.map((task: WeClappTask) => ({
      ...task,
      orderInfo: task.orderItemId ? taskToOrderMap.get(task.orderItemId) : null
    }))

    // Filtere nur Tasks mit Auftragszuordnung
    const tasksWithOrderInfo = enrichedTasks.filter(task => task.orderInfo)
    console.log(`${tasksWithOrderInfo.length} von ${enrichedTasks.length} Tasks haben Auftragszuordnung`)

    // Wenn keine Tasks mit Aufträgen gefunden, zeige alle Tasks
    const finalTasks = tasksWithOrderInfo.length > 0 ? tasksWithOrderInfo : enrichedTasks

    // Rollenbasierte Filterung
    let filteredTasks = finalTasks
    
    if (userRole === 'employee' && userId) {
      // Mitarbeiter sehen nur ihre zugewiesenen Tasks
      filteredTasks = finalTasks.filter(task => 
        task.assignedUser === userId
      )
      console.log(`Mitarbeiter-Filter: ${filteredTasks.length} von ${finalTasks.length} Tasks für User ${userId}`)
    } else if (userRole === 'manager' || userRole === 'admin') {
      // Manager und Admins sehen alle Tasks
      console.log(`Manager/Admin-Filter: Alle ${finalTasks.length} Tasks sichtbar`)
    }

    console.log(`Gib ${filteredTasks.length} Tasks mit Auftragsverbindung zurück`)
    return NextResponse.json({ result: filteredTasks })
  } catch (error: any) {
    console.error('WeClapp Tasks API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Tasks',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}
