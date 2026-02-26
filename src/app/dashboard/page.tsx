'use client'

import { useEffect, useState } from 'react'
import { Receipt, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PortalSelectionPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data))
  }, [])

  if (!user) return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-emerald-50 to-white flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/climitra_logo.png" 
              alt="Climitra Logo" 
              className="h-24 w-24 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent mb-3 leading-tight">
            Employee Portal
          </h1>
          <p className="text-xl text-gray-600">Welcome, {user.name}! Choose a portal to continue</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Expense Tracker */}
        <Link
          href="/dashboard/expense-portal"
          className="group relative bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-2xl hover:shadow-3xl border-2 border-emerald-200/50 hover:border-emerald-400 p-10 transition-all hover:scale-105 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Receipt className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Expense Tracker</h2>
            <p className="text-gray-600 mb-6">
              Submit and manage your expense claims, upload receipts, and track payment status
            </p>

            <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-4 transition-all">
              <span>Open Portal</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Leave Tracker */}
        <Link
          href="/dashboard/leave-tracker"
          className="group relative bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl hover:shadow-3xl border-2 border-blue-200/50 hover:border-blue-400 p-10 transition-all hover:scale-105 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-full"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Leave Tracker</h2>
            <p className="text-gray-600 mb-6">
              Request time off, view your leave balance, and manage your vacation days
            </p>

            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
              <span>Open Portal</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>

      {user.role === 'Super Admin' && (
        <div className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl shadow-xl border border-emerald-200/50 p-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-xl">Super Admin Access</h3>
              <p className="text-gray-600 text-lg">You have full access to view and manage all employee data across portals</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
