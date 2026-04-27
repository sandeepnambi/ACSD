import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reportsAPI } from '../services/api'
import { 
  ArrowLeftIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CodeBracketIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const ReportDetail = () => {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCode, setShowCode] = useState(false)
  const printRef = useRef()

  useEffect(() => {
    fetchReport()
  }, [reportId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await reportsAPI.getReport(reportId)
      setReport(response.data.report)
      
      // Auto-trigger print if download param is present
      const queryParams = new URLSearchParams(window.location.search)
      if (queryParams.get('download') === 'pdf') {
        setTimeout(() => {
          window.print()
        }, 500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSmellTypeIcon = (type) => {
    switch (type) {
      case 'long_method': return '📏'
      case 'large_class': return '🏢'
      case 'duplicate_code': return '📋'
      case 'excess_parameters': return '📊'
      case 'high_complexity': return '🧩'
      default: return '⚠️'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Report not found</h3>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-5xl mx-auto print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-border { border: 1px solid #e5e7eb !important; border-radius: 0.5rem !important; }
          .shadow { shadow: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 no-print">
        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Reports
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              {report.fileName}
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Analyzed on {new Date(report.createdAt).toLocaleDateString()} at{' '}
              {new Date(report.createdAt).toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={() => setShowCode(!showCode)}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <CodeBracketIcon className="h-4 w-4 mr-1 sm:mr-2" />
              {showCode ? 'Hide Code' : 'View Code'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <PrinterIcon className="h-4 w-4 mr-1 sm:mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-4xl font-bold text-gray-900">Code Analysis Report</h1>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">File Name</p>
            <p className="text-lg font-semibold">{report.fileName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Language</p>
            <p className="text-lg font-semibold capitalize">{report.fileLanguage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Date</p>
            <p className="text-lg font-semibold">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Overall Quality</p>
            <p className="text-lg font-semibold text-blue-600">{report.summary?.qualityScore}%</p>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 print:mb-2">
          <h2 className="text-xl font-bold text-gray-900">Summary Overview</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">Quality Score:</span>
            <span className="text-2xl font-bold text-blue-600">{report.summary?.qualityScore}%</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white p-5 shadow rounded-lg border border-transparent print:border-gray-200">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Smells</dt>
            <dd className="mt-1 text-2xl font-bold text-gray-900">{report.summary?.totalSmells || 0}</dd>
          </div>
          <div className="bg-white p-5 shadow rounded-lg border border-transparent print:border-gray-200">
            <dt className="text-sm font-medium text-gray-500 truncate">Critical Issues</dt>
            <dd className="mt-1 text-2xl font-bold text-red-600">{report.summary?.criticalSmells || 0}</dd>
          </div>
          <div className="bg-white p-5 shadow rounded-lg border border-transparent print:border-gray-200">
            <dt className="text-sm font-medium text-gray-500 truncate">File Size</dt>
            <dd className="mt-1 text-2xl font-bold text-gray-900">{(report.fileSize / 1024).toFixed(2)} KB</dd>
          </div>
          <div className="bg-white p-5 shadow rounded-lg border border-transparent print:border-gray-200">
            <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
            <dd className="mt-1 text-2xl font-bold text-gray-900 capitalize">
              {report.summary?.status?.replace('_', ' ') || 'Unknown'}
            </dd>
          </div>
        </div>
      </div>

      {/* Code Viewer Section */}
      {showCode && report.codeContent && (
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden mb-8 no-print">
          <div className="px-4 py-2 bg-gray-800 flex justify-between items-center">
            <span className="text-xs font-mono text-gray-400">SOURCE CODE: {report.fileName}</span>
            <button onClick={() => setShowCode(false)} className="text-gray-400 hover:text-white text-xs">Close</button>
          </div>
          <div className="p-4 overflow-auto max-h-[500px]">
            <pre className="text-sm font-mono text-gray-300 leading-relaxed">
              {report.codeContent.split('\n').map((line, i) => (
                <div key={i} className="flex">
                  <span className="w-10 text-gray-600 text-right mr-4 select-none">{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}

      {/* Code Smells Section */}
      {report.codeSmells && report.codeSmells.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Code Smells</h2>
          <div className="space-y-4">
            {report.codeSmells.map((smell, index) => (
              <div key={index} className="bg-white shadow rounded-lg border border-transparent print:border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xl">{getSmellTypeIcon(smell.type)}</span>
                        <h4 className="font-bold text-gray-900 capitalize">
                          {smell.type.replace('_', ' ')}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getSeverityColor(smell.severity)}`}>
                          {smell.severity}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{smell.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3 font-mono bg-gray-50 p-2 rounded">
                        <span>LINE: {smell.location?.line}</span>
                        {smell.location?.functionName && <span>FUNC: {smell.location.functionName}</span>}
                        {smell.location?.className && <span>CLASS: {smell.location.className}</span>}
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 print:bg-white print:border-gray-200">
                        <p className="text-xs font-bold text-blue-900 mb-1">💡 RECOMMENDATION:</p>
                        <p className="text-sm text-blue-800">{smell.suggestion}</p>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-xs text-gray-400 uppercase">Value</p>
                      <p className="text-xl font-bold text-gray-900">{smell.metricValue}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {report.metrics && report.metrics.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Metrics</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {report.metrics.map((metric, index) => (
              <div key={index} className="bg-white p-4 shadow rounded-lg border border-transparent print:border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">{metric.name.replace('_', ' ')}</p>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-400">Limit: {metric.threshold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center text-gray-400 text-xs no-print">
        <p>Advanced Code Smell Detection System © 2026</p>
      </div>
      <div className="hidden print:block mt-12 text-center text-gray-400 text-xs border-t pt-4">
        <p>This report was automatically generated by the Code Smell Detector System.</p>
        <p>Report ID: {reportId}</p>
      </div>
    </div>
  )
}

export default ReportDetail
