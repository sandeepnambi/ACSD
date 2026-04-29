import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    specialChar: false,
    number: false
  })
  const [emailCriteria, setEmailCriteria] = useState({
    domain: false
  })
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setGeneralError('')
    setFormData({
      ...formData,
      [name]: value
    })

    if (name === 'password') {
      validatePassword(value)
    }

    if (name === 'email') {
      setEmailCriteria({
        domain: value.endsWith('@gmail.com')
      })
    }
  }

  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      specialChar: /[!@#$%^&*]/.test(password),
      number: /[0-9]/.test(password)
    })
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@gmail\.com$/.test(formData.email)) {
      newErrors.email = 'Only @gmail.com email addresses are allowed'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const isPasswordValid = 
        passwordCriteria.length && 
        passwordCriteria.uppercase && 
        passwordCriteria.lowercase && 
        passwordCriteria.specialChar && 
        passwordCriteria.number

      if (!isPasswordValid) {
        newErrors.password = 'Password does not meet all requirements'
      }
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password
    })
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setGeneralError(result.error || 'Registration failed. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: 'url("/auth-bg.png")' }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 to-black/60"></div>

      <div className="max-w-2xl w-full space-y-8 p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl z-10 relative border border-white/20">
        <div>
          <div className="flex justify-center">
             <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
             </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the Advanced Code Smell Detection community
          </p>
        </div>
        
        {generalError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-shake">
            <p className="text-sm font-medium text-red-800">{generalError}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                <input
                  name="username"
                  type="text"
                  required
                  className={`appearance-none block w-full px-4 py-3 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm`}
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className={`appearance-none block w-full px-4 py-3 border ${errors.email || !emailCriteria.domain ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm`}
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <div className="mt-2 text-xs flex items-center space-x-2">
                  <RequirementItem 
                    met={emailCriteria.domain} 
                    text="Must be a @gmail.com address" 
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className={`appearance-none block w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className={`appearance-none block w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm`}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div className="sm:col-span-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Security Requirements</p>
             </div>
             <RequirementItem met={passwordCriteria.length} text="Min. 8 characters" />
             <RequirementItem met={passwordCriteria.uppercase} text="Uppercase letter" />
             <RequirementItem met={passwordCriteria.lowercase} text="Lowercase letter" />
             <RequirementItem met={passwordCriteria.number} text="Number" />
             <RequirementItem met={passwordCriteria.specialChar} text="Special char (!@#$)" />
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Already have an account? Sign in
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={
                loading || 
                !passwordCriteria.length || 
                !passwordCriteria.uppercase || 
                !passwordCriteria.lowercase || 
                !passwordCriteria.number || 
                !passwordCriteria.specialChar ||
                !emailCriteria.domain
              }
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const RequirementItem = ({ met, text }) => (
  <div className={`flex items-center space-x-2 transition-colors duration-200 ${met ? 'text-green-600' : 'text-gray-400'}`}>
    {met ? (
      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <div className="h-4 w-4 flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-current" />
      </div>
    )}
    <span className={met ? 'font-medium' : ''}>{text}</span>
  </div>
)

export default Register
