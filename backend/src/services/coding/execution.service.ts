import axios from 'axios';
import { logger } from '@backend/config/logger';

export interface TestCase {
  id: string;
  input: string; // JSON string representing arguments list, e.g. "[[2,7,11,15], 9]"
  expectedOutput: string; // JSON string representing expected return value, e.g. "[0,1]"
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  compileError?: string;
  testResults: TestResult[];
}

export interface CodeExecutionProvider {
  runCode(code: string, language: string, input: string): Promise<{ stdout: string; stderr: string; success: boolean; error?: string }>;
  runTests(code: string, language: string, testCases: TestCase[]): Promise<ExecutionResult>;
}

// 1. Mock Execution Provider (Deterministic syntax checking and output simulation)
export class MockExecutionProvider implements CodeExecutionProvider {
  async runCode(code: string, language: string, input: string): Promise<{ stdout: string; stderr: string; success: boolean; error?: string }> {
    logger.info(`🧪 Mock Running Code [${language}]...`);
    if (!code || code.trim().length === 0) {
      return { stdout: '', stderr: 'Empty code submission', success: false, error: 'Empty code' };
    }
    
    // Simulate compilation/syntax error if code contains compile error trigger
    if (code.toLowerCase().includes('syntaxerror') || code.toLowerCase().includes('compile_error')) {
      return { stdout: '', stderr: 'SyntaxError: Unexpected token', success: false, error: 'Compilation failed' };
    }

    return { stdout: `Mock output for input: ${input}`, stderr: '', success: true };
  }

  async runTests(code: string, language: string, testCases: TestCase[]): Promise<ExecutionResult> {
    logger.info(`🧪 Mock Running Tests [${language}] for ${testCases.length} cases...`);
    
    if (code.toLowerCase().includes('syntaxerror') || code.toLowerCase().includes('compile_error')) {
      return {
        success: false,
        compileError: 'SyntaxError: Incomplete structure or compilation error.',
        testResults: testCases.map(tc => ({
          testCaseId: tc.id,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          error: 'Compilation failed'
        }))
      };
    }

    // Determine if the code has a structural penalty (fails some tests)
    const failsTests = code.toLowerCase().includes('fail_test') || code.toLowerCase().includes('buggy_code');

    const testResults: TestResult[] = testCases.map((tc, idx) => {
      let passed = !failsTests;
      // Fail last test case if failsTests is active
      if (failsTests && idx === testCases.length - 1) {
        passed = false;
      }
      
      const actualOutput = passed ? tc.expectedOutput : 'null';

      return {
        testCaseId: tc.id,
        passed,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        stdout: `Test case ${idx + 1} execution successful`,
        stderr: ''
      };
    });

    return {
      success: true,
      stdout: 'All tests executed.',
      testResults
    };
  }
}

// 2. Piston Code Execution Provider (Remote execution in sandboxed environments)
export class PistonExecutionProvider implements CodeExecutionProvider {
  private static PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
  private static TIMEOUT_MS = 5000; // 5 seconds timeout
  private static OUTPUT_LIMIT = 10 * 1024; // 10KB output limit

  private getLanguageConfig(language: string): { pistonLang: string; version: string; filename: string } {
    const lang = language.toLowerCase();
    switch (lang) {
      case 'python':
      case 'py':
      case 'python3':
        return { pistonLang: 'python', version: '3.10.0', filename: 'main.py' };
      case 'javascript':
      case 'js':
      case 'node':
        return { pistonLang: 'javascript', version: '18.15.0', filename: 'index.js' };
      case 'java':
        return { pistonLang: 'java', version: '15.0.2', filename: 'Main.java' };
      default:
        throw new Error(`Unsupported language for Piston: ${language}`);
    }
  }

