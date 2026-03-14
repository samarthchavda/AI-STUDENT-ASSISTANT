import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { adminAPI, AdminStats, AdminUser, AdminChat, AdminPayment, AdminProgress, CompanyQuestion } from '../services/adminAPI';
import Header from '../components/Header';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'chats' | 'payments' | 'progress' | 'company-questions'>('stats');
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [progress, setProgress] = useState<AdminProgress[]>([]);
  const [companyQuestions, setCompanyQuestions] = useState<CompanyQuestion[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load stats. You may not have admin access.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllChats();
      setChats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllProgress();
      setProgress(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllCompanyQuestions();
      setCompanyQuestions(data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/auth');
        return;
      }
      setError(err.response?.data?.detail || err.message || 'Failed to load company questions');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setError(null);
    
    switch (tab) {
      case 'stats':
        loadStats();
        break;
      case 'users':
        loadUsers();
        break;
      case 'chats':
        loadChats();
        break;
      case 'payments':
        loadPayments();
        break;
      case 'progress':
        loadProgress();
        break;
      case 'company-questions':
        loadCompanyQuestions();
        break;
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setUploadProgress('Uploading...');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const result = await adminAPI.bulkUploadCompanyQuestions(formData);
      setUploadResult(result);
      setUploadProgress(null);
      setUploadFile(null);
      
      // Reload questions after successful upload
      setTimeout(() => {
        loadCompanyQuestions();
      }, 1000);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/auth');
        return;
      }
      setError(err.response?.data?.detail || err.message || 'Failed to upload file');
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage and view all application data</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange('stats')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Statistics
              </button>
              <button
                onClick={() => handleTabChange('users')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 Users
              </button>
              <button
                onClick={() => handleTabChange('chats')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'chats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💬 Chats
              </button>
              <button
                onClick={() => handleTabChange('payments')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💳 Payments
              </button>
              <button
                onClick={() => handleTabChange('progress')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Progress
              </button>
              <button
                onClick={() => handleTabChange('company-questions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'company-questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏢 Company Questions
              </button>
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && stats && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-blue-600 mb-2">Free Users</h3>
              <p className="text-3xl font-bold text-blue-900">{stats.free_users}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-green-600 mb-2">Basic Users</h3>
              <p className="text-3xl font-bold text-green-900">{stats.basic_users}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-purple-600 mb-2">Pro Users</h3>
              <p className="text-3xl font-bold text-purple-900">{stats.pro_users}</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-orange-600 mb-2">Google OAuth Users</h3>
              <p className="text-3xl font-bold text-orange-900">{stats.google_users}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Regular Users</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.regular_users}</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-indigo-600 mb-2">Total Chats</h3>
              <p className="text-3xl font-bold text-indigo-900">{stats.total_chats}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-green-600 mb-2">Total Payments</h3>
              <p className="text-3xl font-bold text-green-900">{stats.total_payments}</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-yellow-600 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-yellow-900">
                {formatCurrency(stats.total_revenue, 'INR')}
              </p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auth Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                          user.plan === 'basic' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.is_google_user ? '🔐 Google' : '🔑 Password'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.is_admin ? '✅ Yes' : '❌ No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}

        {/* Chats Tab */}
        {activeTab === 'chats' && !loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chats.map((chat) => (
                    <tr key={chat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {chat.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">{chat.user_name}</div>
                        <div className="text-gray-500">{chat.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          chat.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {chat.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                        {chat.content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(chat.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {chats.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No chat history found
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && !loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">{payment.user_name}</div>
                        <div className="text-gray-500">{payment.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {payment.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.payment_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(payment.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {payments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No payments found
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && !loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {progress.map((prog) => (
                    <tr key={prog.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prog.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">{prog.user_name}</div>
                        <div className="text-gray-500">{prog.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prog.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {prog.topic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          prog.score >= 80 ? 'bg-green-100 text-green-800' :
                          prog.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prog.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(prog.completed_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {progress.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No progress data found
              </div>
            )}
          </div>
        )}

        {/* Company Questions Tab */}
        {activeTab === 'company-questions' && (
          <div>
            {/* Bulk Upload Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">📁 Bulk Upload Interview Questions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Form */}
                <div>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        if (e.target.files) {
                          setUploadFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <div className="text-4xl mb-2">📄</div>
                      <div className="text-sm text-blue-700 font-medium">
                        {uploadFile ? uploadFile.name : 'Click to select CSV file'}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Upload company questions in CSV format
                      </div>
                    </label>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleFileUpload}
                      disabled={!uploadFile || loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium transition"
                    >
                      {uploadProgress ? 'Uploading...' : '✅ Upload Questions'}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3">📋 CSV Format:</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>✅ <span className="font-mono bg-gray-100 px-2 py-1 rounded">company,role,question,type</span></li>
                    <li>✅ <span className="font-mono bg-gray-100 px-2 py-1 rounded">Microsoft,Software Engineer,Explain REST API,technical</span></li>
                    <li>✅ Required columns: <span className="font-mono bg-gray-100 px-2 py-1 rounded">company</span> and <span className="font-mono bg-gray-100 px-2 py-1 rounded">question</span></li>
                    <li>✅ Optional columns: <span className="font-mono bg-gray-100 px-2 py-1 rounded">category</span>, <span className="font-mono bg-gray-100 px-2 py-1 rounded">difficulty</span>, <span className="font-mono bg-gray-100 px-2 py-1 rounded">topic</span>, <span className="font-mono bg-gray-100 px-2 py-1 rounded">year</span></li>
                    <li>📌 Duplicate company + question rows increase frequency</li>
                  </ul>
                </div>
              </div>

              {/* Upload Result */}
              {uploadResult && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Upload Successful!</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{uploadResult.added_new}</div>
                      <div className="text-green-700">New Questions Added</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{uploadResult.updated_existing || 0}</div>
                      <div className="text-blue-700">Updated (Duplicates)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{uploadResult.skipped}</div>
                      <div className="text-yellow-700">Skipped</div>
                    </div>
                  </div>
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">⚠️ Errors encountered:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {uploadResult.errors.slice(0, 3).map((err: string, idx: number) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Questions Table */}
            {!loading && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    📚 Interview Questions Database
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({companyQuestions.length} questions)
                    </span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Difficulty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companyQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {q.company_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate">
                            {q.question_text}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {q.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {q.topic}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {q.frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {q.year_asked || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {companyQuestions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No company questions found. <br />
                    Upload a CSV file to get started.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
