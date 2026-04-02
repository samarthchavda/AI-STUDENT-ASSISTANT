import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Play, Send, ChevronDown } from 'lucide-react';
import Header from '../../components/Header';
import DSACodeEditor from './components/DSACodeEditor';
import DSAProblemStatement from './components/DSAProblemStatement';

interface ProblemData {
  id: number;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: {
    python: string;
    javascript: string;
    cpp: string;
  };
  timeLimit: number;
}

const mockProblems: Record<string, ProblemData> = {
  'two-sum': {
    id: 1,
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      python: 'def twoSum(nums, target):\n    # Write your code here\n    pass',
      javascript: 'function twoSum(nums, target) {\n    // Write your code here\n}',
      cpp: 'vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n}'
    },
    timeLimit: 1800
  },
  'reverse-string': {
    id: 2,
    slug: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    topic: 'Strings',
    description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]'
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.'
    ],
    starterCode: {
      python: 'def reverseString(s):\n    # Write your code here\n    pass',
      javascript: 'function reverseString(s) {\n    // Write your code here\n}',
      cpp: 'void reverseString(vector<char>& s) {\n    // Write your code here\n}'
    },
    timeLimit: 900
  },
  'valid-parentheses': {
    id: 3,
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    starterCode: {
      python: 'def isValid(s):\n    # Write your code here\n    pass',
      javascript: 'function isValid(s) {\n    // Write your code here\n}',
      cpp: 'bool isValid(string s) {\n    // Write your code here\n}'
    },
    timeLimit: 1200
  },
  'merge-intervals': {
    id: 4,
    slug: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    topic: 'Arrays',
    description: 'Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.'
      }
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4'
    ],
    starterCode: {
      python: 'def merge(intervals):\n    # Write your code here\n    pass',
      javascript: 'function merge(intervals) {\n    // Write your code here\n}',
      cpp: 'vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    // Write your code here\n}'
    },
    timeLimit: 2400
  },
  'climbing-stairs': {
    id: 9,
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    topic: 'DP',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps'
      },
      {
        input: 'n = 3',
        output: '3',
        explanation: 'There are three ways to climb to the top: 1. 1 step + 1 step + 1 step, 2. 1 step + 2 steps, 3. 2 steps + 1 step'
      }
    ],
    constraints: [
      '1 <= n <= 45'
    ],
    starterCode: {
      python: 'def climbStairs(n):\n    # Write your code here\n    pass',
      javascript: 'function climbStairs(n) {\n    // Write your code here\n}',
      cpp: 'int climbStairs(int n) {\n    // Write your code here\n}'
    },
    timeLimit: 1500
  }
};

export default function DSAProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'javascript' | 'cpp'>('python');
  const [code, setCode] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (slug && mockProblems[slug]) {
      const problemData = mockProblems[slug];
      setProblem(problemData);
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [slug]);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[selectedLanguage]);
    }
  }, [selectedLanguage, problem]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      alert('Run functionality will be implemented in next phase');
    }, 500);
  };

  const handleSubmit = () => {
    alert('Submit functionality will be implemented in next phase');
  };

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 px-4 flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Problem not found</p>
            <button
              onClick={() => navigate('/dsa')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Problems
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/dsa')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Problems</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-mono font-medium text-gray-900">
                  {formatTime(timeElapsed)}
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <Play className="w-4 h-4" />
                Run
              </button>

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-full lg:w-1/2 overflow-y-auto border-r border-gray-200">
            <DSAProblemStatement problem={problem} />
          </div>

          <div className="hidden lg:block lg:w-1/2 bg-gray-900">
            <DSACodeEditor
              code={code}
              language={selectedLanguage}
              onChange={setCode}
            />
          </div>
        </div>

        <div className="lg:hidden">
          <div className="bg-gray-900 h-96">
            <DSACodeEditor
              code={code}
              language={selectedLanguage}
              onChange={setCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
