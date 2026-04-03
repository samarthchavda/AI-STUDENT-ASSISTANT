// Code Execution Service using Judge0 API
// Judge0 is a free, open-source code execution system

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || 'test-key';

// Language IDs for Judge0
export const LANGUAGE_IDS = {
  python: 71,      // Python 3
  javascript: 63,  // JavaScript (Node.js)
  cpp: 54,         // C++ (GCC 9.2.0)
  java: 62         // Java (OpenJDK 13.0.1)
} as const;

export interface ExecutionResult {
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' | 'Compilation Error' | 'Running';
  output?: string;
  error?: string;
  runtime?: number;
  memory?: number;
  passedTests?: number;
  totalTests?: number;
  testResults?: Array<{
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
}

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function executeCode(code: string, language: keyof typeof LANGUAGE_IDS, input: string = ''): Promise<Judge0Response> {
  const languageId = LANGUAGE_IDS[language];
  
  // For demo/development without API key, use mock execution
  if (JUDGE0_API_KEY === 'test-key') {
    return mockExecution(code, language, input);
  }

  try {
    // Submit code
    const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: input,
        cpu_time_limit: 2,
        memory_limit: 128000
      })
    });

    const { token } = await submitResponse.json();

    // Poll for result
    let attempts = 0;
    while (attempts < 10) {
      await sleep(1000);
      
      const resultResponse = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`, {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });

      const result = await resultResponse.json();
      
      if (result.status.id > 2) {
        return result;
      }
      
      attempts++;
    }

    throw new Error('Execution timeout');
  } catch (error) {
    console.error('Judge0 execution error:', error);
    throw error;
  }
}

// Mock execution for development/demo
function mockExecution(code: string, _language: keyof typeof LANGUAGE_IDS, input: string): Promise<Judge0Response> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple mock logic
      const hasError = code.includes('throw') || code.includes('error') || code.includes('undefined');
      const isEmpty = code.trim().length < 20;

      if (hasError) {
        resolve({
          stdout: null,
          stderr: 'Runtime Error: Execution failed',
          compile_output: null,
          status: { id: 6, description: 'Runtime Error' },
          time: '0.05',
          memory: 2048
        });
      } else if (isEmpty) {
        resolve({
          stdout: null,
          stderr: null,
          compile_output: 'Error: No implementation found',
          status: { id: 6, description: 'Compilation Error' },
          time: null,
          memory: null
        });
      } else {
        resolve({
          stdout: 'Mock output: Code executed successfully\nInput: ' + (input || 'none'),
          stderr: null,
          compile_output: null,
          status: { id: 3, description: 'Accepted' },
          time: '0.12',
          memory: 4096
        });
      }
    }, 800);
  });
}

export async function runCode(
  code: string,
  language: keyof typeof LANGUAGE_IDS,
  testCases: Array<{ input: string; expected: string }>
): Promise<ExecutionResult> {
  try {
    if (testCases.length === 0) {
      // Run with empty input
      const result = await executeCode(code, language, '');
      return parseExecutionResult(result);
    }

    // Run first test case only for "Run"
    const testCase = testCases[0];
    const result = await executeCode(code, language, testCase.input);
    
    return {
      ...parseExecutionResult(result),
      testResults: [{
        input: testCase.input,
        expected: testCase.expected,
        actual: result.stdout?.trim() || '',
        passed: result.stdout?.trim() === testCase.expected.trim()
      }]
    };
  } catch (error) {
    return {
      status: 'Runtime Error',
      error: error instanceof Error ? error.message : 'Execution failed'
    };
  }
}

export async function submitCode(
  code: string,
  language: keyof typeof LANGUAGE_IDS,
  testCases: Array<{ input: string; expected: string }>
): Promise<ExecutionResult> {
  try {
    let passedCount = 0;
    const testResults: ExecutionResult['testResults'] = [];

    for (const testCase of testCases) {
      const result = await executeCode(code, language, testCase.input);
      
      if (result.status.id !== 3) {
        // Not accepted
        return {
          ...parseExecutionResult(result),
          passedTests: passedCount,
          totalTests: testCases.length,
          testResults
        };
      }

      const actual = result.stdout?.trim() || '';
      const expected = testCase.expected.trim();
      const passed = actual === expected;

      testResults.push({
        input: testCase.input,
        expected,
        actual,
        passed
      });

      if (passed) {
        passedCount++;
      } else {
        return {
          status: 'Wrong Answer',
          passedTests: passedCount,
          totalTests: testCases.length,
          testResults
        };
      }
    }

    return {
      status: 'Accepted',
      passedTests: passedCount,
      totalTests: testCases.length,
      runtime: 0.15,
      memory: 4096,
      testResults
    };
  } catch (error) {
    return {
      status: 'Runtime Error',
      error: error instanceof Error ? error.message : 'Execution failed',
      passedTests: 0,
      totalTests: testCases.length
    };
  }
}

function parseExecutionResult(result: Judge0Response): ExecutionResult {
  const statusId = result.status.id;

  if (statusId === 3) {
    return {
      status: 'Accepted',
      output: result.stdout || '',
      runtime: parseFloat(result.time || '0'),
      memory: result.memory || 0
    };
  }

  if (statusId === 4) {
    return {
      status: 'Wrong Answer',
      output: result.stdout || '',
      error: result.stderr || undefined
    };
  }

  if (statusId === 5) {
    return {
      status: 'Time Limit Exceeded',
      error: 'Your code took too long to execute'
    };
  }

  if (statusId === 6) {
    return {
      status: 'Compilation Error',
      error: result.compile_output || result.stderr || 'Compilation failed'
    };
  }

  if (statusId >= 7 && statusId <= 12) {
    return {
      status: 'Runtime Error',
      error: result.stderr || result.compile_output || 'Runtime error occurred'
    };
  }

  return {
    status: 'Runtime Error',
    error: 'Unknown execution error'
  };
}
