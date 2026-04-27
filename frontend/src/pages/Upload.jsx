import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { analysisAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { 
  CloudArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const Upload = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError('')
    setUploadResult(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      const response = await analysisAPI.uploadFile(file, (progress) => {
        setUploadProgress(progress)
      })

      setUploadResult(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-python': ['.py'],
      'text/x-java-source': ['.java'],
      'text/x-c++src': ['.cpp', '.hpp', '.cxx', '.hxx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  })

  const handleAnalyze = async () => {
    if (!uploadResult) return

    setUploading(true)
    try {
      const response = await analysisAPI.analyzeCode({
        fileId: uploadResult.file.filename,
        fileName: uploadResult.file.originalname,
        language: uploadResult.file.language
      })

      // Navigate to reports page with the analysis result
      navigate('/reports', { 
        state: { 
          analysisResult: response.data,
          fileInfo: uploadResult.file
        } 
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Code</h1>
        <p className="mt-2 text-gray-600">
          Upload your code file to analyze for smells. Supported languages: Python, Java, and C++.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-4">
              <LoadingSpinner size="large" />
              <p className="text-lg font-medium text-gray-900">
                Uploading file...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{uploadProgress}%</p>
            </div>
          ) : (
            <div className="space-y-4">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your file here' : 'Drop your code file here'}
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse
                </p>
              </div>
                <p className="text-xs text-gray-500">
                  Supported formats: .py, .java, .cpp (Max 10MB)
                </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
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

      {/* Upload Result */}
      {uploadResult && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">File Uploaded Successfully</h3>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <DocumentIcon className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{uploadResult.file.originalname}</p>
                <p className="text-sm text-gray-500">
                  {(uploadResult.file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={uploading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Analyzing...</span>
              </>
            ) : (
              'Analyze Code'
            )}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">How it works</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Upload your source code file (supports Python, Java, and C++)</li>
          <li>Our system will analyze the code using static analysis techniques</li>
          <li>We'll detect common code smells like long methods, large classes, and duplicate code</li>
          <li>You'll receive a detailed report with suggestions for improvement</li>
        </ol>
      </div>
    </div>
  )
}

export default Upload
