import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import Header from '../../components/Header';
import { 
  Layout, 
  Star, 
  Eye, 
  EyeOff,
  TrendingUp,
  Edit3,
  ArrowLeft,
  Crown
} from 'lucide-react';

interface ResumeTemplate {
  id: string;
  name: string;
  tier: 'free' | 'premium';
  active: boolean;
  usage_count: number;
  export_count: number;
}

const ResumeTemplatesPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadTemplates();
  }, [user, navigate]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/resume-templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load templates');
      
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load resume templates');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (templateId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/resume-templates/${templateId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to toggle template');
      
      setTemplates(templates.map(t => 
        t.id === templateId ? { ...t, active: !currentStatus } : t
      ));
      setSuccessMessage(`Template ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle template status');
    }
  };

  const handleChangeTier = async (templateId: string, newTier: 'free' | 'premium') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/resume-templates/${templateId}/tier?tier=${newTier}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to change tier');
      
      setTemplates(templates.map(t => 
        t.id === templateId ? { ...t, tier: newTier } : t
      ));
      setSuccessMessage(`Template tier changed to ${newTier.toUpperCase()} successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change template tier');
    }
  };

  const getMostPopular = () => {
    if (templates.length === 0) return null;
    return templates.reduce((prev, current) => 
      (prev.usage_count > current.usage_count) ? prev : current
    );
  };

  const mostPopular = getMostPopular();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Templates Management</h1>
              <p className="text-gray-500 mt-1">Manage template availability and pricing</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading templates...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Layout className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Total Templates</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{templates.length}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Free Templates</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {templates.filter(t => t.tier === 'free').length}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Premium Templates</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {templates.filter(t => t.tier === 'premium').length}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Active Templates</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {templates.filter(t => t.active).length}
                  </p>
                </div>
              </div>

              {/* Most Popular Template */}
              {mostPopular && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border border-purple-100 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Most Popular Template</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mostPopular.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{mostPopular.tier.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600">{mostPopular.usage_count}</p>
                      <p className="text-sm text-gray-600">times used</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Templates Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">All Templates</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exports</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {templates.length > 0 ? (
                        templates.map((template) => (
                          <tr key={template.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                  <Layout className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{template.name}</p>
                                  <p className="text-xs text-gray-500">{template.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={template.tier}
                                onChange={(e) => handleChangeTier(template.id, e.target.value as 'free' | 'premium')}
                                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                                  template.tier === 'free'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                <option value="free">FREE</option>
                                <option value="premium">PREMIUM</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleActive(template.id, template.active)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                  template.active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {template.active ? (
                                  <>
                                    <Eye className="w-3 h-3" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
                                    Inactive
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{template.usage_count}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{template.export_count}</td>
                            <td className="px-6 py-4">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <Edit3 className="w-4 h-4 text-gray-600" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                            No templates available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplatesPage;
