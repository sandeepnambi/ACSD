import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { adminAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminDashboard = ({ stats }) => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <UserGroupIcon className="h-6 w-6 text-blue-500" />
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalUsers || 0}</dd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-green-500" />
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500">Total Reports</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalReports || 0}</dd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-purple-500" />
              <div className="ml-5">
                <dt className="text-sm font-medium text-gray-500">Total Analyses</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalAnalyses || 0}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Insights</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">System Health</span>
            <span className="text-green-600 font-medium">Excellent</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Active Users</span>
            <span className="text-blue-600 font-medium">{stats.activeUsers || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const UsersManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers()
      const allUsers = response.data.users || []
      // Filter out the current admin
      setUsers(allUsers.filter(u => u._id !== currentUser?.id && u._id !== currentUser?._id))
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !currentStatus })
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u))
      toast.success('User status updated')
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This will also delete all their reports.')) return
    try {
      await adminAPI.deleteUser(userId)
      setUsers(users.filter(u => u._id !== userId))
      toast.success('User deleted')
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user._id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                  <p className="text-sm text-gray-500">{user.email} • Role: {user.role}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleToggleActive(user._id, user.isActive)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Disabled'}
                  </button>
                  <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ReportsManagement = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await adminAPI.getAllReports()
      setReports(response.data.reports || [])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return
    try {
      await adminAPI.deleteReport(reportId)
      setReports(reports.filter(r => r._id !== reportId))
      toast.success('Report deleted')
    } catch (error) {
      toast.error('Failed to delete report')
    }
  }

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {reports.map((report) => (
          <li key={report._id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{report.fileName}</h3>
                  <p className="text-sm text-gray-600">
                    User: <span className="font-semibold text-gray-900">{report.userId?.username || 'Unknown'}</span>
                  </p>
                  <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right mr-4">
                    <p className="text-xs text-gray-500">Quality</p>
                    <p className="text-sm font-bold text-gray-900">{report.summary?.qualityScore}%</p>
                  </div>
                  <button onClick={() => handleDelete(report._id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SmellRules = () => {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingRule, setEditingRule] = useState(null)
  const [newThreshold, setNewThreshold] = useState('')

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const response = await adminAPI.getSmellRules()
      setRules(response.data.rules || [])
    } catch (error) {
      console.error('Failed to fetch rules:', error)
      toast.error('Failed to load rules')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRule = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.updateSmellRule(editingRule._id, { threshold: parseInt(newThreshold) })
      setRules(rules.map(r => r._id === editingRule._id ? { ...r, threshold: parseInt(newThreshold) } : r))
      setEditingRule(null)
      toast.success('Rule updated successfully')
    } catch (error) {
      toast.error('Failed to update rule')
    }
  }

  if (loading) return <LoadingSpinner size="large" />

  return (
    <div className="space-y-6">
      {editingRule && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Edit Rule: {editingRule.displayName}</h3>
          <form onSubmit={handleUpdateRule} className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Threshold ({editingRule.unit})</label>
              <input
                type="number"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => setEditingRule(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {rules.map((rule) => (
            <li key={rule._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{rule.displayName}</h3>
                    <p className="text-sm text-gray-500">{rule.description}</p>
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      Threshold: {rule.threshold} {rule.unit}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setEditingRule(rule)
                        setNewThreshold(rule.threshold)
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const AdminPanel = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getSystemStats()
      setStats(response.data.stats || {})
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeTab = location.pathname.split('/').pop() || 'admin'
  
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Control</h1>
        <p className="mt-2 text-gray-600">Manage your system metrics, users, and analysis logic.</p>
      </div>

      <div className="flex border-b border-gray-200 mb-8">
        {[
          { id: 'admin', name: 'Overview' },
          { id: 'users', name: 'Users' },
          { id: 'reports', name: 'Reports' },
          { id: 'rules', name: 'Rules' }
        ].map((tab) => (
          <Link
            key={tab.id}
            to={tab.id === 'admin' ? '/admin' : `/admin/${tab.id}`}
            className={`${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-all`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <Routes>
          <Route index element={<AdminDashboard stats={stats} />} />
          <Route path="users" element={<UsersManagement currentUser={user} />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="rules" element={<SmellRules />} />
        </Routes>
      )}
    </div>
  )
}

export default AdminPanel
