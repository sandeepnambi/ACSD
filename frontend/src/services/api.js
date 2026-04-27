import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    
    if (response?.status === 401) {
      // Don't redirect if it's a login or register request
      const isAuthPath = config.url.includes('/auth/login') || config.url.includes('/auth/register');
      console.log('Interceptor 401 check:', { url: config.url, isAuthPath });
      
      if (!isAuthPath) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
}

// Analysis API
export const analysisAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post('/analysis/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      },
    })
  },
  analyzeCode: (fileData) => api.post('/analysis/analyze', fileData),
  getAnalysisStatus: (analysisId) => api.get(`/analysis/status/${analysisId}`),
}

// Reports API
export const reportsAPI = {
  getReports: (params) => api.get('/reports', { params }),
  getReport: (reportId) => api.get(`/reports/${reportId}`),
  deleteReport: (reportId) => api.delete(`/reports/${reportId}`),
  exportReport: (reportId, format) => api.get(`/reports/${reportId}/export`, {
    params: { format },
    responseType: 'blob',
  }),
  getReportStats: () => api.get('/reports/stats/overview'),
}

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getSmellRules: () => api.get('/admin/smell-rules'),
  updateSmellRule: (ruleId, ruleData) => api.put(`/admin/smell-rules/${ruleId}`, ruleData),
  getAllReports: (params) => api.get('/admin/reports', { params }),
  deleteReport: (reportId) => api.delete(`/admin/reports/${reportId}`),
  getSystemStats: () => api.get('/admin/stats'),
}

// Utility function to handle file uploads
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  return api.post('/analysis/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    },
  })
}

// Utility function to download files
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    })

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = blobUrl
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

export default api
