import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import Header from '../../components/Header';
import { Eye, Trash2, Sparkles, ArrowLeft, User, RefreshCw } from 'lucide-react';

interface UserResume {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  template_id: string;
  template_name: string;
  ats_score: number;
  is_ai_generated: boolean;
  last_updated: string;
  export_count: number;
  resume_data: any;
}

const UserResumesPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [resumes, setResumes] = useState<UserResume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<UserResume | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [atsFilter, setAtsFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [recalculating, setRecalculating] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadResumes();
  }, [user, navigate]);

  const loadResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/user-resumes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to load resumes');
      const data = await response.json();
      setResumes(data.resumes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load user resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/user-resumes/${resumeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to delete resume');
      setResumes(resumes.filter(r => r.id !== resumeId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume');
    }
  };

  const handleRecalculateATS = async (resumeId: number) => {
    setRecalculating(resumeId);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/recalculate-ats/${resumeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to recalculate ATS score');
      const data = await response.json();
      
      // Update the resume in the list
      setResumes(resumes.map(r => 
        r.id === resumeId ? { ...r, ats_score: data.new_ats_score } : r
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to recalculate ATS score');
    } finally {
      setRecalculating(null);
    }
  };

  const filteredResumes = resumes.filter(r => {
    // Search filter
    const matchesSearch = r.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.template_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // ATS filter
    let matchesATS = true;
    if (atsFilter === 'low') {
      matchesATS = r.ats_score < 50;
    } else if (atsFilter === 'medium') {
      matchesATS = r.ats_score >= 50 && r.ats_score <= 70;
    } else if (atsFilter === 'high') {
      matchesATS = r.ats_score > 70;
    }
    
    return matchesSearch && matchesATS;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Resumes</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">View and manage all user resumes</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <select
                value={atsFilter}
                onChange={(e) => setAtsFilter(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All ATS Scores</option>
                <option value="low">Low (&lt;50)</option>
                <option value="medium">Medium (50-70)</option>
                <option value="high">High (&gt;70)</option>
              </select>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ATS Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exports</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredResumes.map((resume) => (
                      <tr key={resume.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{resume.user_name}</p>
                              <p className="text-xs text-gray-500">{resume.user_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{resume.template_name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            resume.ats_score >= 70 ? 'bg-green-100 text-green-700' :
                            resume.ats_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {resume.ats_score}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {resume.is_ai_generated ? (
                            <span className="flex items-center gap-1 text-xs text-purple-600">
                              <Sparkles className="w-3 h-3" />
                              AI Generated
                            </span>
                          ) : (
                            <span className="text-xs text-gray-600">Manual</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(resume.last_updated).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{resume.export_count}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRecalculateATS(resume.id)}
                              disabled={recalculating === resume.id}
                              className="p-2 hover:bg-purple-50 rounded-lg transition disabled:opacity-50"
                              title="Recalculate ATS Score"
                            >
                              <RefreshCw className={`w-4 h-4 text-purple-600 ${recalculating === resume.id ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={() => setSelectedResume(resume)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(resume.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resume Preview Modal */}
          {selectedResume && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resume Preview</h3>
                  <button onClick={() => setSelectedResume(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="p-6">
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(selectedResume.resume_data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserResumesPage;
