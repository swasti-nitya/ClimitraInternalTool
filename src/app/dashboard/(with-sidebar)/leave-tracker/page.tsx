'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Check, X, AlertCircle, CheckCircle, XCircle, Gift } from 'lucide-react'
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns'

interface Leave {
  id: string
  date: string
  type: 'Leave' | 'WFH'
  reason?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  userId: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface Holiday {
  id: string
  date: string
  name: string
}

const ALLOWED_LEAVES = 30

export default function LeaveTracker() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, wfh: 0 })
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null)
  const [leaveType, setLeaveType] = useState<'Leave' | 'WFH'>('Leave')
  const [reason, setReason] = useState('')
  const [holidayName, setHolidayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [filterUserId, setFilterUserId] = useState('')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [adminTab, setAdminTab] = useState<'my-leaves' | 'approvals'>('my-leaves')

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()
        setUserId(meData.id)
        setIsAdmin(meData.role === 'Super Admin')

        const leavesRes = await fetch('/api/leaves')
        const leavesData = await leavesRes.json()
        setLeaves(leavesData)

        const holidaysRes = await fetch('/api/holidays')
        const holidaysData = await holidaysRes.json()
        setHolidays(holidaysData)

        // Fetch all users if admin
        if (meData.role === 'Super Admin') {
          const usersRes = await fetch('/api/users')
          const usersData = await usersRes.json()
          setAllUsers(usersData)
        }

        // Calculate stats
        const myLeaves = leavesData.filter((l: Leave) => l.userId === meData.id)
        const approvedLeaves = myLeaves.filter((l: Leave) => l.status === 'Approved' && l.type === 'Leave').length
        const approvedWFH = myLeaves.filter((l: Leave) => l.status === 'Approved' && l.type === 'WFH').length
        const pendingLeaves = myLeaves.filter((l: Leave) => l.status === 'Pending').length

        setStats({
          total: approvedLeaves,
          approved: approvedLeaves,
          pending: pendingLeaves,
          wfh: approvedWFH,
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          type: leaveType,
          reason: reason || null,
        }),
      })

      if (res.ok) {
        const newLeave = await res.json()
        const updatedLeaves = [...leaves, newLeave]
        setLeaves(updatedLeaves)
        
        // Recalculate stats for current user
        const myLeaves = updatedLeaves.filter((l: Leave) => l.userId === userId)
        const approvedLeaves = myLeaves.filter((l: Leave) => l.status === 'Approved' && l.type === 'Leave').length
        const approvedWFH = myLeaves.filter((l: Leave) => l.status === 'Approved' && l.type === 'WFH').length
        const pendingLeaves = myLeaves.filter((l: Leave) => l.status === 'Pending').length

        setStats({
          total: approvedLeaves,
          approved: approvedLeaves,
          pending: pendingLeaves,
          wfh: approvedWFH,
        })
        
        setShowAddModal(false)
        setSelectedDate(null)
        setReason('')
      }
    } catch (error) {
      console.error('Error adding leave:', error)
    }
  }

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !holidayName) return

    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          name: holidayName,
        }),
      })

      if (res.ok) {
        const newHoliday = await res.json()
        setHolidays([...holidays, newHoliday])
        setShowHolidayModal(false)
        setSelectedDate(null)
        setHolidayName('')
        
        // Recalculate stats to ensure accuracy
        const myLeaves = leaves.filter((l: Leave) => l.userId === userId)
        const approvedLeaves = myLeaves.filter((l: Leave) => l.status === 'Approved' && l.type === 'Leave').length
        const approvedWFH = myLeaves.filter((l: Leave) => l.status === 'Approved' && l.type === 'WFH').length
        const pendingLeaves = myLeaves.filter((l: Leave) => l.status === 'Pending').length

        setStats({
          total: approvedLeaves,
          approved: approvedLeaves,
          pending: pendingLeaves,
          wfh: approvedWFH,
        })
      }
    } catch (error) {
      console.error('Error adding holiday:', error)
    }
  }

  const handleApproveLeave = async (leaveId: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        const updated = await res.json()
        const updatedLeaves = leaves.map(l => l.id === leaveId ? updated : l)
        setLeaves(updatedLeaves)
        
        // Recalculate stats for current user
        const myLeaves = updatedLeaves.filter((l: Leave) => l.userId === userId)
        const approvedLeaves = myLeaves.filter((l: Leave) => l.status === 'Approved' && l.type === 'Leave').length
        const approvedWFH = myLeaves.filter((l: Leave) => l.status === 'Approved' && l.type === 'WFH').length
        const pendingLeaves = myLeaves.filter((l: Leave) => l.status === 'Pending').length

        setStats({
          total: approvedLeaves,
          approved: approvedLeaves,
          pending: pendingLeaves,
          wfh: approvedWFH,
        })
        
        setShowApprovalModal(false)
      }
    } catch (error) {
      console.error('Error updating leave:', error)
    }
  }

  const isDateHoliday = (date: Date) => {
    return holidays.some(h => format(new Date(h.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
  }

  const getHolidayForDate = (date: Date) => {
    return holidays.find(h => format(new Date(h.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
  }

  const isDateLeave = (date: Date) => {
    // Determine which user's leaves to show
    const targetUserId = isAdmin && adminTab === 'approvals' ? filterUserId : userId
    if (!targetUserId) return false
    return leaves.some(l => 
      l.userId === targetUserId && 
      format(new Date(l.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  }

  const getLeaveForDate = (date: Date) => {
    // Determine which user's leaves to show
    const targetUserId = isAdmin && adminTab === 'approvals' ? filterUserId : userId
    if (!targetUserId) return undefined
    return leaves.find(l => 
      l.userId === targetUserId && 
      format(new Date(l.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  }

  const renderCalendar = () => {
    const firstDay = startOfMonth(currentMonth)
    const daysInCurrentMonth = getDaysInMonth(currentMonth)
    const startingDayOfWeek = getDay(firstDay)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 bg-gray-50"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const holiday = holidays.find(h => format(new Date(h.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      const leave = getLeaveForDate(date)

      let bgColor = 'bg-white'
      let textColor = 'text-gray-900'
      let borderColor = 'border-gray-200'
      let cursorClass = 'cursor-pointer'

      if (holiday) {
        bgColor = 'bg-red-100'
        textColor = 'text-red-900'
        borderColor = 'border-red-300'
      } else if (leave) {
        if (leave.type === 'Leave') {
          bgColor = leave.status === 'Approved' ? 'bg-orange-100' : 'bg-yellow-100'
          textColor = leave.status === 'Approved' ? 'text-orange-900' : 'text-yellow-900'
        } else {
          bgColor = leave.status === 'Approved' ? 'bg-blue-100' : 'bg-cyan-100'
          textColor = leave.status === 'Approved' ? 'text-blue-900' : 'text-cyan-900'
        }
        borderColor = 'border-current'
      }

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(date)
            if (isAdmin && !leave && !holiday) {
              setShowHolidayModal(true)
            } else if (!isAdmin && !leave && !holiday) {
              setShowAddModal(true)
            } else if (isAdmin && leave) {
              setSelectedLeave(leave)
              setShowApprovalModal(true)
            }
          }}
          className={`h-16 p-2 border ${borderColor} ${cursorClass} hover:bg-emerald-50 transition ${bgColor}`}
        >
          <div className={`text-sm font-semibold ${textColor}`}>{day}</div>
          {leave && (
            <div className={`text-xs mt-1 font-medium`}>
              {leave.type === 'Leave' ? '🏖️' : '🏠'} {leave.status === 'Approved' ? '✓' : leave.status === 'Rejected' ? '✗' : '?'}
            </div>
          )}
          {holiday && <div className="text-xs mt-1 font-medium">🎉</div>}
        </div>
      )
    }

    return days
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  // Filter leaves for admin view
  const filteredLeaves = isAdmin && filterUserId 
    ? leaves.filter(l => l.userId === filterUserId)
    : isAdmin ? leaves : leaves.filter(l => l.userId === userId)

  // Admin should see ALL pending leaves, regardless of filter
  const pendingLeaves = isAdmin 
    ? leaves.filter(l => l.status === 'Pending')
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Leave Tracker</h1>
        {!isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus size={20} />
            Request Leave
          </button>
        )}
      </div>

      {/* Admin Tabs */}
      {isAdmin && (
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setAdminTab('my-leaves')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              adminTab === 'my-leaves'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Leaves
          </button>
          <button
            onClick={() => setAdminTab('approvals')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              adminTab === 'approvals'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Approvals & Employees
          </button>
        </div>
      )}

      {/* MY LEAVES TAB - For regular users and admin's own leaves */}
      {(!isAdmin || adminTab === 'my-leaves') && (
        <>
          {isAdmin && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Leaves</h2>
              <button
                onClick={() => {
                  setSelectedDate(null)
                  setShowHolidayModal(true)
                }}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Gift size={20} />
                Add Holiday
              </button>
            </div>
          )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Leaves Used</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {stats.approved} / {ALLOWED_LEAVES}
              </p>
            </div>
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <div className="text-xs text-red-700 mt-2">Remaining: {ALLOWED_LEAVES - stats.approved}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Approved Leaves</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.approved}</p>
            </div>
            <Check size={40} className="text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Approved WFH</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.wfh}</p>
            </div>
            <AlertCircle size={40} className="text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pending}</p>
            </div>
            <AlertCircle size={40} className="text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={24} className="text-emerald-600" />
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-300 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-100 p-2 text-center font-semibold text-gray-700 text-sm">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
            <span className="text-sm text-gray-600">Approved Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-sm text-gray-600">Pending Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-sm text-gray-600">Approved WFH</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-600">Holiday</span>
          </div>
        </div>
      </div>
        </>
      )}

      {/* APPROVALS & EMPLOYEES TAB - For admin management */}
      {isAdmin && adminTab === 'approvals' && (
        <>
          <div className="space-y-6">
            {/* Employee Filter and Stats */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Employee</label>
              <select
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-6"
              >
                <option value="">All Employees</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>

              {/* Selected Employee Stats */}
              {filterUserId && (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">{allUsers.find(u => u.id === filterUserId)?.name}</span>'s Leave Statistics
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                      <p className="text-xs text-emerald-700 font-medium">Leaves Used</p>
                      <p className="text-2xl font-bold text-emerald-900 mt-1">
                        {leaves.filter(l => l.userId === filterUserId && l.status === 'Approved' && l.type === 'Leave').length} / {ALLOWED_LEAVES}
                      </p>
                      <p className="text-xs text-emerald-700 mt-1">
                        Remaining: {ALLOWED_LEAVES - leaves.filter(l => l.userId === filterUserId && l.status === 'Approved' && l.type === 'Leave').length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <p className="text-xs text-orange-700 font-medium">Approved Leaves</p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">
                        {leaves.filter(l => l.userId === filterUserId && l.status === 'Approved' && l.type === 'Leave').length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium">Approved WFH</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {leaves.filter(l => l.userId === filterUserId && l.status === 'Approved' && l.type === 'WFH').length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                      <p className="text-xs text-yellow-700 font-medium">Pending Requests</p>
                      <p className="text-2xl font-bold text-yellow-900 mt-1">
                        {leaves.filter(l => l.userId === filterUserId && l.status === 'Pending').length}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Selected Employee Calendar */}
            {filterUserId && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={24} className="text-emerald-600" />
                    {format(currentMonth, 'MMMM yyyy')} - {allUsers.find(u => u.id === filterUserId)?.name}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date())}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-gray-300 rounded-lg overflow-hidden">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-100 p-2 text-center font-semibold text-gray-700 text-sm">
                      {day}
                    </div>
                  ))}
                  {renderCalendar()}
                </div>
              </div>
            )}

            {/* Pending Approvals List */}
            {pendingLeaves.length > 0 && (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={24} className="text-yellow-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Pending Leave Approvals {filterUserId ? `- ${allUsers.find(u => u.id === filterUserId)?.name}` : ''}
                    ({filterUserId ? leaves.filter(l => l.userId === filterUserId && l.status === 'Pending').length : pendingLeaves.length})
                  </h2>
                </div>

                <div className="space-y-3">
                  {(filterUserId 
                    ? leaves.filter(l => l.userId === filterUserId && l.status === 'Pending')
                    : pendingLeaves
                  ).map(leave => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {!filterUserId && leave.user.name} - {format(new Date(leave.date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {leave.type === 'Leave' ? '🏖️ Leave' : '🏠 Work From Home'}
                          {leave.reason && ` • ${leave.reason}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveLeave(leave.id, 'Approved')}
                          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveLeave(leave.id, 'Rejected')}
                          className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Hidden section - keeping old approvals for non-tab view. Will be removed later */}
      {!isAdmin && (
        <>
        </>
      )}

      {/* Add Leave Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Request Leave
            </h3>

            <form onSubmit={handleAddLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="Leave"
                      checked={leaveType === 'Leave'}
                      onChange={(e) => setLeaveType(e.target.value as 'Leave')}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Leave</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="WFH"
                      checked={leaveType === 'WFH'}
                      onChange={(e) => setLeaveType(e.target.value as 'WFH')}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Work From Home</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter your reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedDate(null)
                    setReason('')
                    setLeaveType('Leave')
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add Holiday
            </h3>

            <form onSubmit={handleAddHoliday} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="e.g., Diwali, Christmas"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Add Holiday
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHolidayModal(false)
                    setSelectedDate(null)
                    setHolidayName('')
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Leave Request</h3>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Employee</p>
                <p className="font-semibold text-gray-900">{selectedLeave.user.name}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{format(new Date(selectedLeave.date), 'MMM dd, yyyy')}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold text-gray-900">
                  {selectedLeave.type === 'Leave' ? '🏖️ Leave' : '🏠 Work From Home'}
                </p>
              </div>

              {selectedLeave.reason && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="font-semibold text-gray-900">{selectedLeave.reason}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApproveLeave(selectedLeave.id, 'Approved')}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Approve
              </button>
              <button
                onClick={() => handleApproveLeave(selectedLeave.id, 'Rejected')}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Reject
              </button>
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
