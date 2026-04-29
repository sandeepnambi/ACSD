import React, { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { reportsAPI } from '../services/api'
import { 
  DocumentIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [error, setError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (location.state?.analysisResult) {
      const { results } = location.state.analysisResult
      const reportId = results.reportId

      // Avoid adding duplicate if it already exists in the list
      setReports(prev => {
        const exists = prev.some(r => (r._id || r.id) === reportId)
        if (exists) return prev

        const newReport = {
          _id: reportId,
          fileName: location.state.fileInfo.originalname,
          createdAt: new Date().toISOString(),
          summary: results.summary,
          status: results.summary.status
        }
        return [newReport, ...prev]
      })
    }
  }, [location.state])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await reportsAPI.getReports()
      setReports(response.data.reports || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const deleteReport = async (reportId) => {
    if (!reportId) {
      setError('Invalid report ID')
      return
    }

    setDeletingId(reportId)
    setConfirmDeleteId(null)
    
    try {
      await reportsAPI.deleteReport(reportId)
      setReports(prev => prev.filter(report => (report._id || report.id) !== reportId))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete report')
    } finally {
      setDeletingId(null)
    }
  }

  const exportReport = async (reportId, format = 'json') => {
    try {
      const response = await reportsAPI.exportReport(reportId, format)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${reportId}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export report')
    }
  }

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

  const getStatusBadge = (status) => {
    const styles = {
      clean: 'bg-green-100 text-green-800',
      minor_issues: 'bg-yellow-100 text-yellow-800',
      needs_refactoring: 'bg-red-100 text-red-800'
    }
    
    const displayStatus = status || 'minor_issues'
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[displayStatus] || styles.minor_issues}`}>
        {displayStatus.replace('_', ' ').toUpperCase()}
      </span>
    )
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
        <h1 className="text-3xl font-bold text-gray-900">Analysis Reports</h1>
        <p className="mt-2 text-gray-600">
          View and manage your code analysis history.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="bg-white shadow rounded-lg">
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload and analyze your first code file to see reports here.
            </p>
            <div className="mt-6">
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Code
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => (
              <li key={report._id || report.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <Link 
                      to={`/reports/${report._id || report.id}`}
                      className="flex items-center min-w-0 flex-1"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(report.summary?.status || report.status)}
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="text-sm sm:text-lg font-medium text-blue-600 hover:text-blue-800 truncate">
                            {report.fileName}
                          </h3>
                          <div className="flex-shrink-0">
                            {getStatusBadge(report.summary?.status || report.status)}
                          </div>
                        </div>
                        <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-500">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <span className="truncate">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center ml-2 flex-shrink-0">
                      {report.summary && (
                        <div className="text-right mr-4 hidden lg:block">
                          <p className="text-sm text-gray-500">
                            {report.summary.totalSmells || 0} smells found
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            Quality Score: {report.summary.qualityScore ?? 100}%
                          </p>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            navigate(`/reports/${report._id || report.id}?download=pdf`)
                          }}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Download as PDF"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        
                        {confirmDeleteId === (report._id || report.id) ? (
                          <div className="flex items-center space-x-1 sm:space-x-2 bg-red-50 p-0.5 sm:p-1 rounded-lg border border-red-100">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                deleteReport(report._id || report.id)
                              }}
                              className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold rounded hover:bg-red-700 transition-colors"
                            >
                              YES
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setConfirmDeleteId(null)
                              }}
                              className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-200 text-gray-700 text-[10px] sm:text-xs font-bold rounded hover:bg-gray-300 transition-colors"
                            >
                              NO
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setConfirmDeleteId(report._id || report.id)
                            }}
                            disabled={deletingId === (report._id || report.id)}
                            className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                              deletingId === (report._id || report.id)
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete report"
                          >
                            {deletingId === (report._id || report.id) ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Reports
