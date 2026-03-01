'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, LogOut, Menu, X, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Determine current portal - be explicit
  const isLeaveTracker = pathname.includes('/leave-tracker')
  const isExpenseTracker = pathname.includes('/expenses') || pathname.includes('/expense-portal')

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => router.push('/'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleLogout = () => {
    document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/')
  }

  if (!user) return <div className="min-h-screen bg-emerald-50 flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-emerald-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-emerald-50/30 border-r border-emerald-200/50 shadow-xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-emerald-200/50">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src="/climitra_logo.png" 
                alt="Climitra Logo" 
                className="h-14 w-14 object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {user.role === 'Super Admin' && (
              <span className="inline-block mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                Super Admin
              </span>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {isExpenseTracker && (
              <Link
                href="/dashboard/expenses"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 text-gray-700 hover:text-emerald-700 transition-all hover:shadow-md hover:scale-[1.02]"
              >
                <Receipt className="w-5 h-5" />
                <span className="font-medium">Expenses</span>
              </Link>
            )}

            {isLeaveTracker && (
              <Link
                href="/dashboard/leave-tracker"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:text-blue-700 transition-all hover:shadow-md hover:scale-[1.02]"
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Leave Tracker</span>
              </Link>
            )}
          </nav>

          <div className="p-4 border-t border-emerald-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-emerald-50 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link
              href="/dashboard"
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Portal Homepage</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
