// Code Execution Service - Uses backend API for real code execution
// Backend handles Judge0 integration or mock execution

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Language IDs for Judge0 (kept for reference)
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
  console.log(`🚀 [CODE EXECUTION] Starting execution - Language: ${language}`);
  
  try {
    console.log(`📡 [CODE EXECUTION] Calling backend API: ${API_BASE_URL}/api/code/execute`);
    
    // Call backend API for execution (backend handles mock vs real)
    const response = await fetch(`${API_BASE_URL}/api/code/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        code,
        language,
        stdin: input
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [CODE EXECUTION] Backend API error:', error);
      throw new Error(error.detail || 'Execution failed');
    }

    const result = await response.json();
    console.log('✅ [CODE EXECUTION] Execution successful:', result.status?.description);
    
    return result;
  } catch (error) {
    console.error('❌ [CODE EXECUTION] Execution error:', error);
    throw error;
  }
}

export async function runCode(
  code: string,
  language: keyof typeof LANGUAGE_IDS,
  testCases: Array<{ input: string; expected: string }>
): Promise<ExecutionResult> {
  console.log(`▶️ [RUN CODE] Running code with ${testCases.length} visible test cases`);
  
  try {
    if (testCases.length === 0) {
      console.log('⚠️ [RUN CODE] No test cases provided, running with empty input');
      const result = await executeCode(code, language, '');
      return parseExecutionResult(result);
    }

    // Run first test case only for "Run" (visible test)
    const testCase = testCases[0];
    console.log(`🧪 [RUN CODE] Testing with input: ${testCase.input.substring(0, 50)}...`);
    
    const result = await executeCode(code, language, testCase.input);
    const actual = result.stdout?.trim() || '';
    const expected = testCase.expected.trim();
    const passed = actual === expected;
    
    console.log(`📊 [RUN CODE] Result - Status: ${result.status.description}, Passed: ${passed}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
    
    return {
      ...parseExecutionResult(result),
      testResults: [{
        input: testCase.input,
        expected,
        actual,
        passed
      }]
    };
  } catch (error) {
    console.error('❌ [RUN CODE] Execution failed:', error);
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
  console.log(`📤 [SUBMIT CODE] Submitting code with ${testCases.length} total test cases (visible + hidden)`);
  
  try {
    let passedCount = 0;
    const testResults: ExecutionResult['testResults'] = [];
    let totalRuntime = 0;
    let maxMemory = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`🧪 [SUBMIT CODE] Running test case ${i + 1}/${testCases.length}`);
      
      const result = await executeCode(code, language, testCase.input);
      
      // Track runtime and memory
      if (result.time) totalRuntime += parseFloat(result.time);
      if (result.memory) maxMemory = Math.max(maxMemory, result.memory);
      
      // Check for compilation or runtime errors
      if (result.status.id !== 3) {
        console.log(`❌ [SUBMIT CODE] Test ${i + 1} failed with status: ${result.status.description}`);
        return {
          ...parseExecutionResult(result),
          passedTests: passedCount,
          totalTests: testCases.length,
          testResults,
          runtime: totalRuntime,
          memory: maxMemory
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
        console.log(`✅ [SUBMIT CODE] Test ${i + 1} passed`);
      } else {
        console.log(`❌ [SUBMIT CODE] Test ${i + 1} failed - Wrong Answer`);
        console.log(`   Expected: ${expected}`);
        console.log(`   Actual: ${actual}`);
        return {
          status: 'Wrong Answer',
          passedTests: passedCount,
          totalTests: testCases.length,
          testResults,
          runtime: totalRuntime,
          memory: maxMemory
        };
      }
    }

    console.log(`🎉 [SUBMIT CODE] All tests passed! ${passedCount}/${testCases.length}`);
    return {
      status: 'Accepted',
      passedTests: passedCount,
      totalTests: testCases.length,
      runtime: totalRuntime,
      memory: maxMemory,
      testResults
    };
  } catch (error) {
    console.error('❌ [SUBMIT CODE] Submission failed:', error);
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