  // Generates execution wrappers to execute user solution against stdin inputs
  private wrapCode(code: string, language: string): string {
    const lang = language.toLowerCase();
    if (lang === 'python' || lang === 'py' || lang === 'python3') {
      return `${code}

import sys
import json

try:
    inputs = sys.stdin.read().strip().split('\\n')
    for line in inputs:
        if not line: continue
        args = json.loads(line)
        func_name = None
        for name in globals():
            if callable(globals()[name]) and name != 'json' and not name.startswith('_') and name != 'sys':
                func_name = name
                break
        if func_name:
            result = globals()[func_name](*args) if isinstance(args, list) else globals()[func_name](args)
            print(json.dumps(result))
        else:
            print("Error: No function defined")
except Exception as e:
    print(f"Runtime Error: {e}", file=sys.stderr)
`;
    }

    if (lang === 'javascript' || lang === 'js' || lang === 'node') {
      return `${code}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lines = [];
rl.on('line', (line) => {
  if (line.trim()) lines.push(line);
});

rl.on('close', () => {
  try {
    let func = null;
    for (let key in global) {
      if (typeof global[key] === 'function' && key !== 'setTimeout' && key !== 'setInterval') {
        func = global[key];
        break;
      }
    }
    if (!func) {
      const candidates = ['twoSum', 'containsDuplicate', 'maxSubArray', 'reverseString', 'isValidAnagram', 'longestSubstring', 'groupAnagrams', 'topKFrequent', 'reverseList', 'mergeTwoLists', 'hasCycle', 'maxDepth', 'invertTree', 'isSameTree', 'numIslands', 'cloneGraph', 'climbingStairs', 'rob', 'canJump', 'solve'];
      for (let name of candidates) {
        if (typeof eval(\`typeof \${name} !== 'undefined' ? \${name} : null\`) === 'function') {
          func = eval(name);
          break;
        }
      }
    }
    
    if (!func) {
      throw new Error("No user function found");
    }

    for (let line of lines) {
      const args = JSON.parse(line);
      const result = Array.isArray(args) ? func(...args) : func(args);
      console.log(JSON.stringify(result));
    }
  } catch (err) {
    console.error("Runtime Error: " + err.message);
  }
});
`;
    }

    if (lang === 'java') {
      // Java expects a public class Main. We wrap the user solution inside Main.java with simple array parser.
      return `import java.util.*;
import java.io.*;

${code}

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line;
        Solution solver = new Solution();
        while ((line = br.readLine()) != null) {
            if (line.trim().isEmpty()) continue;
            try {
                // Java Wrapper parses arguments based on the standard problems
                // Simple parsing for Two Sum / Arrays
                String clean = line.trim().replace("[", "").replace("]", "").replace(" ", "");
                if (clean.isEmpty()) {
                     System.out.println("[]");
                     continue;
                }
                String[] tokens = clean.split(",");
                
                // If it is Two Sum (array of nums, then target at the end)
                if (tokens.length >= 2) {
                    // Check if it's Two Sum problem by looking at class signature or fallback
                    // We assume standard Solution format.
                    // For Two Sum: Solution has twoSum(int[] nums, int target)
                    // We parse nums: everything except last token. target: last token.
                    int[] nums = new int[tokens.length - 1];
                    for(int i = 0; i < tokens.length - 1; i++) {
                        nums[i] = Integer.parseInt(tokens[i]);
                    }
                    int target = Integer.parseInt(tokens[tokens.length - 1]);
                    int[] result = solver.twoSum(nums, target);
                    System.out.println(Arrays.toString(result));
                } else {
                    System.out.println("[]");
                }
            } catch (Exception e) {
                System.err.println("Runtime Error: " + e.getMessage());
            }
        }
    }
}
`;
    }

    return code;
  }

  private truncateOutput(str?: string): string {
    if (!str) return '';
    if (str.length > PistonExecutionProvider.OUTPUT_LIMIT) {
      return str.substring(0, PistonExecutionProvider.OUTPUT_LIMIT) + '\n... [Output Truncated]';
    }
    return str;
  }

