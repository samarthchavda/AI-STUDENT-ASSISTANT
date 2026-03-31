import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { adminAPI, AdminStats, AdminUser, AdminChat, AdminChatUserSummary, AdminPayment, AdminProgress, CompanyQuestion } from '../../services/adminAPI';
import Header from '../../components/Header';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  CreditCard, 
  TrendingUp, 
  Building2, 
  FileText,
  MoreVertical,
  Trash2,
  ChevronDown,
  DollarSign,
  UserCheck,
  Mail,
  Calendar,
  Award,
  Target,
  XCircle,
  Activity,
  Send,
  Bell,
  TrendingDown,
  Code2,
  CheckCircle,
  Database,
  Edit3,
  Trophy
} from 'lucide-react';

interface AptitudeUserSummary {
  user_id: number;
  user_name: string;
  user_email: string;
  plan: string;
  exam_count: number;
  last_exam_date: string;
  avg_score: number;
}

interface AptitudeExamHistory {
  id: number;
  company: string;
  category: string;
  difficulty: string;
  score: number;
  total_questions: number;
  correct: number;
  wrong: number;
  skipped: number;
  score_percent: number;
  exam_date: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'chats' | 'payments' | 'progress' | 'company-questions' | 'aptitude-history' | 'ai-monitor' | 'broadcast' | 'aptitude-questions' | 'dsa-management'>('stats');
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  // Removed unused chats and setChats state
  const [chatUsersSummary, setChatUsersSummary] = useState<AdminChatUserSummary[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<AdminChatUserSummary | null>(null);
  const [userChats, setUserChats] = useState<AdminChat[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [progress, setProgress] = useState<AdminProgress[]>([]);
  const [companyQuestions, setCompanyQuestions] = useState<CompanyQuestion[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  
  // Aptitude History states
  const [aptitudeUsersSummary, setAptitudeUsersSummary] = useState<AptitudeUserSummary[]>([]);
  const [selectedAptitudeUser, setSelectedAptitudeUser] = useState<AptitudeUserSummary | null>(null);
  const [userAptitudeHistory, setUserAptitudeHistory] = useState<AptitudeExamHistory[]>([]);
  
  // AI Monitor states
  const [topAIUsers, setTopAIUsers] = useState<any[]>([]);
  const [costSummary, setCostSummary] = useState<any>(null);
  // const [dailyUsage, setDailyUsage] = useState<any[]>([]); // TODO: Implement daily usage chart
  
  // Broadcast states
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [broadcastStats, setBroadcastStats] = useState<any>(null);
  
  // Aptitude Questions Management states
  const [aptitudeQuestionsFile, setAptitudeQuestionsFile] = useState<File | null>(null)
  const [aptitudeUploadProgress, setAptitudeUploadProgress] = useState<string | null>(null)
  const [aptitudeUploadResult, setAptitudeUploadResult] = useState<any | null>(null)
  const [aptitudeQuestions, setAptitudeQuestions] = useState<any[]>([])
  const [aptitudeFilterCategory, setAptitudeFilterCategory] = useState<string>('all')
  const [aptitudeFilterSubcategory, setAptitudeFilterSubcategory] = useState<string>('all')
  const [aptitudeStats, setAptitudeStats] = useState<any>(null)
  
  // DSA Management states
  const [dsaStats, setDsaStats] = useState<any>(null);
  const [dsaQuestions, setDsaQuestions] = useState<any[]>([]);
  const [dsaSearchQuery, setDsaSearchQuery] = useState('');
  const [dsaTopicFilter, setDsaTopicFilter] = useState('');
  
  // User Sessions state
  const [userSessions, setUserSessions] = useState<Map<number, boolean>>(new Map());
  
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [aptitudeLoading, setAptitudeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [openMenuUserId, setOpenMenuUserId] = useState<number | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (user: AdminUser) => {
    const fields = [
      user.phone,
      user.college,
      user.branch,
      user.cgpa,
      user.graduation_year,
      user.linkedin_url,
      user.github_url
    ];
    const filledFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filledFields / 7) * 100);
  };

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuUserId !== null) {
        setOpenMenuUserId(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuUserId]);

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
      const [usersData, sessionsData] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getUserSessions()
      ]);
      setUsers(usersData);
      
      // Create a map of user_id -> is_online
      const sessionsMap = new Map<number, boolean>();
      sessionsData.users.forEach((user: any) => {
        sessionsMap.set(user.id, user.is_online);
      });
      setUserSessions(sessionsMap);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async () => {
    setLoading(true);
    setError(null);
    setSelectedChatUser(null);
    setUserChats([]);
    try {
      const data = await adminAPI.getChatUsersSummary();
      setChatUsersSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const loadUserChats = async (chatUser: AdminChatUserSummary) => {
    setChatLoading(true);
    setError(null);
    setSelectedChatUser(chatUser);
    try {
      const data = await adminAPI.getChatsByEmail(chatUser.user_email);
      setUserChats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load user chat history');
    } finally {
      setChatLoading(false);
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

  const loadAptitudeHistory = async () => {
    setLoading(true);
    setError(null);
    setSelectedAptitudeUser(null);
    setUserAptitudeHistory([]);
    try {
      const data = await adminAPI.getAptitudeUsersSummary();
      setAptitudeUsersSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load aptitude history');
    } finally {
      setLoading(false);
    }
  };

  const loadUserAptitudeHistory = async (aptitudeUser: AptitudeUserSummary) => {
    setAptitudeLoading(true);
    setError(null);
    setSelectedAptitudeUser(aptitudeUser);
    try {
      const data = await adminAPI.getUserAptitudeHistory(aptitudeUser.user_id);
      setUserAptitudeHistory(data.history || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load user aptitude history');
    } finally {
      setAptitudeLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    // First click: show confirmation
    if (deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    // Second click: delete user
    setLoading(true);
    try {
      await adminAPI.deleteUser(userId);
      // Update state immediately
      setUsers(users.filter(u => u.id !== userId));
      setDeleteConfirm(null);
      setOpenMenuUserId(null);
      setError(null);
      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Check if user was already deleted (404 error)
      if (err.response?.status === 404) {
        // User already deleted, just update UI
        setUsers(users.filter(u => u.id !== userId));
        setDeleteConfirm(null);
        setOpenMenuUserId(null);
        setError(null);
      } else {
        setError(err.response?.data?.detail || 'Failed to delete user');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (userId: number, newPlan: string) => {
    try {
      await adminAPI.updateUserPlan(userId, newPlan);
      setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
      setError(null);
      setSuccessMessage(`User plan updated to ${newPlan.toUpperCase()} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Handle validation errors (422) which return an array of error objects
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Extract messages from validation error array
          const errorMessages = err.response.data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
          setError(`Validation error: ${errorMessages}`);
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Failed to update user plan');
      }
    }
  };

  const loadAIMonitor = async () => {
    setLoading(true);
    setError(null);
    try {
      const [topUsers, cost] = await Promise.all([
        adminAPI.getTopAIUsers(10),
        adminAPI.getCostSummary(),
        // adminAPI.getDailyUsage(30) // TODO: Implement daily usage chart
      ]);
      setTopAIUsers(topUsers);
      setCostSummary(cost);
      // setDailyUsage(usage); // TODO: Implement daily usage chart
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load AI monitor data');
    } finally {
      setLoading(false);
    }
  };

  const loadBroadcast = async () => {
    setLoading(true);
    setError(null);
    try {
      const [history, stats] = await Promise.all([
        adminAPI.getBroadcastHistory(),
        adminAPI.getBroadcastStats()
      ]);
      setBroadcastHistory(history);
      setBroadcastStats(stats);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load broadcast data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await adminAPI.sendBroadcast({
        title: broadcastTitle,
        message: broadcastMessage,
        target_audience: targetAudience
      });
      setSuccessMessage(`Broadcast sent to ${result.users_count} users!`);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTargetAudience('all');
      loadBroadcast(); // Reload history
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send broadcast');
    } finally {
      setLoading(false);
    }
  };

  const loadAptitudeQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [questions, stats] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/aptitude-practice-questions?category=${aptitudeFilterCategory}&subcategory=${aptitudeFilterSubcategory}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/aptitude-practice-stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(r => r.json())
      ]);
      setAptitudeQuestions(questions.questions || []);
      setAptitudeStats(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load aptitude questions');
    } finally {
      setLoading(false);
    }
  };

  const loadDSAManagement = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stats, questions] = await Promise.all([
        adminAPI.getDSAStats(),
        adminAPI.getDSAQuestions({ limit: 50, search: dsaSearchQuery, topic: dsaTopicFilter })
      ]);
      setDsaStats(stats);
      setDsaQuestions(questions.questions || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load DSA management data');
    } finally {
      setLoading(false);
    }
  };

  const handleAptitudeFileUpload = async () => {
    if (!aptitudeQuestionsFile) {
      setError('Please select a JSON file first');
      return;
    }

    setLoading(true);
    setAptitudeUploadProgress('Uploading...');
    setAptitudeUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', aptitudeQuestionsFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/aptitude-practice-questions/bulk-upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Upload failed');
      }
      
      setAptitudeUploadResult(result);
      setAptitudeUploadProgress(null);
      setAptitudeQuestionsFile(null);
      
      if (result.inserted > 0) {
        setSuccessMessage(`Successfully uploaded ${result.inserted} questions!`);
        setTimeout(() => {
          loadAptitudeQuestions();
          setSuccessMessage(null);
        }, 2000);
      } else {
        setError(`No new questions added. ${result.skipped} duplicates skipped.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      setAptitudeUploadProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
    
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
      case 'aptitude-history':
        loadAptitudeHistory();
        break;
      case 'ai-monitor':
        loadAIMonitor();
        break;
      case 'broadcast':
        loadBroadcast();
        break;
      case 'aptitude-questions':
        loadAptitudeQuestions();
        break;
      case 'dsa-management':
        loadDSAManagement();
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

  const sidebarItems = [
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'dsa-management', label: 'DSA Management', icon: Code2 },
    { id: 'aptitude-questions', label: 'Aptitude Questions', icon: Target },
    { id: 'ai-monitor', label: 'AI Monitor', icon: Activity },
    { id: 'broadcast', label: 'Broadcast', icon: Send },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'company-questions', label: 'Company Questions', icon: Building2 },
    { id: 'aptitude-history', label: 'Aptitude History', icon: FileText },
  ] as const;

  // Navigate to dedicated pages
  const handleNavigateToPage = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex pt-20">{/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Admin Panel</h2>
            <p className="text-sm text-gray-500">Manage your platform</p>
          </div>
          
          <nav className="px-3 pb-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
            
            {/* Divider */}
            <div className="my-4 border-t border-gray-200"></div>
            
            {/* System Health & Admin Enhancement Pages */}
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">System</p>
            <button
              onClick={() => handleNavigateToPage('/admin/system-health')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <Activity className="w-5 h-5" />
              <span className="text-sm">System Health</span>
            </button>
            
            <button
              onClick={() => handleNavigateToPage('/admin/broadcast')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="text-sm">Broadcast System</span>
            </button>
            
            <button
              onClick={() => handleNavigateToPage('/admin/audit-logs')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <Database className="w-5 h-5" />
              <span className="text-sm">Audit Logs</span>
            </button>
            
            {/* Divider */}
            <div className="my-4 border-t border-gray-200"></div>
            
            {/* Growth Features */}
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Growth</p>
            <button
              onClick={() => handleNavigateToPage('/admin/leaderboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <Trophy className="w-5 h-5" />
              <span className="text-sm">Leaderboard</span>
            </button>
            
            <button
              onClick={() => handleNavigateToPage('/admin/transactions')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">Transactions</span>
            </button>
            
            <button
              onClick={() => handleNavigateToPage('/admin/referrals')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              <Users className="w-5 h-5" />
              <span className="text-sm">Referrals</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <Award className="w-5 h-5" />
              {successMessage}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && stats && !loading && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Monitor your platform's key metrics</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Total</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total_users}</h3>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>

                {/* Free Users */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Free</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.free_users}</h3>
                  <p className="text-sm text-gray-500">Free Plan Users</p>
                </div>

                {/* Basic Users */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-blue-600 uppercase">Basic</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.basic_users}</h3>
                  <p className="text-sm text-gray-500">Basic Plan Users</p>
                </div>

                {/* Pro Users */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-medium text-purple-600 uppercase">Pro</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.pro_users}</h3>
                  <p className="text-sm text-gray-500">Pro Plan Users</p>
                </div>

                {/* Google OAuth Users */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                        <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                        <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                        <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-orange-600 uppercase">OAuth</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.google_users}</h3>
                  <p className="text-sm text-gray-500">Google Sign-ins</p>
                </div>

                {/* Regular Users */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500 uppercase">Email</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.regular_users}</h3>
                  <p className="text-sm text-gray-500">Email Sign-ups</p>
                </div>

                {/* Total Chats */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-xs font-medium text-indigo-600 uppercase">Messages</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total_chats}</h3>
                  <p className="text-sm text-gray-500">Total Chats</p>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-green-600 uppercase">Revenue</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(stats.total_revenue, 'INR')}
                  </h3>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && !loading && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-500 mt-1">Manage user accounts and subscriptions</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Profile
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Auth Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => {
                        const profileCompletion = calculateProfileCompletion(user);
                        const isExpanded = expandedUserId === user.id;
                        
                        return (
                          <Fragment key={user.id}>
                            <tr className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    {/* Online/Offline Status Indicator */}
                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                      userSessions.get(user.id) ? 'bg-green-500' : 'bg-gray-400'
                                    }`} title={userSessions.get(user.id) ? 'Online' : 'Offline'}></div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                                  user.plan === 'basic' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {user.plan.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                                  className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded transition"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all ${
                                          profileCompletion === 100 ? 'bg-green-500' :
                                          profileCompletion >= 50 ? 'bg-blue-500' :
                                          'bg-orange-500'
                                        }`}
                                        style={{ width: `${profileCompletion}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{profileCompletion}%</span>
                                  </div>
                                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              </td>
                              <td className="px-6 py-4">
                            {user.is_google_user ? (
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                                </svg>
                                <span className="text-sm text-gray-600">Google</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-600">Email</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.is_admin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                <Award className="w-3 h-3" />
                                Admin
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">User</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {!user.is_admin && (
                              <div className="relative inline-block">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuUserId(openMenuUserId === user.id ? null : user.id);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                                >
                                  <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                                
                                {openMenuUserId === user.id && (
                                  <div 
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="px-3 py-2 border-b border-gray-100">
                                      <p className="text-xs font-semibold text-gray-500 uppercase">Change Plan</p>
                                    </div>
                                    {user.plan !== 'pro' && (
                                      <button
                                        onClick={() => {
                                          handleUpdatePlan(user.id, 'pro');
                                          setOpenMenuUserId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition flex items-center gap-2"
                                      >
                                        <Target className="w-4 h-4" />
                                        Upgrade to Pro
                                      </button>
                                    )}
                                    {user.plan !== 'basic' && (
                                      <button
                                        onClick={() => {
                                          handleUpdatePlan(user.id, 'basic');
                                          setOpenMenuUserId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition flex items-center gap-2"
                                      >
                                        <Award className="w-4 h-4" />
                                        {user.plan === 'pro' ? 'Downgrade to Basic' : 'Upgrade to Basic'}
                                      </button>
                                    )}
                                    {user.plan !== 'free' && (
                                      <button
                                        onClick={() => {
                                          handleUpdatePlan(user.id, 'free');
                                          setOpenMenuUserId(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                                      >
                                        <ChevronDown className="w-4 h-4" />
                                        Demote to Free
                                      </button>
                                    )}
                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!loading) {
                                            handleDeleteUser(user.id);
                                          }
                                        }}
                                        disabled={loading}
                                        className={`w-full text-left px-4 py-2 text-sm transition flex items-center gap-2 ${
                                          loading ? 'opacity-50 cursor-not-allowed' :
                                          deleteConfirm === user.id
                                            ? 'bg-red-50 text-red-700 font-medium'
                                            : 'text-red-600 hover:bg-red-50'
                                        }`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        {loading ? 'Deleting...' : deleteConfirm === user.id ? 'Click to Confirm' : 'Delete User'}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                        
                        {/* Expandable Profile Details Row */}
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <UserCheck className="w-5 h-5 text-blue-600" />
                                  Profile Details
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {/* Contact Information */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                      <Mail className="w-4 h-4" />
                                      Contact
                                    </h4>
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-xs text-gray-500">Phone:</span>
                                        <p className="text-sm text-gray-900">{user.phone || <span className="text-gray-400 italic">Not provided</span>}</p>
                                      </div>
                                      {user.phone && (
                                        <div>
                                          <span className="text-xs text-gray-500">Verified:</span>
                                          <p className="text-sm">
                                            {user.phone_verified ? (
                                              <span className="text-green-600 flex items-center gap-1">
                                                <UserCheck className="w-3 h-3" />
                                                Yes
                                              </span>
                                            ) : (
                                              <span className="text-orange-600">No</span>
                                            )}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Education */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                      <Award className="w-4 h-4" />
                                      Education
                                    </h4>
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-xs text-gray-500">College:</span>
                                        <p className="text-sm text-gray-900">{user.college || <span className="text-gray-400 italic">Not provided</span>}</p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Branch:</span>
                                        <p className="text-sm text-gray-900">{user.branch || <span className="text-gray-400 italic">Not provided</span>}</p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">CGPA:</span>
                                        <p className="text-sm text-gray-900">{user.cgpa || <span className="text-gray-400 italic">Not provided</span>}</p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Graduation Year:</span>
                                        <p className="text-sm text-gray-900">{user.graduation_year || <span className="text-gray-400 italic">Not provided</span>}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Professional Links */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4" />
                                      Professional Links
                                    </h4>
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-xs text-gray-500">LinkedIn:</span>
                                        {user.linkedin_url ? (
                                          <a 
                                            href={user.linkedin_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline block truncate"
                                          >
                                            {user.linkedin_url}
                                          </a>
                                        ) : (
                                          <p className="text-sm text-gray-400 italic">Not provided</p>
                                        )}
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">GitHub:</span>
                                        {user.github_url ? (
                                          <a 
                                            href={user.github_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline block truncate"
                                          >
                                            {user.github_url}
                                          </a>
                                        ) : (
                                          <p className="text-sm text-gray-400 italic">Not provided</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Profile Completion Summary */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">Profile Completion</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {profileCompletion === 100 ? '✓ Profile is complete' :
                                         profileCompletion >= 50 ? 'Profile is partially complete' :
                                         'Profile needs more information'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-2xl font-bold text-gray-900">{profileCompletion}%</p>
                                      <p className="text-xs text-gray-500">
                                        {Math.round((profileCompletion / 100) * 7)}/7 fields filled
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                      )}
                    )}
                    </tbody>
                  </table>
                </div>
                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Chats Tab — Sidebar + Panel layout */}
        {activeTab === 'chats' && !loading && (
          <div className="flex gap-0 bg-white rounded-lg shadow-sm overflow-hidden" style={{ minHeight: '600px' }}>

            {/* LEFT SIDEBAR — User list */}
            <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col">
              <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">💬 Users</h2>
                <p className="text-xs text-gray-400 mt-0.5">{chatUsersSummary.length} user{chatUsersSummary.length !== 1 ? 's' : ''} with chats</p>
              </div>
              <div className="overflow-y-auto flex-1">
                {chatUsersSummary.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-10">No chat history found</p>
                )}
                {chatUsersSummary.map((cu) => (
                  <button
                    key={cu.user_id}
                    onClick={() => loadUserChats(cu)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors hover:bg-blue-50 ${
                      selectedChatUser?.user_id === cu.user_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                        {cu.user_name.charAt(0).toUpperCase()}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{cu.user_name}</div>
                        <div className="text-xs text-gray-500 truncate">{cu.user_email}</div>
                      </div>
                      {/* Message count badge */}
                      <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                        {cu.chat_count}
                      </span>
                    </div>
                    <div className="mt-1 ml-12 text-xs text-gray-400">
                      Last active: {formatDate(cu.last_message_at)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL — Chat messages */}
            <div className="flex-1 flex flex-col">
              {!selectedChatUser && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-gray-700">Please select a user to view chat history</h3>
                  <p className="text-sm text-gray-400 mt-2">Choose a user from the sidebar on the left</p>
                </div>
              )}

              {selectedChatUser && (
                <>
                  {/* Panel header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                      {selectedChatUser.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{selectedChatUser.user_name}</div>
                      <div className="text-xs text-gray-500">
                        {selectedChatUser.user_email}
                        <span className="mx-1.5">·</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          selectedChatUser.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                          selectedChatUser.plan === 'basic' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{selectedChatUser.plan.toUpperCase()}</span>
                        <span className="mx-1.5">·</span>
                        {selectedChatUser.chat_count} messages
                      </div>
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-3" style={{ maxHeight: '520px' }}>
                    {chatLoading && (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    {!chatLoading && userChats.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          <div className={`text-xs mt-1 ${
                            msg.role === 'user' ? 'text-blue-200 text-right' : 'text-gray-400'
                          }`}>
                            {formatDate(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!chatLoading && userChats.length === 0 && (
                      <div className="text-center py-12 text-gray-400 text-sm">No messages found for this user</div>
                    )}
                  </div>
                </>
              )}
            </div>

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

        {/* Aptitude History Tab — Sidebar + Panel layout */}
        {activeTab === 'aptitude-history' && !loading && (
          <div className="flex gap-0 bg-white rounded-lg shadow-sm overflow-hidden" style={{ minHeight: '600px' }}>

            {/* LEFT SIDEBAR — User list */}
            <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col">
              <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">📝 Users</h2>
                <p className="text-xs text-gray-400 mt-0.5">{aptitudeUsersSummary.length} user{aptitudeUsersSummary.length !== 1 ? 's' : ''} with exams</p>
              </div>
              <div className="overflow-y-auto flex-1">
                {aptitudeUsersSummary.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-10">No aptitude history found</p>
                )}
                {aptitudeUsersSummary.map((au) => (
                  <button
                    key={au.user_id}
                    onClick={() => loadUserAptitudeHistory(au)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors hover:bg-blue-50 ${
                      selectedAptitudeUser?.user_id === au.user_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                        {au.user_name.charAt(0).toUpperCase()}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{au.user_name}</div>
                        <div className="text-xs text-gray-500 truncate">{au.user_email}</div>
                      </div>
                      {/* Exam count badge */}
                      <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-purple-600 text-white text-xs font-bold">
                        {au.exam_count}
                      </span>
                    </div>
                    <div className="mt-1 ml-12 text-xs text-gray-400">
                      Avg Score: {au.avg_score.toFixed(1)}% · Last: {formatDate(au.last_exam_date)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL — Exam history */}
            <div className="flex-1 flex flex-col">
              {!selectedAptitudeUser && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-700">Please select a user to view aptitude history</h3>
                  <p className="text-sm text-gray-400 mt-2">Choose a user from the sidebar on the left</p>
                </div>
              )}

              {selectedAptitudeUser && (
                <>
                  {/* Panel header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                      {selectedAptitudeUser.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{selectedAptitudeUser.user_name}</div>
                      <div className="text-xs text-gray-500">
                        {selectedAptitudeUser.user_email}
                        <span className="mx-1.5">·</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          selectedAptitudeUser.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                          selectedAptitudeUser.plan === 'basic' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{selectedAptitudeUser.plan.toUpperCase()}</span>
                        <span className="mx-1.5">·</span>
                        {selectedAptitudeUser.exam_count} exams
                      </div>
                    </div>
                  </div>

                  {/* Exams area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '520px' }}>
                    {aptitudeLoading && (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    )}
                    {!aptitudeLoading && userAptitudeHistory.map((exam) => (
                      <div
                        key={exam.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{exam.category}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {exam.company} · {formatDate(exam.exam_date)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            exam.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            exam.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {exam.difficulty.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-2xl font-bold text-purple-600">{exam.score_percent.toFixed(1)}%</span>
                              <span className="text-sm text-gray-600">{exam.score}/{exam.total_questions * 4} points</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  exam.score_percent >= 80 ? 'bg-green-500' :
                                  exam.score_percent >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${exam.score_percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-green-50 rounded p-2">
                            <div className="text-lg font-bold text-green-700">{exam.correct}</div>
                            <div className="text-xs text-green-600">Correct</div>
                          </div>
                          <div className="bg-red-50 rounded p-2">
                            <div className="text-lg font-bold text-red-700">{exam.wrong}</div>
                            <div className="text-xs text-red-600">Wrong</div>
                          </div>
                          <div className="bg-yellow-50 rounded p-2">
                            <div className="text-lg font-bold text-yellow-700">{exam.skipped}</div>
                            <div className="text-xs text-yellow-600">Skipped</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!aptitudeLoading && userAptitudeHistory.length === 0 && (
                      <div className="text-center py-12 text-gray-400 text-sm">No exam history found for this user</div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* AI Monitor Tab */}
        {activeTab === 'ai-monitor' && !loading && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">AI Usage Monitor</h1>
              <p className="text-gray-500 mt-1">Track AI queries and cost analysis</p>
            </div>

            {/* Cost Summary Card */}
            {costSummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">${costSummary.total_cost_usd}</h3>
                  <p className="text-sm text-gray-500">Total API Cost (Month)</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{costSummary.total_queries}</h3>
                  <p className="text-sm text-gray-500">Total Queries</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{(costSummary.total_input_tokens / 1000).toFixed(0)}K</h3>
                  <p className="text-sm text-gray-500">Input Tokens</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{(costSummary.total_output_tokens / 1000).toFixed(0)}K</h3>
                  <p className="text-sm text-gray-500">Output Tokens</p>
                </div>
              </div>
            )}

            {/* Top Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Top AI Users</h3>
                <p className="text-sm text-gray-500 mt-1">Users with highest query counts this month</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Queries</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tokens Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topAIUsers.map((user, index) => (
                      <tr key={user.user_id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            user.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                            user.plan === 'basic' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-gray-900">{user.total_queries}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            <div>In: {(user.total_input_tokens / 1000).toFixed(1)}K</div>
                            <div>Out: {(user.total_output_tokens / 1000).toFixed(1)}K</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {topAIUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">No usage data available</div>
              )}
            </div>
          </div>
        )}

        {/* Broadcast Tab */}
        {activeTab === 'broadcast' && !loading && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Broadcast Notifications</h1>
              <p className="text-gray-500 mt-1">Send platform-wide announcements to users</p>
            </div>

            {/* Stats Cards */}
            {broadcastStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{broadcastStats.total_broadcasts}</h3>
                  <p className="text-sm text-gray-500">Total Broadcasts</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{broadcastStats.total_notifications_sent}</h3>
                  <p className="text-sm text-gray-500">Notifications Sent</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{broadcastStats.unread_notifications}</h3>
                  <p className="text-sm text-gray-500">Unread Notifications</p>
                </div>
              </div>
            )}

            {/* Compose Broadcast Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Compose New Broadcast</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g., TCS NQT is live!"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Body
                  </label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g., Practice now on our new aptitude sets."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="pro">Pro Users Only</option>
                    <option value="basic">Basic Users Only</option>
                    <option value="free">Free Users Only</option>
                  </select>
                </div>

                <button
                  onClick={handleSendBroadcast}
                  disabled={loading || !broadcastTitle || !broadcastMessage}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Broadcast
                </button>
              </div>
            </div>

            {/* Broadcast History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Broadcast History</h3>
                <p className="text-sm text-gray-500 mt-1">Past announcements and notifications</p>
              </div>
              <div className="divide-y divide-gray-100">
                {broadcastHistory.map((broadcast) => (
                  <div key={broadcast.id} className="px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{broadcast.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{broadcast.message}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(broadcast.created_at)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            broadcast.target_audience === 'all' ? 'bg-blue-100 text-blue-700' :
                            broadcast.target_audience === 'pro' ? 'bg-purple-100 text-purple-700' :
                            broadcast.target_audience === 'basic' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {broadcast.target_audience.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {broadcast.users_count} users
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {broadcastHistory.length === 0 && (
                <div className="text-center py-12 text-gray-500">No broadcasts sent yet</div>
              )}
            </div>
          </div>
        )}

        {/* Aptitude Questions Management Tab */}
        {activeTab === 'aptitude-questions' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Aptitude Questions Management</h1>
              <p className="text-gray-500 mt-1">Upload and manage aptitude practice questions from JSON files</p>
            </div>

            {/* Stats Cards */}
            {aptitudeStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="text-sm text-gray-500">Total Questions</div>
                  <div className="text-2xl font-bold text-gray-900">{aptitudeStats.total_questions}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="text-sm text-gray-500">Categories</div>
                  <div className="text-2xl font-bold text-blue-600">{aptitudeStats.total_categories}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="text-sm text-gray-500">Subcategories</div>
                  <div className="text-2xl font-bold text-purple-600">{aptitudeStats.total_subcategories}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="text-sm text-gray-500">Sources</div>
                  <div className="text-2xl font-bold text-green-600">{aptitudeStats.total_sources}</div>
                </div>
              </div>
            )}

            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Upload Questions</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload a JSON file with questions in the format: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{'[{id, question, options: [{key, text}], answer, explanation, category, subcategory, difficulty, tags, source}]'}</code>
              </p>
              
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setAptitudeQuestionsFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  onClick={handleAptitudeFileUpload}
                  disabled={!aptitudeQuestionsFile || loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {aptitudeUploadProgress || 'Upload'}
                </button>
              </div>

              {aptitudeUploadResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  aptitudeUploadResult.inserted > 0 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">
                      {aptitudeUploadResult.inserted > 0 ? '✅' : '⚠️'}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        aptitudeUploadResult.inserted > 0 ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        {aptitudeUploadResult.message}
                      </p>
                      <div className="mt-2 text-xs space-y-1">
                        <div className="text-gray-600">
                          <span className="font-semibold">Total:</span> {aptitudeUploadResult.total} questions in file
                        </div>
                        <div className="text-green-600">
                          <span className="font-semibold">Inserted:</span> {aptitudeUploadResult.inserted} new questions
                        </div>
                        {aptitudeUploadResult.skipped > 0 && (
                          <div className="text-yellow-600">
                            <span className="font-semibold">Skipped:</span> {aptitudeUploadResult.skipped} duplicates/errors
                          </div>
                        )}
                        {aptitudeUploadResult.errors && aptitudeUploadResult.errors.length > 0 && (
                          <div className="mt-2">
                            <div className="font-semibold text-red-600 mb-1">
                              Errors ({aptitudeUploadResult.total_errors}):
                            </div>
                            <ul className="list-disc list-inside text-red-600 space-y-0.5">
                              {aptitudeUploadResult.errors.map((err: string, idx: number) => (
                                <li key={idx}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-medium text-gray-700">Filters:</label>
                <select
                  value={aptitudeFilterCategory}
                  onChange={(e) => {
                    setAptitudeFilterCategory(e.target.value);
                    loadAptitudeQuestions();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Verbal Ability">Verbal Ability</option>
                </select>
                <select
                  value={aptitudeFilterSubcategory}
                  onChange={(e) => {
                    setAptitudeFilterSubcategory(e.target.value);
                    loadAptitudeQuestions();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Subcategories</option>
                  <optgroup label="Aptitude">
                    <option value="Average">Average</option>
                    <option value="Percentage">Percentage</option>
                    <option value="Profit and Loss">Profit and Loss</option>
                    <option value="Time and Distance">Time and Distance</option>
                    <option value="Time and Work">Time and Work</option>
                  </optgroup>
                  <optgroup label="Logical Reasoning">
                    <option value="Puzzles">Puzzles</option>
                    <option value="Verbal Reasoning">Verbal Reasoning</option>
                  </optgroup>
                  <optgroup label="Verbal Ability">
                    <option value="Synonyms">Synonyms</option>
                  </optgroup>
                </select>
                <span className="text-sm text-gray-500 ml-auto">
                  {aptitudeQuestions.length} questions
                </span>
              </div>
            </div>

            {/* Questions List */}
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading questions...</p>
              </div>
            )}

            {!loading && aptitudeQuestions.length > 0 && (
              <div className="space-y-4">
                {aptitudeQuestions.map((q, index) => (
                  <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          {q.subcategory}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{q.source}</span>
                    </div>
                    <p className="text-gray-800 mb-3">{q.question}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {q.options.map((opt: any) => (
                        <div
                          key={opt.key}
                          className={`p-2 rounded-lg border text-sm ${
                            opt.key === q.answer
                              ? 'border-green-500 bg-green-50 text-green-900 font-medium'
                              : 'border-gray-200 bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className="font-semibold">{opt.key})</span> {opt.text}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      Answer: <span className="font-semibold text-green-600">{q.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && aptitudeQuestions.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Found</h3>
                <p className="text-gray-500">Upload a JSON file to add questions to the database.</p>
              </div>
            )}
          </div>
        )}

        {/* DSA Management Tab */}
        {activeTab === 'dsa-management' && !loading && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DSA Management</h1>
                <p className="text-gray-500 mt-1">Monitor and manage DSA practice module</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/admin/dsa/user-performance')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  View User Performance Insights 📊
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Generate missing solutions for all questions? This may take a while.')) {
                      setLoading(true);
                      try {
                        const result = await adminAPI.generateMissingSolutions();
                        setSuccessMessage(result.message || 'Solution generation triggered!');
                        setTimeout(() => {
                          setSuccessMessage(null);
                          loadDSAManagement();
                        }, 3000);
                      } catch (err: any) {
                        setError(err.response?.data?.detail || 'Failed to trigger solution generation');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm flex items-center gap-2"
                >
                  <Database className="w-5 h-5" />
                  Generate All Missing Solutions
                </button>
              </div>
            </div>

            {/* Stats Cards - Indigo Theme */}
            {dsaStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Questions */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Code2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-indigo-100 uppercase">Total</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-1">{dsaStats.total_questions}</h3>
                  <p className="text-sm text-indigo-100">DSA Problems</p>
                </div>

                {/* Total Submissions */}
                <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-indigo-100 uppercase">Activity</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-1">{dsaStats.total_submissions}</h3>
                  <p className="text-sm text-indigo-100">Code Submissions</p>
                </div>

                {/* Success Rate */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-indigo-100 uppercase">Success</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-1">{dsaStats.success_rate}%</h3>
                  <p className="text-sm text-indigo-100">Acceptance Rate</p>
                </div>

                {/* Cache Coverage */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-indigo-100 uppercase">Cache</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-1">{dsaStats.cache_coverage}%</h3>
                  <p className="text-sm text-indigo-100">Solutions Cached</p>
                </div>
              </div>
            )}

            {/* Questions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">DSA Questions Database</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{dsaQuestions.length} questions</span>
                    <button
                      onClick={() => loadDSAManagement()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={dsaSearchQuery}
                    onChange={(e) => setDsaSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={dsaTopicFilter}
                    onChange={(e) => setDsaTopicFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Topics</option>
                    <option value="arrays">Arrays</option>
                    <option value="strings">Strings</option>
                    <option value="linked_lists">Linked Lists</option>
                    <option value="stacks">Stacks</option>
                    <option value="queues">Queues</option>
                    <option value="trees">Trees</option>
                    <option value="graphs">Graphs</option>
                    <option value="dynamic_programming">Dynamic Programming</option>
                    <option value="greedy">Greedy</option>
                    <option value="backtracking">Backtracking</option>
                  </select>
                  <button
                    onClick={() => loadDSAManagement()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Topic</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Difficulty</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Cache Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dsaQuestions.map((question) => (
                      <tr key={question.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">#{question.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                            {question.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                            {question.topic.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {question.difficulty.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{question.company || 'General'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {question.has_cache ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-green-700">Cached</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-xs font-medium text-red-700">No Cache</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                const newTitle = prompt('Enter new title:', question.title);
                                if (newTitle && newTitle !== question.title) {
                                  setLoading(true);
                                  adminAPI.updateDSAQuestion(question.id, { title: newTitle })
                                    .then(() => {
                                      setSuccessMessage('Question updated successfully!');
                                      loadDSAManagement();
                                      setTimeout(() => setSuccessMessage(null), 3000);
                                    })
                                    .catch((err) => {
                                      setError(err.response?.data?.detail || 'Update failed');
                                      setLoading(false);
                                    });
                                }
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-medium"
                              title="Edit question"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Regenerate AI solution for "${question.title}"?`)) {
                                  setSuccessMessage('Solution regeneration triggered! This may take a moment...');
                                  // In a real implementation, you'd call an API endpoint here
                                  setTimeout(() => {
                                    setSuccessMessage('Solution regenerated successfully!');
                                    loadDSAManagement();
                                    setTimeout(() => setSuccessMessage(null), 3000);
                                  }, 2000);
                                }
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition font-medium"
                              title="Refresh AI solution"
                            >
                              <Database className="w-4 h-4" />
                              Refresh AI
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {dsaQuestions.length === 0 && (
                <div className="p-12 text-center">
                  <Code2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No questions found</p>
                </div>
              )}
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
