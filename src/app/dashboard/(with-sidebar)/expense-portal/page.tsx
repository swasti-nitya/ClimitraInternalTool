'use client'

import { useEffect, useState } from 'react'
import { Receipt, Clock, CheckCircle, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'

export default function ExpensePortalPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // Fetch user
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data))

    // Fetch expenses for stats
    fetch('/api/expenses')
      .then(res => res.json())
      .then(expenses => {
        const pending = expenses.filter((e: any) => e.status === 'Pending approval').length
        const approved = expenses.filter((e: any) => e.status === 'approval done').length
        const paid = expenses.filter((e: any) => e.status === 'paid').length
        const totalAmount = expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
        const paidAmount = expenses.filter((e: any) => e.status === 'paid').reduce((sum: number, e: any) => sum + e.amount, 0)
        
        setStats({ pending, approved, paid, totalAmount, total: expenses.length, paidAmount })
      })
  }, [])

  if (!user || !stats) return <div>Loading...</div>

  const isAdmin = user.role === 'Super Admin'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user.name}! {isAdmin ? "Here's an overview of all expenses." : "Here's your expense summary."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl border border-emerald-200/50 p-6 transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
              <Receipt className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg hover:shadow-xl border border-orange-200/50 p-6 transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-xl border border-blue-200/50 p-6 transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Approved</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.approved}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl border border-emerald-200/50 p-6 transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Paid</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.paid}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg hover:shadow-xl border border-purple-200/50 p-6 transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Amount</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl border border-emerald-200/50 p-6 transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Amount Paid</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹{stats.paidAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard/expenses"
            className="w-full flex items-center gap-4 p-4 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Receipt className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {isAdmin ? 'Manage All Expenses' : 'View My Expenses'}
              </h3>
              <p className="text-sm text-gray-600">
                {isAdmin ? 'Review and approve expense claims' : 'Track your submitted expenses'}
              </p>
            </div>
          </Link>

        </div>
      </div>

      {isAdmin && (
        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Super Admin Access</h3>
              <p className="text-sm text-gray-600">You have full access to manage all expenses and export data</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
