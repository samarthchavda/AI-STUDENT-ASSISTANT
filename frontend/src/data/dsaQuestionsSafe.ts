// CodeCampus AI - Original DSA Practice Problems
// Copyright-safe, educational content
// Not affiliated with any external coding platform

export interface DSAQuestion {
  id: number;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  companies: string[];
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
  acceptance: number;
  timeLimit: number;
  source: string; // Always "CodeCampus AI - Original"
}

export const dsaQuestions: DSAQuestion[] = [
  // ==================== ARRAYS ====================
  {
    id: 1,
    slug: 'pair-sum-finder',
    title: 'Pair Sum Finder',
    difficulty: 'Easy',
    topic: 'Arrays',
    companies: ['Amazon', 'Google', 'Microsoft', 'TCS', 'Infosys'],
    description: 'You are given a list of numbers and a target value. Your task is to find two different positions in the list where the values add up to the target. Return the positions (indices) of these two numbers.\n\nYou can assume there is always exactly one valid answer, and you cannot use the same position twice. The order of indices in your answer does not matter.',
    examples: [
      { input: 'numbers = [3,8,12,16], target = 11', output: '[0,1]', explanation: 'The values at positions 0 and 1 are 3 and 8, which sum to 11.' },
      { input: 'numbers = [4,3,5], target = 8', output: '[1,2]', explanation: 'Positions 1 and 2 have values 3 and 5.' },
      { input: 'numbers = [5,5], target = 10', output: '[0,1]' }
    ],
    constraints: [
      'List contains at least 2 numbers',
      'Numbers can be negative or positive',
      'Target can be any integer',
      'Exactly one solution exists'
    ],
    starterCode: {
      python: 'def findPairSum(numbers, target):\n    # Write your solution here\n    pass\n\n# Test\nimport json\nnumbers, target = json.loads(input())\nprint(json.dumps(findPairSum(numbers, target)))',
      javascript: 'function findPairSum(numbers, target) {\n    // Write your solution here\n}\n\n// Test\nconst input = require("fs").readFileSync(0, "utf-8").trim();\nconst [numbers, target] = JSON.parse(input);\nconsole.log(JSON.stringify(findPairSum(numbers, target)));',
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> findPairSum(vector<int>& numbers, int target) {\n    // Write your solution here\n}\n\nint main() {\n    return 0;\n}'
    },
    testCases: {
      visible: [
        { input: '[[3,8,12,16], 11]', expected: '[0,1]' },
        { input: '[[4,3,5], 8]', expected: '[1,2]' }
      ],
      hidden: [
        { input: '[[5,5], 10]', expected: '[0,1]' },
        { input: '[[2,6,4,8,10], 12]', expected: '[1,3]' },
        { input: '[[0,5,4,0], 0]', expected: '[0,3]' }
      ]
    },
    acceptance: 49.2,
    timeLimit: 1800,
    source: 'CodeCampus AI - Original'
  },
  {
    id: 2,
    slug: 'max-profit-price-changes',
    title: 'Maximum Profit from Price Changes',
    difficulty: 'Easy',
    topic: 'Arrays',
    companies: ['Amazon', 'Microsoft', 'Google', 'Wipro'],
    description: 'You have access to historical price data for an item over several days. You can buy the item on one day and sell it on a later day to make a profit.\n\nCalculate the maximum profit you can achieve from one buy-sell transaction. If no profit is possible (prices only decrease), return 0.\n\nNote: You must buy before you sell.',
    examples: [
      { input: 'prices = [8,2,6,4,7,5]', output: '5', explanation: 'Buy at price 2 (day 2) and sell at price 7 (day 5) for profit of 5.' },
      { input: 'prices = [9,7,5,3,1]', output: '0', explanation: 'Prices only decrease, so no profit possible.' }
    ],
    constraints: [
      'At least one price value',
      'Prices are non-negative integers',
      'Must buy before selling'
    ],
    starterCode: {
      python: 'def maxProfit(prices):\n    # Write your solution here\n    pass\n\n# Test\nimport json\nprices = json.loads(input())\nprint(maxProfit(prices))',
      javascript: 'function maxProfit(prices) {\n    // Write your solution here\n}\n\n// Test\nconst input = require("fs").readFileSync(0, "utf-8").trim();\nconst prices = JSON.parse(input);\nconsole.log(maxProfit(prices));',
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint maxProfit(vector<int>& prices) {\n    // Write your solution here\n}\n\nint main() {\n    return 0;\n}'
    },
    testCases: {
      visible: [
        { input: '[8,2,6,4,7,5]', expected: '5' },
        { input: '[9,7,5,3,1]', expected: '0' }
      ],
      hidden: [
        { input: '[3,5,2]', expected: '2' },
        { input: '[4,3,7,6,1,4]', expected: '4' },
        { input: '[2]', expected: '0' }
      ]
    },
    acceptance: 54.1,
    timeLimit: 1500,
    source: 'CodeCampus AI - Original'
  },
  {
    id: 3,
    slug: 'duplicate-value-detector',
    title: 'Duplicate Value Detector',
    difficulty: 'Easy',
    topic: 'Arrays',
    companies: ['TCS', 'Infosys', 'Amazon'],
    description: 'Given a list of integers, determine if any value appears more than once in the list.\n\nReturn true if at least one duplicate exists, otherwise return false if all values are unique.',
    examples: [
      { input: 'values = [1,3,5,1]', output: 'true', explanation: 'The value 1 appears twice.' },
      { input: 'values = [1,3,5,7]', output: 'false', explanation: 'All values are unique.' },
      { input: 'values = [2,2,2,4,4,5]', output: 'true' }
    ],
    constraints: [
      'List has at least one element',
      'Values can be any integer'
    ],
    starterCode: {
      python: 'def hasDuplicate(values):\n    # Write your solution here\n    pass\n\n# Test\nimport json\nvalues = json.loads(input())\nprint(json.dumps(hasDuplicate(values)))',
      javascript: 'function hasDuplicate(values) {\n    // Write your solution here\n}\n\n// Test\nconst input = require("fs").readFileSync(0, "utf-8").trim();\nconst values = JSON.parse(input);\nconsole.log(JSON.stringify(hasDuplicate(values)));',
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nbool hasDuplicate(vector<int>& values) {\n    // Write your solution here\n}\n\nint main() {\n    return 0;\n}'
    },
    testCases: {
      visible: [
        { input: '[1,3,5,1]', expected: 'true' },
        { input: '[1,3,5,7]', expected: 'false' }
      ],
      hidden: [
        { input: '[2,2,2,4,4,5]', expected: 'true' },
        { input: '[1]', expected: 'false' },
        { input: '[2,6,10,2,6,10]', expected: 'true' }
      ]
    },
    acceptance: 61.3,
    timeLimit: 1200,
    source: 'CodeCampus AI - Original'
  },
