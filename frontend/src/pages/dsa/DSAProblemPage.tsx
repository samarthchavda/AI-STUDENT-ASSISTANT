import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Play, Send, ChevronDown, CheckCircle2, XCircle, AlertCircle, Loader2, Lightbulb, BookOpen, Code, Sparkles, Copy, Bug } from 'lucide-react';
import Header from '../../components/Header';
import DSACodeEditor from './components/DSACodeEditor';
import DSAProblemStatement from './components/DSAProblemStatement';
import { runCode, submitCode, ExecutionResult } from '../../services/codeExecutionService';
import { getHint, explainProblem, generateSolution, explainCode, fixCode, AIResponse } from '../../services/dsaAiService';

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
  testCases: {
    visible: Array<{ input: string; expected: string }>;
    hidden: Array<{ input: string; expected: string }>;
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
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      python: 'def twoSum(nums, target):\n    # Write your code here\n    pass\n\n# Test\nimport json\nnums, target = json.loads(input())\nprint(json.dumps(twoSum(nums, target)))',
      javascript: 'function twoSum(nums, target) {\n    // Write your code here\n}\n\n// Test\nconst input = require("fs").readFileSync(0, "utf-8").trim();\nconst [nums, target] = JSON.parse(input);\nconsole.log(JSON.stringify(twoSum(nums, target)));',
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n}\n\nint main() {\n    // Test code here\n    return 0;\n}'
    },
    testCases: {
      visible: [
        { input: '[[2,7,11,15], 9]', expected: '[0,1]' },
        { input: '[[3,2,4], 6]', expected: '[1,2]' }
      ],
      hidden: [
        { input: '[[3,3], 6]', expected: '[0,1]' },
        { input: '[[1,5,3,7,9], 10]', expected: '[1,3]' },
        { input: '[[0,4,3,0], 0]', expected: '[0,3]' }
      ]
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
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.'
    ],
    starterCode: {
      python: 'def reverseString(s):\n    # Write your code here\n    pass\n\n# Test\nimport json\ns = json.loads(input())\nreverseString(s)\nprint(json.dumps(s))',
      javascript: 'function reverseString(s) {\n    // Write your code here\n}\n\n// Test\nconst input = require("fs").readFileSync(0, "utf-8").trim();\nconst s = JSON.parse(input);\nreverseString(s);\nconsole.log(JSON.stringify(s));',
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid reverseString(vector<char>& s) {\n    // Write your code here\n}\n\nint main() {\n    return 0;\n}'
    },
    testCases: {
      visible: [
        { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' }
      ],
      hidden: [
        { input: '["H","a","n","n","a","h"]', expected: '["h","a","n","n","a","H"]' },
        { input: '["a"]', expected: '["a"]' }
      ]
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
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.'
    ],
    starterCode: {
      python: 'def isValid(s):\n    # Write your code here\n    pass\n\n# Test\nimport json\ns = input().strip()\nprint(json.dumps(isValid(s)))',
      javascript: 'function isValid(s) {\n    // Write your code here\n}\n\n// Test\nconst input = require("fs").readFileSync(0, "utf-8").trim();\nconsole.log(JSON.stringify(isValid(input)));',
      cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your code here\n}\n\nint main() {\n    return 0;\n}'
    },
    testCases: {
      visible: [
        { input: '()', expected: 'true' },
        { input: '()[]{}', expected: 'true' }
      ],
      hidden: [
        { input: '(]', expected: 'false' },
        { input: '([)]', expected: 'false' },
        { input: '{[]}', expected: 'true' }
      ]
    },
    timeLimit: 1200
  },
  'climbing-stairs': {
    id: 9,
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    topic: 'DP',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explanation: 'There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps' },
      { input: 'n = 3', output: '3', explanation: 'There are three ways: 1+1+1, 1+2, 2+1' }
    ],
    constraints: ['1 <= n <= 45'],
    starterCode: {
      python: 'def climbStairs(n):\n    # Write your code here\n    pass\n\n# Test\nn = int(input())\nprint(climbStairs(n))',
      javascript: 'function climbStairs(n) {\n    // Write your code here\n}\n\n// Test\nconst input = require("fs").readFileSync(0, "utf-8").trim();\nconsole.log(climbStairs(parseInt(input)));',
      cpp: '#include <iostream>\nusing namespace std;\n\nint climbStairs(int n) {\n    // Write your code here\n}\n\nint main() {\n    return 0;\n}'
    },
    testCases: {
      visible: [
        { input: '2', expected: '2' },
        { input: '3', expected: '3' }
      ],
      hidden: [
        { input: '4', expected: '5' },
        { input: '5', expected: '8' },
        { input: '10', expected: '89' }
      ]
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  // AI states
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (slug && mockProblems[slug]) {
      const problemData = mockProblems[slug];
      setProblem(problemData);
      setCode(problemData.starterCode[selectedLanguage]);
      setExecutionResult(null);
      setShowResult(false);
    }
  }, [slug]);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[selectedLanguage]);
      setExecutionResult(null);
      setShowResult(false);
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

  const handleRun = async () => {
    if (!problem) return;
    
    setIsRunning(true);
    setShowResult(true);
    setExecutionResult({ status: 'Running' });

    try {
      const result = await runCode(code, selectedLanguage, problem.testCases.visible);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        status: 'Runtime Error',
        error: error instanceof Error ? error.message : 'Execution failed'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    
    setIsSubmitting(true);
    setShowResult(true);
    setExecutionResult({ status: 'Running' });

    try {
      const allTestCases = [...problem.testCases.visible, ...problem.testCases.hidden];
      const result = await submitCode(code, selectedLanguage, allTestCases);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        status: 'Runtime Error',
        error: error instanceof Error ? error.message : 'Submission failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-700 border-green-300';
      case 'Wrong Answer': return 'bg-red-100 text-red-700 border-red-300';
      case 'Runtime Error': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Time Limit Exceeded': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Compilation Error': return 'bg-red-100 text-red-700 border-red-300';
      case 'Running': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return <CheckCircle2 className="w-5 h-5" />;
      case 'Wrong Answer': return <XCircle className="w-5 h-5" />;
      case 'Runtime Error': return <AlertCircle className="w-5 h-5" />;
      case 'Time Limit Exceeded': return <Clock className="w-5 h-5" />;
      case 'Compilation Error': return <XCircle className="w-5 h-5" />;
      case 'Running': return <Loader2 className="w-5 h-5 animate-spin" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  // AI Handlers
  const handleGetHint = async () => {
    if (!problem) return;
    
    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiError(null);
    
    try {
      const response = await getHint({
        title: problem.title,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        language: selectedLanguage
      });
      setAiResponse(response);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to get hint');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExplainProblem = async () => {
    if (!problem) return;
    
    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiError(null);
    
    try {
      const response = await explainProblem({
        title: problem.title,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        language: selectedLanguage
      });
      setAiResponse(response);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to explain problem');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateSolution = async () => {
    if (!problem) return;
    
    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiError(null);
    
    try {
      const response = await generateSolution({
        title: problem.title,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        language: selectedLanguage
      });
      setAiResponse(response);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to generate solution');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExplainMyCode = async () => {
    if (!problem || !code.trim()) {
      setAiError('Please write some code first');
      setShowAiPanel(true);
      return;
    }
    
    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiError(null);
    
    try {
      const response = await explainCode(code, selectedLanguage, problem.title);
      setAiResponse(response);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to explain code');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFixMyCode = async () => {
    if (!problem || !code.trim()) {
      setAiError('Please write some code first');
      setShowAiPanel(true);
      return;
    }
    
    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiError(null);
    
    try {
      const errorMsg = executionResult?.error || undefined;
      const response = await fixCode(code, selectedLanguage, problem.title, errorMsg);
      setAiResponse(response);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to fix code');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePasteToEditor = () => {
    if (!aiResponse || aiResponse.type !== 'solution') return;
    
    // Extract code from response (remove markdown code blocks if present)
    let codeContent = aiResponse.content;
    const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/;
    const match = codeContent.match(codeBlockRegex);
    if (match) {
      codeContent = match[1];
    }
    
    if (confirm('This will replace your current code. Continue?')) {
      setCode(codeContent);
      setShowAiPanel(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
          <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4 flex-wrap">
            <button
              onClick={() => navigate('/dsa')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Problems</span>
            </button>

            <div className="flex items-center gap-3 flex-wrap">
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
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="w-full lg:w-1/2 overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-200">
            <DSAProblemStatement problem={problem} />
            
            {/* AI Tools Section */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={handleGetHint}
                  disabled={isAiLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50 transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Get Hint</span>
                  <span className="sm:hidden">Hint</span>
                </button>
                
                <button
                  onClick={handleExplainProblem}
                  disabled={isAiLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Explain</span>
                  <span className="sm:hidden">Explain</span>
                </button>
                
                <button
                  onClick={handleGenerateSolution}
                  disabled={isAiLoading}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors"
                >
                  <Code className="w-4 h-4" />
                  <span className="hidden sm:inline">Solution</span>
                  <span className="sm:hidden">Solution</span>
                </button>
                
                <button
                  onClick={handleExplainMyCode}
                  disabled={isAiLoading || !code.trim()}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Explain Code</span>
                  <span className="sm:hidden">Explain</span>
                </button>
                
                <button
                  onClick={handleFixMyCode}
                  disabled={isAiLoading || !code.trim()}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm font-medium text-orange-700 hover:bg-orange-50 disabled:opacity-50 transition-colors"
                >
                  <Bug className="w-4 h-4" />
                  <span className="hidden sm:inline">Fix Code</span>
                  <span className="sm:hidden">Fix</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col bg-gray-900">
            <div className="flex-1 overflow-hidden">
              <DSACodeEditor
                code={code}
                language={selectedLanguage}
                onChange={setCode}
              />
            </div>

            {/* AI Response Panel */}
            {showAiPanel && (
              <div className="border-t border-gray-700 bg-gradient-to-r from-purple-900 to-blue-900 p-4 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                    <h3 className="text-sm font-semibold text-white">
                      {isAiLoading ? 'AI is thinking...' : 'AI Assistant'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAiPanel(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {isAiLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-purple-300 animate-spin" />
                  </div>
                )}

                {aiError && !isAiLoading && (
                  <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                    <p className="text-sm text-red-200">{aiError}</p>
                  </div>
                )}

                {aiResponse && !isAiLoading && !aiError && (
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-700">
                      <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
                        {aiResponse.content}
                      </pre>
                    </div>

                    <div className="flex items-center gap-2">
                      {aiResponse.type === 'solution' && (
                        <button
                          onClick={handlePasteToEditor}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <Code className="w-4 h-4" />
                          Paste to Editor
                        </button>
                      )}
                      
                      <button
                        onClick={() => copyToClipboard(aiResponse.content)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showResult && executionResult && (
              <div className="border-t border-gray-700 bg-gray-800 p-4 max-h-64 overflow-y-auto">
                <div className="mb-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium ${getStatusColor(executionResult.status)}`}>
                    {getStatusIcon(executionResult.status)}
                    <span>{executionResult.status}</span>
                  </div>
                </div>

                {executionResult.passedTests !== undefined && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-300">
                      Test Cases: <span className="font-semibold text-white">{executionResult.passedTests}/{executionResult.totalTests}</span> passed
                    </p>
                  </div>
                )}

                {executionResult.runtime !== undefined && (
                  <div className="mb-3 flex items-center gap-4 text-sm text-gray-400">
                    <span>Runtime: <span className="text-gray-200">{executionResult.runtime.toFixed(2)}s</span></span>
                    {executionResult.memory && (
                      <span>Memory: <span className="text-gray-200">{(executionResult.memory / 1024).toFixed(1)} MB</span></span>
                    )}
                  </div>
                )}

                {executionResult.output && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-400 mb-1">Output:</p>
                    <pre className="bg-gray-900 rounded p-3 text-sm text-green-400 font-mono overflow-x-auto">
                      {executionResult.output}
                    </pre>
                  </div>
                )}

                {executionResult.error && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-400 mb-1">Error:</p>
                    <pre className="bg-gray-900 rounded p-3 text-sm text-red-400 font-mono overflow-x-auto">
                      {executionResult.error}
                    </pre>
                  </div>
                )}

                {executionResult.testResults && executionResult.testResults.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2">Test Results:</p>
                    <div className="space-y-2">
                      {executionResult.testResults.slice(0, 3).map((test, idx) => (
                        <div key={idx} className={`bg-gray-900 rounded p-3 border ${test.passed ? 'border-green-700' : 'border-red-700'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {test.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs font-semibold text-gray-300">Test Case {idx + 1}</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <div><span className="text-gray-500">Input:</span> <span className="text-gray-300">{test.input}</span></div>
                            <div><span className="text-gray-500">Expected:</span> <span className="text-gray-300">{test.expected}</span></div>
                            <div><span className="text-gray-500">Actual:</span> <span className={test.passed ? 'text-green-400' : 'text-red-400'}>{test.actual || 'null'}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
