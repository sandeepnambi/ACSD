import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { reportsAPI } from '../services/api'
import { 
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await reportsAPI.getReportStats()
      setStats(response.data.stats)
      setRecentActivity(response.data.recentActivity || [])
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Analyses',
      value: stats?.totalReports || 0,
      icon: ChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Code Smells Found',
      value: stats?.totalSmells || 0,
      icon: DocumentTextIcon,
      color: 'bg-red-500'
    },
    {
      name: 'Clean Files',
      value: stats?.cleanReports || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Quality Score',
      value: `${Math.round(stats?.averageQualityScore || 100)}%`,
      icon: ChartBarIcon,
      color: 'bg-purple-500'
    }
  ]

  const quickActions = [
    {
      title: 'Upload New Code',
      description: 'Analyze a new Python or Java file for code smells',
      icon: DocumentArrowUpIcon,
      link: '/upload',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'View Reports',
      description: 'Browse your analysis history and detailed reports',
      icon: DocumentTextIcon,
      link: '/reports',
      color: 'bg-green-600 hover:bg-green-700'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'clean':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'needs_refactoring':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.username}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your code analysis activity.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon
                    className={`h-10 w-10 text-white ${stat.color} rounded-lg p-2`}
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="relative block bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <action.icon
                    className={`h-8 w-8 text-white ${action.color} rounded-lg p-1`}
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activity
          </h3>
          <Link to="/reports" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            View all
          </Link>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No analyses yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first code file.
            </p>
            <div className="mt-6">
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                Upload Code
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity._id}>
                <Link to={`/reports/${activity._id}`} className="block hover:bg-gray-50 transition-colors">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(activity.summary?.status)}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {activity.fileName}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <CalendarIcon className="flex-shrink-0 mr-1 h-3 w-3 text-gray-400" />
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="text-xs text-gray-500">Quality</p>
                          <p className="text-sm font-bold text-gray-900">
                            {activity.summary?.qualityScore}%
                          </p>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Dashboard
