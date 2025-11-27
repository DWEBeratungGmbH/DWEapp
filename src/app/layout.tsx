import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Weclapp Manager',
  description: 'Weclapp Manager Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
