import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Flame, CheckCircle2 } from 'lucide-react';
import { getTodayChallenge, DailyChallenge } from '../services/engagementService';

export default function DailyChallengeWidget() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    try {
      const data = await getTodayChallenge();
      setChallenge(data);
    } catch (error) {
      console.error('Failed to load daily challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-300 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-6 h-6 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-700">Daily Challenge</h3>
        </div>
        <p className="text-gray-600 text-sm">No challenge available today. Check back tomorrow!</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-6 shadow-lg transition-all hover:shadow-xl ${
      challenge.is_completed 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
        : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            challenge.is_completed ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            {challenge.is_completed ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <Calendar className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Daily Challenge</h3>
            <p className="text-xs text-gray-600">
              {new Date(challenge.challenge_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        {challenge.is_completed ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Completed</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-semibold">+{challenge.bonus_points} pts</span>
          </div>
        )}
      </div>

      {/* Challenge Info */}
      <div className="mb-4">
        <h4 className="text-base font-semibold text-gray-900 mb-2">{challenge.question_title}</h4>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {challenge.topic}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {challenge.is_completed ? (
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-medium">
              Great job! You earned {challenge.bonus_points} bonus points!
            </span>
          </div>
          {challenge.completion_time && (
            <p className="text-xs text-green-600 mt-1">
              Completed at {new Date(challenge.completion_time).toLocaleTimeString()}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate(`/dsa/problem/${challenge.question_slug}`)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md"
        >
          Solve Challenge
        </button>
      )}

      {/* Streak Bonus Info */}
      {!challenge.is_completed && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Complete to maintain your streak!</span>
        </div>
      )}
    </div>
  );
}
