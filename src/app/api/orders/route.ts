import { NextRequest, NextResponse } from 'next/server';
import { weclappService } from '@/lib/weclapp';
import axios from 'axios'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    // Return mock data if API is not configured
    if (!WECLAPP_API_URL || !WECLAPP_API_KEY || WECLAPP_API_URL.includes('mock') || WECLAPP_API_KEY.includes('mock')) {
      console.log('Using mock data - WeClapp API not configured')
      
      const mockOrders = [
        {
          id: '1007',
          orderNumber: 'A-2024-1007',
          orderDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
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
        }
      ]

      let filteredOrders = mockOrders

      // Nach Rolle filtern
      if (userId && userRole) {
        if (userRole === 'employee') {
          filteredOrders = filteredOrders.filter((order: any) => 
            order.projectMembers?.some((member: any) => 
              member.userId === userId
            )
          )
        } else if (userRole === 'manager' || userRole === 'project_manager') {
          filteredOrders = filteredOrders.filter((order: any) => 
            order.status !== 'completed' && 
            order.status !== 'closed'
          )
        }
        // Admin sieht alle
      }

      return NextResponse.json({
        success: true,
        orders: filteredOrders,
        total: filteredOrders.length
      })
    }

    // WeClapp API v2 - Aufträge abrufen
    try {
      const response = await axios.get(`${WECLAPP_API_URL}/salesOrder`, {
        headers: {
          'AuthenticationToken': WECLAPP_API_KEY,
          'Content-Type': 'application/json',
        }
      })

      let orders = response.data.result || []

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

    } catch (apiError: any) {
      console.log('WeClapp API nicht erreichbar, verwende Mock-Daten')
      return NextResponse.json({
        success: true,
        orders: [],
        total: 0,
        message: 'API nicht erreichbar'
      })
    }

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
