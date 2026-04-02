import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import Header from '../../components/Header';
import { 
  FileText, 
  TrendingUp, 
  Download, 
  Star, 
  Users,
  CheckCircle,
  Sparkles,
  BarChart3,
  ArrowLeft
} from 'lucide-react';

interface ResumeAnalytics {
  total_resumes: number;
  ai_generated: number;
  manual_created: number;
  pdf_exports: number;
  average_ats_score: number;
  premium_template_usage: number;
  most_selected_template: string;
  completion_rate: number;
  templates_breakdown: Array<{
    template: string;
    usage: number;
    exports: number;
    avg_ats_score?: number;
  }>;
  ats_distribution?: {
    low: number;
    medium: number;
    high: number;
  };
  ai_vs_manual_ats?: {
    ai_avg: number;
    manual_avg: number;
  };
}

const ResumeAnalyticsPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [analytics, setAnalytics] = useState<ResumeAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard');
      return;
    }
    loadAnalytics();
  }, [user, navigate]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/resume-analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load resume analytics');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Resume Analytics</h1>
              <p className="text-gray-500 mt-1">Monitor resume creation and usage metrics</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{analytics.total_resumes}</h3>
                  <p className="text-sm text-gray-500">Total Resumes Created</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{analytics.ai_generated}</h3>
                  <p className="text-sm text-gray-500">AI-Generated Resumes</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Download className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{analytics.pdf_exports}</h3>
                  <p className="text-sm text-gray-500">Total PDF Exports</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">{analytics.average_ats_score}+</h3>
                  <p className="text-sm text-gray-500">Average ATS Score</p>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Manual Resumes</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics.manual_created}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Premium Template Usage</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics.premium_template_usage}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Completion Rate</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics.completion_rate}%</p>
                </div>
              </div>

              {/* ATS Distribution */}
              {analytics.ats_distribution && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">ATS Score Distribution</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <p className="text-sm text-red-600 font-medium mb-1">Low (&lt;50)</p>
                      <p className="text-3xl font-bold text-red-700">{analytics.ats_distribution.low}</p>
                      <p className="text-xs text-red-600 mt-1">
                        {analytics.total_resumes > 0 ? Math.round((analytics.ats_distribution.low / analytics.total_resumes) * 100) : 0}% of total
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                      <p className="text-sm text-yellow-600 font-medium mb-1">Medium (50-70)</p>
                      <p className="text-3xl font-bold text-yellow-700">{analytics.ats_distribution.medium}</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {analytics.total_resumes > 0 ? Math.round((analytics.ats_distribution.medium / analytics.total_resumes) * 100) : 0}% of total
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <p className="text-sm text-green-600 font-medium mb-1">High (&gt;70)</p>
                      <p className="text-3xl font-bold text-green-700">{analytics.ats_distribution.high}</p>
                      <p className="text-xs text-green-600 mt-1">
                        {analytics.total_resumes > 0 ? Math.round((analytics.ats_distribution.high / analytics.total_resumes) * 100) : 0}% of total
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI vs Manual ATS Comparison */}
              {analytics.ai_vs_manual_ats && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border border-purple-100 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">AI vs Manual Resume Quality</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">AI-Generated Average</p>
                      <p className="text-3xl font-bold text-purple-600">{analytics.ai_vs_manual_ats.ai_avg}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Manual Created Average</p>
                      <p className="text-3xl font-bold text-blue-600">{analytics.ai_vs_manual_ats.manual_avg}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-4">
                    {analytics.ai_vs_manual_ats.ai_avg > analytics.ai_vs_manual_ats.manual_avg 
                      ? '✓ AI-generated resumes show higher ATS scores on average' 
                      : 'Manual resumes are performing well'}
                  </p>
                </div>
              )}

              {/* Most Popular Template */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm p-6 border border-blue-100 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Most Selected Template</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{analytics.most_selected_template}</p>
                    <p className="text-sm text-gray-600 mt-1">Most popular template choice</p>
                  </div>
                </div>
              </div>

              {/* Templates Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Templates Breakdown</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Export Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg ATS Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.templates_breakdown.length > 0 ? (
                        analytics.templates_breakdown.map((template, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{template.template}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{template.usage}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{template.exports}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                (template.avg_ats_score || 0) >= 70 ? 'bg-green-100 text-green-700' :
                                (template.avg_ats_score || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {template.avg_ats_score || 0}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                            No template data available yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyticsPage;
