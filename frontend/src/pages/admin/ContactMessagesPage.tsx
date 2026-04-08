import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import Header from '../../components/Header'
import { Mail, Phone, Calendar, Eye, Archive, Trash2, RefreshCw, Filter, MessageSquare } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface ContactMessage {
  id: number
  full_name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'new' | 'read' | 'archived'
  created_at: string
  updated_at: string
}

interface ContactStats {
  total: number
  new: number
  read: number
  archived: number
}

export default function ContactMessagesPage() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/dashboard')
      return
    }
    loadMessages()
    loadStats()
  }, [user, navigate, statusFilter])

  const loadMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const filterParam = statusFilter !== 'all' ? `?status_filter=${statusFilter}` : ''
      const response = await axios.get(`${API_URL}/contact/admin/messages${filterParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/contact/admin/messages/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  const updateStatus = async (messageId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${API_URL}/contact/admin/messages/${messageId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      loadMessages()
      loadStats()
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus as any })
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status')
    }
  }

  const deleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/contact/admin/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      loadMessages()
      loadStats()
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete message')
    }
  }

  const handleMessageClick = (message: ContactMessage) => {
    setSelectedMessage(message)
    if (message.status === 'new') {
      updateStatus(message.id, 'read')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 text-green-700'
      case 'read':
        return 'bg-blue-100 text-blue-700'
      case 'archived':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
              <p className="text-gray-600 mt-1">Manage contact form submissions</p>
            </div>
            <button
              onClick={() => {
                loadMessages()
                loadStats()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-green-600">{stats.new}</div>
                <div className="text-sm text-gray-600">New</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-blue-600">{stats.read}</div>
                <div className="text-sm text-gray-600">Read</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
                <div className="text-sm text-gray-600">Archived</div>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Messages</option>
              <option value="new">New Only</option>
              <option value="read">Read Only</option>
              <option value="archived">Archived Only</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading messages...</p>
          </div>
        )}

        {/* Messages Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messages List */}
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages</h3>
                  <p className="text-gray-600">No contact messages found.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition hover:shadow-md ${
                      selectedMessage?.id === message.id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-100'
                    } ${message.status === 'new' ? 'bg-green-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{message.full_name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{message.subject}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(message.status)}`}>
                        {message.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {message.email}
                      </div>
                      {message.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {message.phone}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">{message.message}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Detail */}
            <div className="lg:sticky lg:top-24 h-fit">
              {selectedMessage ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <h2 className="text-xl font-bold mb-2">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2 text-blue-100">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedMessage.created_at)}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="font-medium">Name:</span>
                          {selectedMessage.full_name}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                            {selectedMessage.email}
                          </a>
                        </div>
                        {selectedMessage.phone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                              {selectedMessage.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Message</h3>
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {selectedMessage.status !== 'read' && (
                        <button
                          onClick={() => updateStatus(selectedMessage.id, 'read')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                          Mark as Read
                        </button>
                      )}
                      
                      {selectedMessage.status !== 'archived' && (
                        <button
                          onClick={() => updateStatus(selectedMessage.id, 'archived')}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      )}
                      
                      {selectedMessage.status === 'archived' && (
                        <button
                          onClick={() => updateStatus(selectedMessage.id, 'read')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Unarchive
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Message Selected</h3>
                  <p className="text-gray-600">Select a message from the list to view details.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
