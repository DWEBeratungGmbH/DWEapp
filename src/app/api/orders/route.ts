import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
      return NextResponse.json(
        { error: 'WeClapp API configuration missing' },
        { status: 500 }
      )
    }

    // Mock-Daten als Fallback
    const mockOrders = [
      {
        id: '1007',
        orderNumber: 'A-2024-1007',
        orderDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 Tage alt
        status: 'ORDER_ENTRY_IN_PROGRESS',
        customerId: 'CUST-001',
        customerNumber: '100001',
        netAmount: '2500.00',
        grossAmount: '2975.00',
        recordCurrencyName: 'EUR',
        description: 'Webentwicklung Projekt',
        invoiceAddress: {
          firstName: 'Max',
          lastName: 'Mustermann',
          street1: 'Musterstraße 1',
          city: 'Berlin',
          zipcode: '10115',
          countryCode: 'DE'
        },
        orderItems: [
          {
            id: 'ITEM-001',
            title: 'Webdesign',
            quantity: '1',
            unitPrice: '1500.00',
            articleNumber: 'WD-001'
          },
          {
            id: 'ITEM-002', 
            title: 'Entwicklung',
            quantity: '40',
            unitPrice: '25.00',
            articleNumber: 'DEV-001'
          }
        ]
      },
      {
        id: '1008',
        orderNumber: 'A-2024-1008',
        orderDate: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 Tage alt
        status: 'ORDER_CONFIRMATION_PRINTED',
        customerId: 'CUST-002',
        customerNumber: '100002',
        netAmount: '1200.00',
        grossAmount: '1428.00',
        recordCurrencyName: 'EUR',
        description: 'Mobile App Beratung',
        invoiceAddress: {
          firstName: 'Erika',
          lastName: 'Musterfrau',
          street1: 'Beispielweg 2',
          city: 'Hamburg',
          zipcode: '20095',
          countryCode: 'DE'
        },
        orderItems: [
          {
            id: 'ITEM-003',
            title: 'Beratung',
            quantity: '10',
            unitPrice: '120.00',
            articleNumber: 'BER-001'
          }
        ]
      },
      {
        id: '1009',
        orderNumber: 'A-2024-1009',
        orderDate: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 Tag alt
        status: 'INVOICED',
        customerId: 'CUST-003',
        customerNumber: '100003',
        netAmount: '3500.00',
        grossAmount: '4165.00',
        recordCurrencyName: 'EUR',
        description: 'SEO Optimierung',
        invoiceAddress: {
          firstName: 'Hans',
          lastName: 'Testmann',
          street1: 'Teststraße 3',
          city: 'München',
          zipcode: '80331',
          countryCode: 'DE'
        },
        orderItems: [
          {
            id: 'ITEM-004',
            title: 'SEO Analyse',
            quantity: '1',
            unitPrice: '1000.00',
            articleNumber: 'SEO-001'
          },
          {
            id: 'ITEM-005',
            title: 'Umsetzung',
            quantity: '25',
            unitPrice: '100.00',
            articleNumber: 'SEO-002'
          }
        ]
      }
    ]

    // Versuche zuerst die WeClapp API
    try {
      const response = await fetch(`${WECLAPP_API_URL}/salesorder`, {
        headers: {
          'AuthenticationToken': WECLAPP_API_KEY,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        let orders = data.result || []

        // Nach Rolle filtern
        if (userId && userRole) {
          if (userRole === 'employee') {
            orders = orders.filter((order: any) => 
              order.projectMembers?.some((member: any) => 
                member.userId === userId
              )
            )
          } else if (userRole === 'manager' || userRole === 'project_manager') {
            orders = orders.filter((order: any) => 
              order.status !== 'completed' && 
              order.status !== 'closed'
            )
          }
          // Admin sieht alle
        }

        return NextResponse.json({
          success: true,
          orders: orders,
          total: orders.length
        })
      }
    } catch (apiError) {
      console.log('WeClapp API nicht erreichbar, verwende Mock-Daten')
    }

    // Fallback zu Mock-Daten
    console.log(`Sende ${mockOrders.length} Mock-Aufträge`)
    let filteredMockOrders = mockOrders

    // Nach Rolle filtern
    if (userId && userRole) {
      if (userRole === 'employee') {
        filteredMockOrders = filteredMockOrders.filter((order: any) => 
          order.projectMembers?.some((member: any) => 
            member.userId === userId
          )
        )
      } else if (userRole === 'manager' || userRole === 'project_manager') {
        filteredMockOrders = filteredMockOrders.filter((order: any) => 
          order.status !== 'completed' && 
          order.status !== 'closed'
        )
      }
      // Admin sieht alle
    }

    return NextResponse.json({
      success: true,
      orders: filteredMockOrders,
      total: filteredMockOrders.length
    })

  } catch (error: any) {
    console.error('Orders API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
