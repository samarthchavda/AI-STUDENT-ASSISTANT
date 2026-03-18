import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
  FileText,
  Code2,
  Bot,
  BookOpenCheck,
  Target,
  ClipboardCheck,
  Trophy,
  Clock3,
  TrendingUp,
  Activity,
  Gauge,
  Layers,
  Sparkles,
  Crown,
  X,
  type LucideIcon
} from 'lucide-react';
import Header from '../components/Header';
import { companyPrepAPI, type PracticeHistoryItem } from '../api/client';
import { useAppStore } from '../store/useAppStore';

const APTITUDE_PROGRESS_KEY = 'aptitude_progress';
const RESUME_ATS_SCORE_KEY = 'latest_resume_ats_score';
const DSA_SOLVED_WITHIN_TIME_KEY = 'dsa_solved_within_time';

const upcomingPlacements = [
  { companyId: 'tcs', company: 'TCS NQT', role: 'Ninja / Digital', date: '15 April 2026', package: '3.3 - 7.0 LPA', color: 'from-blue-500 to-cyan-500' },
  { companyId: 'amazon', company: 'Amazon', role: 'SDE-1 (Fresher)', date: '28 April 2026', package: '24+ LPA', color: 'from-orange-500 to-amber-500' },
  { companyId: 'infosys', company: 'Infosys', role: 'Specialist Programmer', date: '05 May 2026', package: '8.0 - 9.5 LPA', color: 'from-indigo-500 to-blue-600' }
];

interface AptitudeProgress {
  totalQuizzes: number;
  totalCorrect: number;
  totalQuestions: number;
}

interface DashboardStats {
  overallReadiness: number;
  mockTestsTaken: number;
  resumeAtsScore: number;
  dsaSolved: number;
  aptitudeAccuracy: number;
  companyPracticeAverage: number;
  hrRoundsPracticed: number;
  technicalRoundsPracticed: number;
  latestScore: number;
}

interface StatCard {
  id: string;
  title: string;
  value: string;
  icon: LucideIcon;
  accent: string;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: LucideIcon;
  iconClass: string;
}

interface ToolCard {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  accent: string;
}


const toolCards: ToolCard[] = [
  {
    id: 'aptitude-tests',
    title: 'Free Aptitude Tests',
    description: 'Practice company-specific mock tests for TCS, Amazon, etc.',
    route: '/exam-prep',
    icon: BookOpenCheck,
    accent: 'from-blue-50 to-cyan-50 border-blue-100'
  },
  {
    id: 'resume-ats',
    title: 'Resume ATS Analyzer',
    description: 'Upload your resume and get instant AI feedback & scoring',
    route: '/career',
    icon: FileText,
    accent: 'from-emerald-50 to-teal-50 border-emerald-100'
  },
  {
    id: 'dsa-code',
    title: 'DSA & Code Analysis',
    description: 'Get hints, debug code, and optimize your solutions with AI',
    route: '/coding',
    icon: Code2,
    accent: 'from-violet-50 to-purple-50 border-violet-100'
  },
  {
    id: 'interview-copilot',
    title: 'AI Interview Copilot',
    description: 'Chat with our AI to prepare for HR rounds and technical interviews',
    route: '/chat',
    icon: Bot,
    accent: 'from-orange-50 to-amber-50 border-orange-100'
  }
];

function readAptitudeProgress(): AptitudeProgress {
  try {
    const raw = localStorage.getItem(APTITUDE_PROGRESS_KEY);
    if (!raw) {
      return { totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0 };
    }

    const parsed = JSON.parse(raw);
    return {
      totalQuizzes: Number(parsed.totalQuizzes || 0),
      totalCorrect: Number(parsed.totalCorrect || 0),
      totalQuestions: Number(parsed.totalQuestions || 0)
    };
  } catch {
    return { totalQuizzes: 0, totalCorrect: 0, totalQuestions: 0 };
  }
}

function readNumericFromStorage(keys: string[]): number {
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined || raw === '') {
      continue;
    }

    const value = Number(raw);
    if (Number.isFinite(value) && value >= 0) {
      return value;
    }
  }

  return 0;
}

function toRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 60 * 60 * 1000) {
    const mins = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    return `${mins} min ago`;
  }

  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getActivityVisual(roundName: string): { icon: LucideIcon; iconClass: string } {
  const normalized = roundName.toLowerCase();

  if (normalized.includes('hr')) {
    return { icon: TrendingUp, iconClass: 'text-violet-600 bg-violet-50 border-violet-100' };
  }

  if (normalized.includes('coding') || normalized.includes('technical')) {
    return { icon: Code2, iconClass: 'text-blue-600 bg-blue-50 border-blue-100' };
  }

  return { icon: Trophy, iconClass: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
}

function isDsaLike(question: PracticeHistoryItem): boolean {
  const round = question.round_name.toLowerCase();
  const text = question.question_text.toLowerCase();
  return (
    round.includes('coding') ||
    round.includes('technical') ||
    /dsa|array|linked list|stack|queue|tree|graph|dp|dynamic programming|recursion/.test(text)
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);

  const [stats, setStats] = useState<DashboardStats>({
    overallReadiness: 0,
    mockTestsTaken: 0,
    resumeAtsScore: 0,
    dsaSolved: 0,
    aptitudeAccuracy: 0,
    companyPracticeAverage: 0,
    hrRoundsPracticed: 0,
    technicalRoundsPracticed: 0,
    latestScore: 0
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [dashboardSyncing, setDashboardSyncing] = useState(false);
  const [usageStats, setUsageStats] = useState<{ total_exams: number; limit: number; plan: string } | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const aptitude = readAptitudeProgress();
    const aptitudeAverage = aptitude.totalQuestions > 0
      ? Math.round((aptitude.totalCorrect / aptitude.totalQuestions) * 100)
      : 0;
    const resumeAtsScore = readNumericFromStorage([
      RESUME_ATS_SCORE_KEY,
      'resume_ats_score',
      'resumeATSScore'
    ]);
    const dsaFromChallenge = readNumericFromStorage([DSA_SOLVED_WITHIN_TIME_KEY]);

    setStats((current) => ({
      ...current,
      overallReadiness: aptitudeAverage,
      mockTestsTaken: aptitude.totalQuizzes,
      resumeAtsScore,
      dsaSolved: dsaFromChallenge,
      aptitudeAccuracy: aptitudeAverage,
    }));

    let active = true;
    setDashboardSyncing(true);

    const loadDashboardData = async () => {
      let practiceHistory: PracticeHistoryItem[] = [];
      let aptitudeHistory: any[] = [];
      
      try {
        const historyResponse = await companyPrepAPI.getHistory(20);
        practiceHistory = historyResponse.data || [];
      } catch {
        practiceHistory = [];
      }

      // Fetch aptitude exam history from database
      try {
        const aptitudeResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/aptitude/history`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (aptitudeResponse.ok) {
          aptitudeHistory = await aptitudeResponse.json();
        }
      } catch (error) {
        console.error('Failed to fetch aptitude history:', error);
        aptitudeHistory = [];
      }

      // Fetch usage stats for banner
      try {
        const usageResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/aptitude/usage-stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          setUsageStats({
            total_exams: usageData.total_exams,
            limit: usageData.limit_per_category || 2,
            plan: usageData.plan
          });
        }
      } catch (error) {
        console.error('Failed to fetch usage stats:', error);
      }

      if (!active) {
        return;
      }

      // Calculate aptitude stats from database (user-specific)
      const aptitudeAttempts = aptitudeHistory.length;
      const aptitudeAvgFromDB = aptitudeAttempts > 0
        ? Math.round(aptitudeHistory.reduce((sum: number, item: any) => sum + Number(item.score_percent || 0), 0) / aptitudeAttempts)
        : aptitudeAverage;

      const companyAttempts = practiceHistory.length;
      const companyAverage = companyAttempts > 0
        ? Math.round(practiceHistory.reduce((sum, item) => sum + Number(item.score || 0), 0) / companyAttempts)
        : 0;
      const latestScore = companyAttempts > 0 ? Number(practiceHistory[0].score || 0) : 0;
      const hrRoundsPracticed = practiceHistory.filter((item) => item.round_name.toLowerCase().includes('hr')).length;
      const technicalRoundsPracticed = practiceHistory.filter((item) => {
        const normalized = item.round_name.toLowerCase();
        return normalized.includes('technical') || normalized.includes('coding');
      }).length;
      
      // Use database aptitude data instead of localStorage
      const totalAttempts = aptitudeAttempts + companyAttempts;
      const weightedScore = (
        (aptitudeAvgFromDB * aptitudeAttempts) +
        (companyAverage * companyAttempts)
      );
      const overallReadiness = totalAttempts > 0 ? Math.round(weightedScore / totalAttempts) : aptitudeAvgFromDB;
      const dsaFromHistory = practiceHistory.filter(isDsaLike).length;

      setStats({
        overallReadiness,
        mockTestsTaken: totalAttempts,
        resumeAtsScore,
        dsaSolved: Math.max(dsaFromHistory, dsaFromChallenge),
        aptitudeAccuracy: aptitudeAvgFromDB,
        companyPracticeAverage: companyAverage,
        hrRoundsPracticed,
        technicalRoundsPracticed,
        latestScore
      });

      // Combine aptitude and company practice history for recent activity
      const allActivities: ActivityItem[] = [];
      
      // Add aptitude exam activities
      aptitudeHistory.slice(0, 10).forEach((exam: any) => {
        allActivities.push({
          id: `aptitude-${exam.id}`,
          title: `Completed ${exam.company} Aptitude Test`,
          subtitle: `${exam.category} - Scored ${exam.score_percent}%`,
          time: toRelativeTime(exam.exam_date),
          icon: BookOpenCheck,
          iconClass: 'text-blue-600 bg-blue-50 border-blue-100'
        });
      });

      // Add company practice activities
      practiceHistory.slice(0, 10).forEach((item) => {
        const visual = getActivityVisual(item.round_name);
        allActivities.push({
          id: `company-${item.id}`,
          title: `Practiced ${item.company_name} - ${item.round_name}`,
          subtitle: `Scored ${item.score}%`,
          time: toRelativeTime(item.practice_date),
          icon: visual.icon,
          iconClass: visual.iconClass
        });
      });

      // Sort by most recent and take top 5
      allActivities.sort((a, b) => {
        // Simple time comparison based on the time string
        const timeA = a.time.includes('min') ? 1 : a.time.includes('hour') ? 60 : 1440;
        const timeB = b.time.includes('min') ? 1 : b.time.includes('hour') ? 60 : 1440;
        return timeA - timeB;
      });

      setActivities(allActivities.slice(0, 5));
      setActivitiesLoaded(true);
      setDashboardSyncing(false);
    };

    const timer = window.setTimeout(loadDashboardData, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const statCards: StatCard[] = [
    {
      id: 'overall-readiness',
      title: 'Overall Readiness',
      value: `${stats.overallReadiness}%`,
      icon: Target,
      accent: 'from-blue-50 to-indigo-50 border-blue-100'
    },
    {
      id: 'mock-tests-taken',
      title: 'Mock Tests Taken',
      value: `${stats.mockTestsTaken} Tests`,
      icon: ClipboardCheck,
      accent: 'from-emerald-50 to-teal-50 border-emerald-100'
    },
    {
      id: 'resume-ats-score',
      title: 'Resume ATS Score',
      value: `${stats.resumeAtsScore}/100`,
      icon: FileText,
      accent: 'from-violet-50 to-purple-50 border-violet-100'
    },
    {
      id: 'dsa-solved',
      title: 'DSA Solved',
      value: `${stats.dsaSolved} Problems`,
      icon: Code2,
      accent: 'from-orange-50 to-amber-50 border-orange-100'
    }
  ];

  const insightCards = [
    {
      id: 'aptitude-accuracy',
      title: 'Aptitude Accuracy',
      value: `${stats.aptitudeAccuracy}%`,
      icon: Gauge,
      note: 'From your aptitude test answers',
      accent: 'from-sky-50 to-blue-50 border-sky-100'
    },
    {
      id: 'company-average',
      title: 'Company Practice Avg',
      value: `${stats.companyPracticeAverage}%`,
      icon: Activity,
      note: 'Average of interview/practice evaluations',
      accent: 'from-emerald-50 to-green-50 border-emerald-100'
    },
    {
      id: 'round-distribution',
      title: 'Rounds Practiced',
      value: `${stats.technicalRoundsPracticed} Tech • ${stats.hrRoundsPracticed} HR`,
      icon: Layers,
      note: 'Coverage across interview round types',
      accent: 'from-violet-50 to-purple-50 border-violet-100'
    },
    {
      id: 'latest-score',
      title: 'Latest Practice Score',
      value: stats.latestScore > 0 ? `${stats.latestScore}%` : 'No data',
      icon: Sparkles,
      note: 'Most recent company-prep attempt',
      accent: 'from-amber-50 to-orange-50 border-amber-100'
    }
  ];

  const handlePrepNow = (companyId: string) => {
    navigate('/exam-prep', { state: { companyId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Usage Banner for FREE users */}
      {showBanner && usageStats && usageStats.plan === 'free' && (
        <div className="bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 border-b border-orange-200">
          <div className="max-w-6xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    You have used {usageStats.total_exams} free assessments
                  </p>
                  <p className="text-xs text-gray-600">
                    Upgrade to Pro for unlimited tests and advanced features
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/pricing')}
                  className="rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 px-5 py-2 text-sm font-bold text-white shadow-md hover:from-yellow-600 hover:to-orange-700 transition-all"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {user?.name || 'Student'}!</h1>
            <p className="text-gray-600 mt-1">Your placement command center for tests, coding, resume, and interviews.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.id}
                  className={`rounded-2xl border bg-gradient-to-br ${stat.accent} p-5 shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{stat.title}</p>
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mb-10 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Performance Insights</h2>
            <p className="text-sm text-gray-600 mb-5">More live stats from your tests, practice rounds, and recent performance.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {insightCards.map((insight) => {
                const Icon = insight.icon;

                return (
                  <div key={insight.id} className={`rounded-xl border bg-gradient-to-br ${insight.accent} p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{insight.title}</p>
                      <Icon className="w-4 h-4 text-gray-700" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{insight.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{insight.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <div className="flex items-center gap-2">
                  {dashboardSyncing && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Syncing latest data...
                    </span>
                  )}
                  <button
                    onClick={() => navigate('/aptitude-history')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  >
                    <BookOpenCheck className="w-4 h-4" />
                    Exam History
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {!activitiesLoaded ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`activity-skeleton-${index}`}
                      className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 flex items-start gap-4 animate-pulse"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-200" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-1/3 rounded bg-gray-200" />
                      </div>
                      <div className="h-3 w-16 rounded bg-gray-200" />
                    </div>
                  ))
                ) : activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Activity className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No activity yet</p>
                    <p className="text-xs text-gray-500 mt-1">Start a mock test or practice session to see your progress here.</p>
                  </div>
                ) : (
                  activities.map((activity) => {
                    const ActivityIcon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 flex items-start gap-4"
                      >
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${activity.iconClass}`}>
                          <ActivityIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.subtitle}</p>
                        </div>
                        <div className="inline-flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                          <Clock3 className="w-3.5 h-3.5" />
                          {activity.time}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Upcoming Drives
              </h2>

              <div className="space-y-4">
                {upcomingPlacements.slice(0, 2).map((drive) => (
                  <div key={drive.companyId} className="rounded-xl border border-gray-100 p-4 relative overflow-hidden bg-white">
                    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${drive.color} opacity-10`} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-base">{drive.company}</h3>
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-1">
                          {drive.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{drive.role}</p>
                      <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1 mb-3">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="font-medium">{drive.package}</span>
                      </div>
                      <button
                        onClick={() => handlePrepNow(drive.companyId)}
                        className="w-full py-2.5 rounded-lg border border-indigo-100 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        Prep Now <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Placement Arsenal</h2>
            <p className="text-gray-600 mb-6">Quick tools to move from preparation to placement faster.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {toolCards.map((tool) => {
                const Icon = tool.icon;

                return (
                  <button
                    key={tool.id}
                    onClick={() => navigate(tool.route)}
                    className={`text-left bg-gradient-to-br ${tool.accent} border rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/90 border border-white flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105">
                          <Icon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{tool.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{tool.description}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-500 transition-all duration-300 group-hover:text-gray-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
