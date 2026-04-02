/**
 * Resume Admin Module - Frontend Component Tests
 * Tests all 5 admin pages with React Testing Library
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ResumeAnalyticsPage from '../ResumeAnalyticsPage';
import ResumeTemplatesPage from '../ResumeTemplatesPage';
import UserResumesPage from '../UserResumesPage';
import AIResumeMonitorPage from '../AIResumeMonitorPage';
import AISettingsPage from '../AISettingsPage';
import apiClient from '../../../api/client';

// Mock API client
vi.mock('../../../api/client', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Mock auth context
const mockUser = {
  id: 1,
  email: 'admin@test.com',
  name: 'Admin User',
  isAdmin: true,
  plan: 'pro'
};

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true
  })
}));

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// ============================================================================
// RESUME ANALYTICS PAGE TESTS
// ============================================================================

describe('ResumeAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter(<ResumeAnalyticsPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('fetches and displays analytics data', async () => {
    const mockData = {
      total_resumes: 150,
      ai_generated: 95,
      manual_created: 55,
      pdf_exports: 120,
      average_ats_score: 82.5,
      premium_template_usage: 45,
      most_selected_template: 'ats-clean',
      completion_rate: 80.0,
      templates_breakdown: [
        { template: 'ats-clean', usage: 50, exports: 40 }
      ]
    };
    
    apiClient.get.mockResolvedValue({ data: mockData });
    
    renderWithRouter(<ResumeAnalyticsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('82.5')).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    apiClient.get.mockRejectedValue(new Error('Network error'));
    
    renderWithRouter(<ResumeAnalyticsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('handles empty data gracefully', async () => {
    const emptyData = {
      total_resumes: 0,
      ai_generated: 0,
      manual_created: 0,
      pdf_exports: 0,
      average_ats_score: 0,
      premium_template_usage: 0,
      most_selected_template: '',
      completion_rate: 0,
      templates_breakdown: []
    };
    
    apiClient.get.mockResolvedValue({ data: emptyData });
    
    renderWithRouter(<ResumeAnalyticsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// RESUME TEMPLATES PAGE TESTS
// ============================================================================

describe('ResumeTemplatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all templates', async () => {
    const mockData = {
      templates: [
        {
          id: 'ats-clean',
          name: 'ATS Clean',
          tier: 'free',
          active: true,
          usage_count: 50,
          export_count: 40
        },
        {
          id: 'creative-teal',
          name: 'Creative Teal',
          tier: 'premium',
          active: true,
          usage_count: 30,
          export_count: 25
        }
      ],
      most_popular: 'ats-clean'
    };
    
    apiClient.get.mockResolvedValue({ data: mockData });
    
    renderWithRouter(<ResumeTemplatesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ATS Clean')).toBeInTheDocument();
      expect(screen.getByText('Creative Teal')).toBeInTheDocument();
    });
  });

  it('toggles template status', async () => {
    const mockData = {
      templates: [
        {
          id: 'ats-clean',
          name: 'ATS Clean',
          tier: 'free',
          active: true,
          usage_count: 50,
          export_count: 40
        }
      ],
      most_popular: 'ats-clean'
    };
    
    apiClient.get.mockResolvedValue({ data: mockData });
    apiClient.put.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter(<ResumeTemplatesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ATS Clean')).toBeInTheDocument();
    });
    
    // Find and click toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/admin/resume-templates/ats-clean/toggle'
      );
    });
  });
});

// ============================================================================
// USER RESUMES PAGE TESTS
// ============================================================================

describe('UserResumesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders resume list', async () => {
    const mockData = {
      resumes: [
        {
          id: 1,
          user_id: 42,
          user_name: 'John Doe',
          user_email: 'john@example.com',
          template_id: 'ats-clean',
          ats_score: 85,
          ai_generated: true,
          pdf_export_count: 3,
          created_at: '2024-01-15T10:30:00',
          updated_at: '2024-01-20T14:45:00'
        }
      ]
    };
    
    apiClient.get.mockResolvedValue({ data: mockData });
    
    renderWithRouter(<UserResumesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('filters resumes by search', async () => {
    const mockData = {
      resumes: [
        {
          id: 1,
          user_id: 42,
          user_name: 'John Doe',
          user_email: 'john@example.com',
          template_id: 'ats-clean',
          ats_score: 85,
          ai_generated: true,
          pdf_export_count: 3,
          created_at: '2024-01-15T10:30:00',
          updated_at: '2024-01-20T14:45:00'
        }
      ]
    };
    
    apiClient.get.mockResolvedValue({ data: mockData });
    
    renderWithRouter(<UserResumesPage />);
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'john' } });
    
    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/admin/user-resumes',
        expect.objectContaining({
          params: { search: 'john' }
        })
      );
    });
  });

  it('deletes resume after confirmation', async () => {
    const mockData = {
      resumes: [
        {
          id: 1,
          user_id: 42,
          user_name: 'John Doe',
          user_email: 'john@example.com',
          template_id: 'ats-clean',
          ats_score: 85,
          ai_generated: true,
          pdf_export_count: 3,
          created_at: '2024-01-15T10:30:00',
          updated_at: '2024-01-20T14:45:00'
        }
      ]
    };
    
    apiClient.get.mockResolvedValue({ data: mockData });
    apiClient.delete.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter(<UserResumesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/api/admin/user-resumes/1');
    });
  });
});

// ============================================================================
// AI RESUME MONITOR PAGE TESTS
// ============================================================================

describe('AIResumeMonitorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays AI statistics', async () => {
    const mockData = {
      total_generations: 150,
      successful_requests: 142,
      failed_requests: 8,
      avg_response_time: 1250.5,
      summary_generations: 45,
      project_generations: 38,
      experience_generations: 52,
      template_recommendations: 15,
      recent_requests: []
    };
    
    apiClient.get.mockResolvedValue({ data: mockData });
    
    renderWithRouter(<AIResumeMonitorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('142')).toBeInTheDocument();
      expect(screen.getByText('1250.5')).toBeInTheDocument();
    });
  });

  it('renders recent requests table', async () => {
    const mockData = {
      total_generations: 10,
      successful_requests: 8,
      failed_requests: 2,
      avg_response_time: 1200,
      summary_generations: 3,
      project_generations: 3,
      experience_generations: 3,
      template_recommendations: 1,
      recent_requests: [
        {
          id: 1,
          user_email: 'john@example.com',
          request_type: 'summary',
          status: 'success',
          response_time: 1200,
          timestamp: '2024-01-20T14:30:00'
        }
      ]
    };
    
    apiClient.get.mockResolvedValue({ data: mockData });
    
    renderWithRouter(<AIResumeMonitorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('summary')).toBeInTheDocument();
    });
  });

  it('handles empty data state', async () => {
    const emptyData = {
      total_generations: 0,
      successful_requests: 0,
      failed_requests: 0,
      avg_response_time: 0,
      summary_generations: 0,
      project_generations: 0,
      experience_generations: 0,
      template_recommendations: 0,
      recent_requests: []
    };
    
    apiClient.get.mockResolvedValue({ data: emptyData });
    
    renderWithRouter(<AIResumeMonitorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// AI SETTINGS PAGE TESTS
// ============================================================================

describe('AISettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads current settings', async () => {
    const mockSettings = {
      model_name: 'gemini-1.5-flash',
      prompt_version: 'v1.0',
      ai_enabled: true,
      free_user_limit: 5,
      premium_user_limit: 50,
      updated_at: '2024-01-20T14:30:00'
    };
    
    apiClient.get.mockResolvedValue({ data: mockSettings });
    
    renderWithRouter(<AISettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('gemini-1.5-flash')).toBeInTheDocument();
      expect(screen.getByDisplayValue('v1.0')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });
  });

  it('updates settings on save', async () => {
    const mockSettings = {
      model_name: 'gemini-1.5-flash',
      prompt_version: 'v1.0',
      ai_enabled: true,
      free_user_limit: 5,
      premium_user_limit: 50
    };
    
    apiClient.get.mockResolvedValue({ data: mockSettings });
    apiClient.put.mockResolvedValue({ 
      data: { 
        success: true, 
        settings: { ...mockSettings, free_user_limit: 10 } 
      } 
    });
    
    renderWithRouter(<AISettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });
    
    // Change free limit
    const freeLimitInput = screen.getByLabelText(/free user limit/i);
    fireEvent.change(freeLimitInput, { target: { value: '10' } });
    
    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        '/api/admin/ai-settings',
        expect.objectContaining({
          free_user_limit: 10
        })
      );
    });
  });

  it('validates negative limits', async () => {
    const mockSettings = {
      model_name: 'gemini-1.5-flash',
      prompt_version: 'v1.0',
      ai_enabled: true,
      free_user_limit: 5,
      premium_user_limit: 50
    };
    
    apiClient.get.mockResolvedValue({ data: mockSettings });
    
    renderWithRouter(<AISettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });
    
    // Try negative limit
    const freeLimitInput = screen.getByLabelText(/free user limit/i);
    fireEvent.change(freeLimitInput, { target: { value: '-5' } });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/must be non-negative/i)).toBeInTheDocument();
    });
  });

  it('validates free limit exceeds premium', async () => {
    const mockSettings = {
      model_name: 'gemini-1.5-flash',
      prompt_version: 'v1.0',
      ai_enabled: true,
      free_user_limit: 5,
      premium_user_limit: 50
    };
    
    apiClient.get.mockResolvedValue({ data: mockSettings });
    
    renderWithRouter(<AISettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });
    
    // Set free > premium
    const freeLimitInput = screen.getByLabelText(/free user limit/i);
    fireEvent.change(freeLimitInput, { target: { value: '100' } });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/cannot exceed premium/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// RUN TESTS
// ============================================================================

// To run these tests:
// cd frontend
// npm test -- ResumeAdmin.test.tsx