  // Secure validation of request inputs
  private validateInputs(code: string, language: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Code payload cannot be empty');
    }
    if (code.length > 100 * 1024) { // 100KB size limit
      throw new Error('Code size exceeds maximum limit of 100KB');
    }
    const config = this.getLanguageConfig(language);
    if (!config) {
      throw new Error(`Unsupported execution language: ${language}`);
    }
  }

  async runCode(code: string, language: string, input: string): Promise<{ stdout: string; stderr: string; success: boolean; error?: string }> {
    logger.info(`🚀 Piston Executing Code [${language}]...`);
    try {
      this.validateInputs(code, language);
      const config = this.getLanguageConfig(language);

      const response = await axios.post(
        PistonExecutionProvider.PISTON_URL,
        {
          language: config.pistonLang,
          version: config.version,
          files: [
            {
              name: config.filename,
              content: code, // run action runs raw code directly
            },
          ],
          stdin: input,
        },
        {
          timeout: PistonExecutionProvider.TIMEOUT_MS,
        }
      );

      const run = response.data?.run;
      const compile = response.data?.compile;

      if (compile && compile.code !== 0) {
        return {
          stdout: '',
          stderr: this.truncateOutput(compile.output || compile.stderr),
          success: false,
          error: 'Compilation error',
        };
      }

      if (!run) {
        throw new Error('Invalid response structure from Piston execution engine');
      }

      return {
        stdout: this.truncateOutput(run.stdout),
        stderr: this.truncateOutput(run.stderr),
        success: run.code === 0,
        error: run.code === 0 ? undefined : `Runtime exited with code ${run.code}`,
      };
    } catch (err: any) {
      logger.error(`💥 Piston execution failed: ${err.message}`);
      return {
        stdout: '',
        stderr: '',
        success: false,
        error: err.code === 'ECONNABORTED' ? 'Execution Timeout (5s exceeded)' : `Sandbox execution error: ${err.message}`,
      };
    }
  }

  async runTests(code: string, language: string, testCases: TestCase[]): Promise<ExecutionResult> {
    logger.info(`🚀 Piston Running Tests [${language}] for ${testCases.length} cases...`);
    try {
      this.validateInputs(code, language);
      const config = this.getLanguageConfig(language);
      const wrapped = this.wrapCode(code, language);

      // Aggregate all test case inputs separated by newline
      const aggregatedInput = testCases.map(tc => {
        // For java, format inputs as flat comma separated list if input is nested JSON
        if (config.pistonLang === 'java') {
          try {
            const parsed = JSON.parse(tc.input);
            if (Array.isArray(parsed)) {
              // Flatten arrays/ints
              const flatList: any[] = [];
              parsed.forEach(p => {
                if (Array.isArray(p)) {
                  flatList.push(...p);
                } else {
                  flatList.push(p);
                }
              });
              return `[${flatList.join(',')}]`;
            }
          } catch (e) {
            // fallback
          }
        }
        return tc.input;
      }).join('\n');

      const response = await axios.post(
        PistonExecutionProvider.PISTON_URL,
        {
          language: config.pistonLang,
          version: config.version,
          files: [
            {
              name: config.filename,
              content: wrapped,
            },
          ],
          stdin: aggregatedInput,
        },
        {
          timeout: PistonExecutionProvider.TIMEOUT_MS,
        }
      );

      const run = response.data?.run;
      const compile = response.data?.compile;

      // Handle compilation errors
      if (compile && compile.code !== 0) {
        return {
          success: false,
          compileError: this.truncateOutput(compile.output || compile.stderr),
          testResults: testCases.map(tc => ({
            testCaseId: tc.id,
            passed: false,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: '',
            error: 'Compilation failed',
          })),
        };
      }

      if (!run) {
        throw new Error('Invalid response structure from Piston execution engine');
      }

      // Parse outputs printed line-by-line
      const outputs = run.stdout.trim().split('\n').map((o: string) => o.trim());
      const stderr = this.truncateOutput(run.stderr);

      const testResults: TestResult[] = testCases.map((tc, idx) => {
        const actualOutputRaw = outputs[idx] || '';
        
        let passed = false;
        let actualOutput = actualOutputRaw;

        // Clean up formatting differences (such as spaces in JSON brackets)
        const cleanStr = (s: string) => s.replace(/\s+/g, '').replace(/,/g, ',').toLowerCase();
        
        try {
          if (cleanStr(actualOutputRaw) === cleanStr(tc.expectedOutput)) {
            passed = true;
          }
        } catch (e) {
          // fallback string compare
          passed = cleanStr(actualOutputRaw) === cleanStr(tc.expectedOutput);
        }

        return {
          testCaseId: tc.id,
          passed,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput,
          stdout: passed ? 'Execution successful' : `Expected: ${tc.expectedOutput}, Got: ${actualOutputRaw}`,
          stderr: outputs[idx] ? '' : stderr,
        };
      });

      return {
        success: run.code === 0,
        stdout: this.truncateOutput(run.stdout),
        stderr,
        testResults,
      };
    } catch (err: any) {
      logger.error(`💥 Piston test execution failed: ${err.message}`);
      return {
        success: false,
        compileError: err.code === 'ECONNABORTED' ? 'Test Execution Timeout (5s exceeded)' : `Execution engine error: ${err.message}`,
        testResults: testCases.map(tc => ({
          testCaseId: tc.id,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          error: err.message,
        })),
      };
    }
  }
}

// Configurable Selection
export const getExecutionProvider = (): CodeExecutionProvider => {
  const provider = process.env.CODE_EXECUTION_PROVIDER || 'mock';
  if (provider.toLowerCase() === 'piston') {
    return new PistonExecutionProvider();
  }
  return new MockExecutionProvider();
};
