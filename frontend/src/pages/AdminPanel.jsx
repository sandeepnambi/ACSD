import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { adminAPI } from '../services/api'
import { 
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getSystemStats()
      setStats(response.data.stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="large" />
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
      
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/admin/users"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <UserGroupIcon className="h-8 w-8 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Users</h4>
            <p className="text-sm text-gray-500">View and manage user accounts</p>
          </Link>
          
          <Link
            to="/admin/rules"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="h-8 w-8 text-green-500 mb-2" />
            <h4 className="font-medium text-gray-900">Detection Rules</h4>
            <p className="text-sm text-gray-500">Configure code smell detection rules</p>
          </Link>
          
          <Link
            to="/admin/reports"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <DocumentTextIcon className="h-8 w-8 text-purple-500 mb-2" />
            <h4 className="font-medium text-gray-900">All Reports</h4>
            <p className="text-sm text-gray-500">View all analysis reports</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

const UsersManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers()
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="large" />
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
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

const SmellRules = () => {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const response = await adminAPI.getSmellRules()
      setRules(response.data.rules || [])
    } catch (error) {
      console.error('Failed to fetch rules:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="large" />
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Detection Rules</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {rules.map((rule) => (
            <li key={rule.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{rule.displayName}</h3>
                    <p className="text-sm text-gray-500">{rule.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Threshold: {rule.threshold} {rule.unit}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rule.severity === 'high' ? 'bg-red-100 text-red-800' : 
                      rule.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {rule.severity}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
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
  const location = useLocation()
  
  const adminTabs = [
    { path: '/admin', name: 'Dashboard', component: AdminDashboard },
    { path: '/admin/users', name: 'Users', component: UsersManagement },
    { path: '/admin/rules', name: 'Rules', component: SmellRules }
  ]

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-2 text-gray-600">
          Manage users, rules, and system settings.
        </p>
      </div>

      {/* Admin Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {adminTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`${
                location.pathname === tab.path
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Admin Routes */}
      <Routes>
        {adminTabs.map((tab) => (
          <Route key={tab.path} path={tab.path} element={<tab.component />} />
        ))}
      </Routes>
    </div>
  )
}

export default AdminPanel
