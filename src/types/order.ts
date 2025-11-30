// Auftrag-Typen

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerAddress?: string
  status: string
  totalAmount?: number
  createdDate: number
  lastModifiedDate?: number
}

export interface OrderItem {
  id: string
  orderId: string
  articleNumber?: string
  description?: string
  quantity?: number
  price?: number
}
