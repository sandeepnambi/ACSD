import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  CodeBracketIcon,
  TrophyIcon,
  FlagIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    technicalSkills: user?.technicalSkills?.join(', ') || '',
    codingProfiles: user?.codingProfiles || []
  })

  const addCodingProfile = () => {
    setProfileForm({
      ...profileForm,
      codingProfiles: [...profileForm.codingProfiles, { title: '', link: '' }]
    })
  }

  const removeCodingProfile = (index) => {
    const newProfiles = [...profileForm.codingProfiles]
    newProfiles.splice(index, 1)
    setProfileForm({
      ...profileForm,
      codingProfiles: newProfiles
    })
  }

  const updateCodingProfile = (index, field, value) => {
    const newProfiles = [...profileForm.codingProfiles]
    newProfiles[index][field] = value
    setProfileForm({
      ...profileForm,
      codingProfiles: newProfiles
    })
  }

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = await updateProfile({
      ...profileForm,
      technicalSkills: profileForm.technicalSkills.split(',').map(s => s.trim()).filter(s => s !== '')
    })
    
    if (result.success) {
      setMessage('Profile updated successfully!')
    } else {
      setMessage(result.error)
    }
    
    setLoading(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match')
      return
    }

    setLoading(true)
    setMessage('')

    const result = await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    if (result.success) {
      setMessage('Password changed successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } else {
      setMessage(result.error)
    }
    
    setLoading(false)
  }

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ]

  return (
    <div className="px-4 py-8 sm:px-0 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your personal information, technical presence, and security.
        </p>
      </div>

      <div className="bg-white shadow-xl shadow-blue-900/5 rounded-3xl overflow-hidden border border-gray-100">
        {/* Tab Navigation */}
        <div className="bg-gray-50/50 border-b border-gray-200 p-2">
          <nav className="flex space-x-2" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                } whitespace-nowrap py-2.5 px-6 rounded-2xl font-semibold text-sm flex items-center transition-all duration-200`}
              >
                <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center border ${
              message.includes('success') 
                ? 'bg-green-50 text-green-800 border-green-100' 
                : 'bg-red-50 text-red-800 border-red-100'
            } animate-in fade-in slide-in-from-top-4 duration-300`}>
              <div className="mr-3">
                {message.includes('success') ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                )}
              </div>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm text-gray-900 font-medium border-2"
                      placeholder="Your username"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profileForm.email}
                      readOnly
                      className="block w-full pl-11 pr-4 py-3 bg-gray-100 border-transparent rounded-2xl cursor-not-allowed sm:text-sm text-gray-500 font-medium border-2"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 ml-1">Email cannot be changed once verified.</p>
                </div>
              </div>

              {/* Technical Skills */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Expertise & Skills</h3>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={profileForm.technicalSkills}
                    onChange={(e) => setProfileForm({...profileForm, technicalSkills: e.target.value})}
                    placeholder="e.g. JavaScript, React, Node.js, Python, C++, Java"
                    className="block w-full px-5 py-4 bg-gray-50 border-gray-200 border-2 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm shadow-sm"
                  />
                  <p className="text-xs text-gray-500 ml-1">Separate skills with commas. These will be highlighted in your reports.</p>
                </div>
              </div>

              {/* Coding Profiles */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CodeBracketIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Developer Presence</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addCodingProfile}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100"
                  >
                    <PlusIcon className="w-4 h-4 mr-1.5" />
                    Add Platform
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {profileForm.codingProfiles.map((profile, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-blue-200 hover:bg-blue-50/20 transition-all">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={profile.title}
                          onChange={(e) => updateCodingProfile(index, 'title', e.target.value)}
                          placeholder="Platform (e.g. LeetCode)"
                          className="block w-full px-4 py-2 bg-white border-gray-200 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm shadow-sm font-semibold"
                        />
                        <input
                          type="url"
                          value={profile.link}
                          onChange={(e) => updateCodingProfile(index, 'link', e.target.value)}
                          placeholder="Profile URL"
                          className="sm:col-span-2 block w-full px-4 py-2 bg-white border-gray-200 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm shadow-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCodingProfile(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {profileForm.codingProfiles.length === 0 && (
                    <div className="text-center py-8 bg-gray-50/30 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400 font-medium">No external profiles linked yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-3 px-10 border border-transparent shadow-lg shadow-blue-600/20 text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? <LoadingSpinner size="small" /> : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-8">
              <div className="max-w-md mx-auto space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-3xl mb-4">
                    <ShieldCheckIcon className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Update Credentials</h3>
                  <p className="text-sm text-gray-500">Ensure your account stays secure with a strong password.</p>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                      className="block w-full px-5 py-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                      minLength="8"
                      className="block w-full px-5 py-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium"
                      placeholder="New strong password"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                      minLength="8"
                      className="block w-full px-5 py-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm font-medium"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-lg shadow-blue-600/20 text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {loading ? <LoadingSpinner size="small" /> : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
