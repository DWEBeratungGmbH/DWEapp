// TaskHierarchyOrderRow - Order-Header für hierarchische Aufgabenliste
// CASCADE-konform: <200 Zeilen, CSS-Variablen

'use client'

import { ChevronDown, ChevronRight, Package, Building, MapPin, Euro } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TaskHierarchyOrderRowProps {
  item: {
    id: string
    orderId?: string
    title: string
    subtitle?: string
    hasChildren: boolean
    isExpanded?: boolean
    progress?: number
    children?: any[]
  }
  order?: any
  onToggle: (id: string) => void
}

export function TaskHierarchyOrderRow({ item, order, onToggle }: TaskHierarchyOrderRowProps) {
  // Format Adresse
  const formatAddress = (order: any) => {
    if (!order?.shippingAddress) return ''
    const parts = order.shippingAddress.split(', ')
    return parts.length > 1 ? `${parts[0]}` : order.shippingAddress
  }

  return (
    <div 
      className={`border-l-4 ${
        item.isExpanded 
          ? 'border-[var(--accent)] bg-[var(--accent-muted)]' 
          : 'border-[var(--info)] bg-[var(--bg-secondary)]'
      } rounded-r-lg p-4 transition-all hover:shadow-md cursor-pointer`}
      onClick={() => item.hasChildren && onToggle(item.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            {item.hasChildren && (
              <div className="w-5 h-5 flex items-center justify-center">
                {item.isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-[var(--accent)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--accent)]" />
                )}
              </div>
            )}
            <Package className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="font-semibold text-lg text-[var(--primary)]">{item.title}</h3>
            <Badge variant="outline" className="bg-[var(--bg-secondary)]">
              {item.children?.length || 0} Aufgaben
            </Badge>
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-[var(--secondary)] ml-8">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              {item.subtitle}
            </div>
            {order?.shippingAddress && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {formatAddress(order)}
              </div>
            )}
            {order?.totalAmount && (
              <div className="flex items-center gap-1">
                <Euro className="h-4 w-4" />
                €{Number(order.totalAmount).toFixed(2)}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {item.progress !== undefined && (
            <div className="mt-3 ml-8">
              <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                <div 
                  className="bg-[var(--success)] h-2 rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <div className="text-xs text-[var(--muted)] mt-1">
                {Math.round(item.progress)}% erledigt
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
