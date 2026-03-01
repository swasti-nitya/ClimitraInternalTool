'use client'

import { useEffect, useState } from 'react'
import { Plus, Calendar, DollarSign, FileText, Download, Filter, X, File, Receipt as ReceiptIcon } from 'lucide-react'
import { format } from 'date-fns'

export default function ExpensesPage() {
  const [user, setUser] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filterUserId, setFilterUserId] = useState('')
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    paidTo: '',
    category: 'Food',
    description: '',
    remarks: '',
    paymentProof: null as File | null,
    invoice: null as File | null,
  })

  useEffect(() => {
    fetchUser()
    fetchExpenses()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUserId])

  const fetchUser = async () => {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    setUser(data)
    
    // Fetch all users if admin
    if (data.role === 'Super Admin') {
      const usersRes = await fetch('/api/users')
      const usersData = await usersRes.json()
      setAllUsers(usersData)
    }
  }

  const fetchExpenses = async () => {
    const url = filterUserId 
      ? `/api/expenses?userId=${filterUserId}`
      : '/api/expenses'
    const res = await fetch(url)
    const data = await res.json()
    setExpenses(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('date', formData.date)
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('paidTo', formData.paidTo)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('remarks', formData.remarks)
      
      if (formData.paymentProof) {
        formDataToSend.append('paymentProof', formData.paymentProof)
      }
      if (formData.invoice) {
        formDataToSend.append('invoice', formData.invoice)
      }

      const res = await fetch('/api/expenses', {
        method: 'POST',
        body: formDataToSend,
      })

      if (res.ok) {
        setShowModal(false)
        setFormData({
          date: format(new Date(), 'yyyy-MM-dd'),
          amount: '',
          paidTo: '',
          category: 'Food',
          description: '',
          remarks: '',
          paymentProof: null,
          invoice: null,
        })
        fetchExpenses()
      }
    } catch (error) {
      console.error('Error submitting expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (expenseId: string, newStatus: string) => {
    try {
      await fetch(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchExpenses()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Amount', 'Paid To', 'Category', 'Description', 'Status', 'User']
    const rows = expenses.map(exp => [
      format(new Date(exp.date), 'dd/MM/yyyy'),
      `₹${exp.amount}`,
      exp.paidTo,
      exp.category,
      exp.description,
      exp.status,
      exp.user.name,
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending approval':
        return 'bg-orange-100 text-orange-700'
      case 'approval done':
        return 'bg-blue-100 text-blue-700'
      case 'paid':
        return 'bg-emerald-100 text-emerald-700'
      case 'Rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
          <p className="text-gray-600 mt-1">
            {user.role === 'Super Admin' ? 'Master view of all expenses' : 'Manage your expense claims'}
          </p>
        </div>
        <div className="flex gap-3">
          {user.role === 'Super Admin' && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 hover:border-emerald-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filter for admins */}
      {user.role === 'Super Admin' && (
        <div className="mb-4 flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">All Employees</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-emerald-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paid To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                {user.role === 'Super Admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Files</th>
                {user.role === 'Super Admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(expense.date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.paidTo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{expense.description}</td>
                  {user.role === 'Super Admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.user.name}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col gap-2">
                      {expense.paymentProof && (
                        <a
                          href={expense.paymentProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all font-medium"
                        >
                          <ReceiptIcon className="w-4 h-4" />
                          <span>Payment Proof</span>
                        </a>
                      )}
                      {expense.invoice && (
                        <a
                          href={expense.invoice}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all font-medium"
                        >
                          <File className="w-4 h-4" />
                          <span>Invoice</span>
                        </a>
                      )}
                      {!expense.paymentProof && !expense.invoice && (
                        <span className="text-gray-400 text-xs">No files</span>
                      )}
                    </div>
                  </td>
                  {user.role === 'Super Admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={expense.status}
                        onChange={(e) => updateStatus(expense.id, e.target.value)}
                        className="px-2 py-1 border border-emerald-200 rounded text-xs focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Pending approval">Pending</option>
                        <option value="approval done">Approved</option>
                        <option value="paid">Paid</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No expenses found. Add your first expense!
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Add New Expense</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paid To *
                  </label>
                  <input
                    type="text"
                    value={formData.paidTo}
                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Vendor/Person name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the expense..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Proof (JPG, PNG, PDF)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setFormData({ ...formData, paymentProof: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice (JPG, PNG, PDF)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setFormData({ ...formData, invoice: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
