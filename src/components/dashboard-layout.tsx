import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
