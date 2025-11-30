// Task Statistik-Card Komponente

import { Card, CardContent } from '@/components/ui/card'

interface TaskStatCardProps {
  title: string
  value: number
  icon: React.ElementType
  colorClass: string
}

export function TaskStatCard({ title, value, icon: Icon, colorClass }: TaskStatCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
