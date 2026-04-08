import { useState, useEffect } from 'react'
import { Lock, Unlock, Save } from 'lucide-react'
import Header from '../../components/Header'

interface CompanyExamSetting {
  id: number
  company_key: string
  company_name: string
  is_unlocked: boolean
  difficulty: string
  plan_requirement: string
  updated_at: string
}

export default function CompanyExamControlPage() {
  const [settings, setSettings] = useState<CompanyExamSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/company-exam-settings`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings || [])
      } else {
        setMessage({ type: 'error', text: 'Failed to load settings' })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      setMessage({ type: 'error', text: 'Error loading settings' })
    } finally {
      setLoading(false)
    }
  }

  const toggleUnlock = async (companyKey: string, currentStatus: boolean) => {
    setSaving(companyKey)
    setMessage(null)
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/company-exam-settings/${companyKey}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_unlocked: !currentStatus })
        }
      )
      
      if (res.ok) {
        // Update local state
        setSettings(settings.map(s => 
          s.company_key === companyKey 
            ? { ...s, is_unlocked: !currentStatus }
            : s
        ))
        setMessage({ 
          type: 'success', 
          text: `${settings.find(s => s.company_key === companyKey)?.company_name} exam ${!currentStatus ? 'unlocked' : 'locked'} successfully` 
        })
      } else {
        setMessage({ type: 'error', text: 'Failed to update setting' })
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      setMessage({ type: 'error', text: 'Error updating setting' })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Exam Access Control</h1>
          <p className="text-gray-600">Lock or unlock company exams globally for all users</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Settings Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading settings...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Company / Exam</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Difficulty</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Plan</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-500">
                        No company exams configured
                      </td>
                    </tr>
                  ) : (
                    settings.map((setting) => (
                      <tr key={setting.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{setting.company_name}</div>
                          <div className="text-sm text-gray-500">{setting.company_key}</div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            setting.difficulty === 'Easy' 
                              ? 'bg-green-100 text-green-700'
                              : setting.difficulty === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {setting.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium uppercase">
                            {setting.plan_requirement}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {setting.is_unlocked ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <Unlock className="w-5 h-5" />
                              <span className="font-semibold">Unlocked</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-red-600">
                              <Lock className="w-5 h-5" />
                              <span className="font-semibold">Locked</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => toggleUnlock(setting.company_key, setting.is_unlocked)}
                            disabled={saving === setting.company_key}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              setting.is_unlocked
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {saving === setting.company_key ? (
                              'Saving...'
                            ) : setting.is_unlocked ? (
                              'Lock Exam'
                            ) : (
                              'Unlock Exam'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Unlocked:</strong> All users can access this exam (subject to their attempt limits)</li>
            <li>• <strong>Locked:</strong> Exam is hidden from all users globally</li>
            <li>• Per-user attempt limits (2 attempts) remain active regardless of lock status</li>
            <li>• Changes take effect immediately for all users</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
