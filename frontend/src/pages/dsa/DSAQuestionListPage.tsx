import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Search, Filter, CheckCircle2, Circle } from 'lucide-react';
import Header from '../../components/Header';

interface DSAQuestion {
  id: number;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  solved: boolean;
  acceptance: number;
}

const mockQuestions: DSAQuestion[] = [
  { id: 1, slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', solved: true, acceptance: 49.2 },
  { id: 2, slug: 'reverse-string', title: 'Reverse String', difficulty: 'Easy', topic: 'Strings', solved: true, acceptance: 76.8 },
  { id: 3, slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', solved: false, acceptance: 40.1 },
  { id: 4, slug: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Arrays', solved: false, acceptance: 45.3 },
  { id: 5, slug: 'longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window', solved: false, acceptance: 33.8 },
  { id: 6, slug: 'binary-tree-inorder', title: 'Binary Tree Inorder Traversal', difficulty: 'Easy', topic: 'Trees', solved: false, acceptance: 71.2 },
  { id: 7, slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium', topic: 'DP', solved: false, acceptance: 41.5 },
  { id: 8, slug: 'word-ladder', title: 'Word Ladder', difficulty: 'Hard', topic: 'Graph', solved: false, acceptance: 36.7 },
  { id: 9, slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', topic: 'DP', solved: true, acceptance: 51.4 },
  { id: 10, slug: 'median-sorted-arrays', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Binary Search', solved: false, acceptance: 35.2 },
];

const topics = ['All', 'Arrays', 'Strings', 'DP', 'Graph', 'Trees', 'Stack', 'Sliding Window', 'Binary Search', 'Recursion'];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

export default function DSAQuestionListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [solvedFilter, setSolvedFilter] = useState<'all' | 'solved' | 'unsolved'>('all');

  const filteredQuestions = mockQuestions.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || q.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesSolved = 
      solvedFilter === 'all' || 
      (solvedFilter === 'solved' && q.solved) || 
      (solvedFilter === 'unsolved' && !q.solved);
    
    return matchesSearch && matchesTopic && matchesDifficulty && matchesSolved;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">DSA Practice</h1>
            </div>
            <p className="text-gray-600">Master data structures and algorithms with curated problems</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={solvedFilter}
                  onChange={(e) => setSolvedFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Problems</option>
                  <option value="solved">Solved</option>
                  <option value="unsolved">Unsolved</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium">
                    {filteredQuestions.length} problems found
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acceptance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQuestions.map((question) => (
                    <tr
                      key={question.id}
                      onClick={() => navigate(`/dsa/problem/${question.slug}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        {question.solved ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {question.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {question.topic}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{question.acceptance}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No problems found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
