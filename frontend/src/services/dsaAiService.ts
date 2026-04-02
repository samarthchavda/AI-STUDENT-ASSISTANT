// DSA AI Service using Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface DSAProblemContext {
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  language: string;
}

export interface AIResponse {
  content: string;
  type: 'hint' | 'explanation' | 'solution' | 'code-explanation' | 'code-fix';
}

// Generate hint for the problem
export async function getHint(problem: DSAProblemContext): Promise<AIResponse> {
  const prompt = `You are a coding interview tutor helping a student solve a DSA problem.

Problem: ${problem.title}
Description: ${problem.description}

Examples:
${problem.examples.map((ex, i) => `Example ${i + 1}:
Input: ${ex.input}
Output: ${ex.output}
${ex.explanation ? `Explanation: ${ex.explanation}` : ''}`).join('\n\n')}

Constraints:
${problem.constraints.join('\n')}

Language: ${problem.language}

IMPORTANT: Do NOT provide the full solution. Give a helpful hint that guides the student toward the right approach.

Your hint should:
1. Identify the key pattern or data structure needed
2. Suggest the general approach without giving away the implementation
3. Point out any edge cases to consider
4. Be encouraging and educational

Provide a concise hint (3-5 sentences max).`;

  return callGemini(prompt, 'hint');
}

// Explain the problem in simpler terms
export async function explainProblem(problem: DSAProblemContext): Promise<AIResponse> {
  const prompt = `You are a coding interview tutor explaining a DSA problem to a beginner.

Problem: ${problem.title}
Description: ${problem.description}

Examples:
${problem.examples.map((ex, i) => `Example ${i + 1}:
Input: ${ex.input}
Output: ${ex.output}
${ex.explanation ? `Explanation: ${ex.explanation}` : ''}`).join('\n\n')}

Constraints:
${problem.constraints.join('\n')}

Explain this problem in simple, beginner-friendly language:
1. What is the problem asking for?
2. What are the inputs and outputs?
3. What pattern or approach is most relevant?
4. Any important edge cases to watch for?

Keep it clear and concise (5-7 sentences).`;

  return callGemini(prompt, 'explanation');
}

// Generate complete solution
export async function generateSolution(problem: DSAProblemContext): Promise<AIResponse> {
  const prompt = `You are an expert coding interview tutor. Generate a complete, optimized solution for this DSA problem.

Problem: ${problem.title}
Description: ${problem.description}

Examples:
${problem.examples.map((ex, i) => `Example ${i + 1}:
Input: ${ex.input}
Output: ${ex.output}
${ex.explanation ? `Explanation: ${ex.explanation}` : ''}`).join('\n\n')}

Constraints:
${problem.constraints.join('\n')}

Language: ${problem.language}

Generate a complete, working solution in ${problem.language} that:
1. Is optimized for time and space complexity
2. Handles all edge cases
3. Includes brief inline comments explaining key steps
4. Follows best practices for ${problem.language}
5. Is interview-appropriate and production-ready

IMPORTANT: Return ONLY the code, no explanations before or after. The code should be ready to paste into an editor.`;

  return callGemini(prompt, 'solution');
}

// Explain user's code
export async function explainCode(code: string, language: string, problemTitle: string): Promise<AIResponse> {
  const prompt = `You are a coding interview tutor analyzing a student's code.

Problem: ${problemTitle}
Language: ${language}

Student's Code:
\`\`\`${language}
${code}
\`\`\`

Analyze this code and provide:
1. What the code is doing (step by step)
2. Time complexity: O(?)
3. Space complexity: O(?)
4. Any potential issues or bugs
5. Suggestions for improvement (if any)

Be constructive and educational. Keep it concise (6-8 sentences).`;

  return callGemini(prompt, 'code-explanation');
}

// Fix user's code
export async function fixCode(
  code: string,
  language: string,
  problemTitle: string,
  error?: string
): Promise<AIResponse> {
  const prompt = `You are a coding interview tutor helping debug a student's code.

Problem: ${problemTitle}
Language: ${language}

Student's Code:
\`\`\`${language}
${code}
\`\`\`

${error ? `Error encountered:\n${error}\n` : ''}

Provide:
1. Brief explanation of the bug or issue (2-3 sentences)
2. Corrected code in ${language}

IMPORTANT: Return the explanation first, then the corrected code in a code block.`;

  return callGemini(prompt, 'code-fix');
}

// Call Gemini API
async function callGemini(prompt: string, type: AIResponse['type']): Promise<AIResponse> {
  // Mock response for development without API key
  if (!genAI || !GEMINI_API_KEY) {
    return getMockResponse(type);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: text,
      type
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate AI response. Please try again.');
  }
}

// Mock responses for development
function getMockResponse(type: AIResponse['type']): AIResponse {
  const mockResponses: Record<AIResponse['type'], string> = {
    hint: `💡 Think about using a hash map to store values you've seen before. This allows you to check if the complement exists in O(1) time. Consider what you need to store as the key and value in your hash map.`,
    
    explanation: `This problem asks you to find two numbers in an array that add up to a target value. You're given an array of integers and a target number, and you need to return the indices (positions) of the two numbers that sum to the target. For example, if the array is [2, 7, 11, 15] and target is 9, you should return [0, 1] because 2 + 7 = 9. The key insight is that for each number, you can calculate what its "complement" would need to be (target - current number), and check if you've seen that complement before.`,
    
    solution: `def twoSum(nums, target):
    # Use hash map to store value -> index mapping
    seen = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        # Check if complement exists in our map
        if complement in seen:
            return [seen[complement], i]
        
        # Store current number and its index
        seen[num] = i
    
    return []  # No solution found

# Test
import json
nums, target = json.loads(input())
print(json.dumps(twoSum(nums, target)))`,
    
    'code-explanation': `Your code iterates through the array using nested loops to check every pair of numbers. The outer loop picks the first number, and the inner loop checks all remaining numbers to see if they sum to the target. Time complexity is O(n²) because of the nested loops. Space complexity is O(1) as you're not using extra data structures. While this solution works correctly, it's not optimal for large inputs. Consider using a hash map to reduce the time complexity to O(n).`,
    
    'code-fix': `The issue is that you're not handling the case where the same element is used twice. You need to ensure i != j in your condition.

Here's the corrected code:

\`\`\`python
def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):  # Start from i+1, not 0
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
\`\`\`

The key change is starting the inner loop from i+1 instead of 0, which prevents using the same element twice and improves efficiency.`
  };

  return {
    content: mockResponses[type],
    type
  };
}
