import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import Header from '../../components/Header';
import { 
  Settings, 
  Save, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';

interface AISettings {
  model_name: string;
  prompt_version: string;
  ai_enabled: boolean;
  free_user_limit: number;
  premium_user_limit: number;
  ats_enabled?: boolean;
  ats_mode?: string;
  keywords_weight?: number;
  formatting_weight?: number;
  experience_weight?: number;
  skills_weight?: number;
  readability_weight?: number;
}

const AISettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    loadSettings();
  }, [user, navigate]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/ai-settings`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized access. Admin privileges required.');
        }
        throw new Error('Failed to load AI settings');
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/ai-settings`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        }
      );
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized access. Admin privileges required.');
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save settings');
      }
      
      const data = await response.json();
      setSettings(data);
      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AISettings, value: string | boolean | number) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Settings</h1>
              <p className="text-gray-500 mt-1">Configure AI resume generation settings</p>
            </div>
          </div>

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
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </div>
          )}

          {/* Loading State */}
          {loading && !settings ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading AI settings...</p>
            </div>
          ) : settings ? (
            /* Settings Form */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gemini AI Configuration</h3>
                    <p className="text-sm text-gray-500">Manage AI model settings and usage limits</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 space-y-6">
                {/* Model Name */}
                <div>
                  <label htmlFor="model_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name
                  </label>
                  <input
                    id="model_name"
                    type="text"
                    value={settings.model_name}
                    onChange={(e) => handleInputChange('model_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., gemini-1.5-flash"
                  />
                  <p className="mt-1 text-xs text-gray-500">The Gemini model used for resume generation</p>
                </div>

                {/* Prompt Version */}
                <div>
                  <label htmlFor="prompt_version" className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt Version
                  </label>
                  <input
                    id="prompt_version"
                    type="text"
                    value={settings.prompt_version}
                    onChange={(e) => handleInputChange('prompt_version', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., v1.0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Current version of the AI prompts</p>
                </div>

                {/* AI Enabled Toggle */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    id="ai_enabled"
                    type="checkbox"
                    checked={settings.ai_enabled}
                    onChange={(e) => handleInputChange('ai_enabled', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="ai_enabled" className="block text-sm font-medium text-gray-900 cursor-pointer">
                      AI Enabled
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable or disable AI-powered resume generation for all users
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Usage Limits</h4>
                  
                  {/* Free User Limit */}
                  <div className="mb-6">
                    <label htmlFor="free_user_limit" className="block text-sm font-medium text-gray-700 mb-2">
                      Free User Generation Limit (per day)
                    </label>
                    <input
                      id="free_user_limit"
                      type="number"
                      min="0"
                      value={settings.free_user_limit}
                      onChange={(e) => handleInputChange('free_user_limit', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="e.g., 5"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum AI generations allowed per day for free users
                    </p>
                  </div>

                  {/* Premium User Limit */}
                  <div>
                    <label htmlFor="premium_user_limit" className="block text-sm font-medium text-gray-700 mb-2">
                      Premium User Generation Limit (per day)
                    </label>
                    <input
                      id="premium_user_limit"
                      type="number"
                      min="0"
                      value={settings.premium_user_limit}
                      onChange={(e) => handleInputChange('premium_user_limit', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="e.g., 50"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum AI generations allowed per day for premium users
                    </p>
                  </div>
                </div>

                {/* ATS Scoring Settings */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">ATS Scoring Configuration</h4>
                  
                  {/* ATS Enabled Toggle */}
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mb-6">
                    <input
                      id="ats_enabled"
                      type="checkbox"
                      checked={settings.ats_enabled ?? true}
                      onChange={(e) => handleInputChange('ats_enabled', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <label htmlFor="ats_enabled" className="block text-sm font-medium text-gray-900 cursor-pointer">
                        ATS Scoring Enabled
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Enable AI-powered ATS score calculation for resumes
                      </p>
                    </div>
                  </div>

                  {/* Scoring Mode */}
                  <div className="mb-6">
                    <label htmlFor="ats_mode" className="block text-sm font-medium text-gray-700 mb-2">
                      Scoring Mode
                    </label>
                    <select
                      id="ats_mode"
                      value={settings.ats_mode || 'normal'}
                      onChange={(e) => handleInputChange('ats_mode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="lenient">Lenient (Higher scores)</option>
                      <option value="normal">Normal (Balanced)</option>
                      <option value="strict">Strict (Lower scores)</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Controls how strictly resumes are evaluated</p>
                  </div>

                  {/* ATS Weights */}
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-medium">ATS Score Weights (must total 100)</p>
                    
                    <div>
                      <label htmlFor="keywords_weight" className="block text-xs font-medium text-gray-600 mb-1">
                        Keywords Weight: {settings.keywords_weight || 25}%
                      </label>
                      <input
                        id="keywords_weight"
                        type="range"
                        min="0"
                        max="100"
                        value={settings.keywords_weight || 25}
                        onChange={(e) => handleInputChange('keywords_weight', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label htmlFor="formatting_weight" className="block text-xs font-medium text-gray-600 mb-1">
                        Formatting Weight: {settings.formatting_weight || 20}%
                      </label>
                      <input
                        id="formatting_weight"
                        type="range"
                        min="0"
                        max="100"
                        value={settings.formatting_weight || 20}
                        onChange={(e) => handleInputChange('formatting_weight', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label htmlFor="experience_weight" className="block text-xs font-medium text-gray-600 mb-1">
                        Experience Weight: {settings.experience_weight || 25}%
                      </label>
                      <input
                        id="experience_weight"
                        type="range"
                        min="0"
                        max="100"
                        value={settings.experience_weight || 25}
                        onChange={(e) => handleInputChange('experience_weight', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label htmlFor="skills_weight" className="block text-xs font-medium text-gray-600 mb-1">
                        Skills Weight: {settings.skills_weight || 20}%
                      </label>
                      <input
                        id="skills_weight"
                        type="range"
                        min="0"
                        max="100"
                        value={settings.skills_weight || 20}
                        onChange={(e) => handleInputChange('skills_weight', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label htmlFor="readability_weight" className="block text-xs font-medium text-gray-600 mb-1">
                        Readability Weight: {settings.readability_weight || 10}%
                      </label>
                      <input
                        id="readability_weight"
                        type="range"
                        min="0"
                        max="100"
                        value={settings.readability_weight || 10}
                        onChange={(e) => handleInputChange('readability_weight', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Total Weight Indicator */}
                    <div className={`p-3 rounded-lg ${
                      ((settings.keywords_weight || 25) + 
                       (settings.formatting_weight || 20) + 
                       (settings.experience_weight || 25) + 
                       (settings.skills_weight || 20) + 
                       (settings.readability_weight || 10)) === 100 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        ((settings.keywords_weight || 25) + 
                         (settings.formatting_weight || 20) + 
                         (settings.experience_weight || 25) + 
                         (settings.skills_weight || 20) + 
                         (settings.readability_weight || 10)) === 100 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        Total: {
                          (settings.keywords_weight || 25) + 
                          (settings.formatting_weight || 20) + 
                          (settings.experience_weight || 25) + 
                          (settings.skills_weight || 20) + 
                          (settings.readability_weight || 10)
                        }%
                        {((settings.keywords_weight || 25) + 
                          (settings.formatting_weight || 20) + 
                          (settings.experience_weight || 25) + 
                          (settings.skills_weight || 20) + 
                          (settings.readability_weight || 10)) === 100 
                          ? ' ✓ Valid' 
                          : ' ✗ Must equal 100%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer with Save Button */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : !loading && !error ? (
            /* Empty State */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Settings Available</h3>
              <p className="text-gray-500">AI settings could not be loaded. Please try again.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AISettingsPage;
