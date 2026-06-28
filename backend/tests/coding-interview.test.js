require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node'
  }
});
require('tsconfig-paths').register();

const { PrismaClient } = require('@prisma/client');
const http = require('http');
const { getExecutionProvider } = require('@backend/services/coding/execution.service');
const { evaluateCodingSessionOffline } = require('@backend/services/coding/coding.service');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ai_interview_db?schema=public"
    }
  }
});

const BASE_URL = 'http://localhost:5000/api/v1';

// Request helper
function makeRequest(method, path, body = null, headers = {}, cookieJar = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const urlObj = new URL(url);
    
    const cookieString = Object.entries(cookieJar)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
      
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (cookieJar['XSRF-TOKEN']) {
      options.headers['X-XSRF-TOKEN'] = cookieJar['XSRF-TOKEN'];
    }
    
    if (cookieString) {
      options.headers['Cookie'] = cookieString;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const setCookies = res.headers['set-cookie'] || [];
        setCookies.forEach(cookieStr => {
          const parts = cookieStr.split(';')[0].split('=');
          if (parts.length >= 2) {
            cookieJar[parts[0].trim()] = parts[1].trim();
          }
        });
        
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });
    
    req.on('error', (err) => reject(err));
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Coding Interview Simulator (V1.4) Integration Tests...\n');
  const results = {};
  
  // Clean up database for fresh tests
  try {
    await prisma.codingSession.deleteMany({
      where: { user: { email: { in: ['codingA@test.com', 'codingB@test.com'] } } }
    });
    await prisma.user.deleteMany({
      where: { email: { in: ['codingA@test.com', 'codingB@test.com'] } }
    });
    console.log('🧹 Database cleaned successfully.');
  } catch (err) {
    console.warn('⚠️ Cleanup warning:', err.message);
  }

  // Create test user and obtain auth cookies
  const cookieJar = {};
  let user;
  try {
    console.log('Step -1: Fetching CSRF token from health check...');
    await makeRequest('GET', '/health', null, {}, cookieJar);
    console.log('CSRF token obtained successfully.');

    console.log('Step 0: Registering test user codingA@test.com...');
    const regRes = await makeRequest('POST', '/auth/register', {
      email: 'codingA@test.com',
      password: 'Password123!',
      name: 'Coding Candidate'
    }, {}, cookieJar);

    if (regRes.status !== 201) {
      throw new Error(`Failed registration: ${JSON.stringify(regRes.data)}`);
    }

    user = regRes.data.data.user;
    console.log(`Registered user ID: ${user.id}`);
  } catch (err) {
    console.error('💥 Setup failed:', err);
    process.exit(1);
  }

  // ----------------------------------------------------
  // TEST 1: Problem Retrieval
  // ----------------------------------------------------
  try {
    console.log('\n--- 1. Testing Coding Problem Retrieval ---');
    const res = await makeRequest('GET', '/coding/problems', null, {}, cookieJar);
    
    if (res.status !== 200) {
      throw new Error(`Invalid status: ${res.status}. Error: ${JSON.stringify(res.data)}`);
    }
    const problems = res.data.data.problems;
    if (!Array.isArray(problems) || problems.length < 20) {
      throw new Error(`Expected at least 20 seeded problems, got: ${problems?.length}`);
    }
    
    console.log(`✅ Retrieved ${problems.length} seeded problems successfully.`);
    results['1. Problem Retrieval'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    results['1. Problem Retrieval'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 2: Session Creation
  // ----------------------------------------------------
  let sessionId;
  let problemId;
  try {
    console.log('\n--- 2. Testing Coding Session Creation ---');
    // Fetch a problem
    const problemsRes = await makeRequest('GET', '/coding/problems', null, {}, cookieJar);
    const problem = problemsRes.data.data.problems.find(p => p.slug === 'two-sum');
    if (!problem) throw new Error('Seeded Two Sum problem not found');
    problemId = problem.id;

    // Create session
    const res = await makeRequest('POST', '/coding/sessions', {
      codingProblemId: problemId,
      language: 'python'
    }, {}, cookieJar);

    if (res.status !== 201) {
      throw new Error(`Invalid status: ${res.status}. Response: ${JSON.stringify(res.data)}`);
    }

    const session = res.data.data.session;
    if (session.status !== 'IN_PROGRESS' || session.language !== 'python') {
      throw new Error(`Session structure invalid: ${JSON.stringify(session)}`);
    }
    sessionId = session.id;
    console.log(`✅ Session created successfully. Session ID: ${sessionId}`);
    results['2. Session Creation'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    results['2. Session Creation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 3: Autosave
  // ----------------------------------------------------
  try {
    console.log('\n--- 3. Testing Code Autosave/Manual save ---');
    const customCode = 'def twoSum(nums, target):\n    return [0, 1]  # manual save draft';
    const res = await makeRequest('PATCH', `/coding/sessions/${sessionId}/save`, {
      userCode: customCode
    }, {}, cookieJar);

    if (res.status !== 200) {
      throw new Error(`Invalid status: ${res.status}. Response: ${JSON.stringify(res.data)}`);
    }

    const updatedSession = res.data.data.session;
    if (updatedSession.userCode !== customCode) {
      throw new Error(`Autosave did not update code. Current: ${updatedSession.userCode}`);
    }

    console.log('✅ Autosave updated session code successfully.');
    results['3. Autosave'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    results['3. Autosave'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 4: Code Execution
  // ----------------------------------------------------
  try {
    console.log('\n--- 4. Testing Code Execution (Compiler Sandbox) ---');
    const sampleCode = 'def twoSum(nums, target):\n    return [0, 1]';
    const res = await makeRequest('POST', `/coding/sessions/${sessionId}/run`, {
      userCode: sampleCode
    }, {}, cookieJar);

    if (res.status !== 200) {
      throw new Error(`Invalid status: ${res.status}. Response: ${JSON.stringify(res.data)}`);
    }

    if (res.data.data.success !== true || !Array.isArray(res.data.data.testResults)) {
      throw new Error(`Execution payload invalid: ${JSON.stringify(res.data)}`);
    }

    console.log(`✅ Code execution returned sandbox results: success=${res.data.data.success}, results=${res.data.data.testResults.length}`);
    results['4. Code Execution'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    results['4. Code Execution'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 5: Execution History
  // ----------------------------------------------------
  try {
    console.log('\n--- 5. Testing Execution History Persistence ---');
    const executions = await prisma.codingExecution.findMany({
      where: { codingSessionId: sessionId }
    });

    if (executions.length === 0) {
      throw new Error('No execution history records found in database for this session');
    }

    console.log(`✅ Found ${executions.length} execution history records for session in database.`);
    results['5. Execution History'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    results['5. Execution History'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 6: Provider Selection
  // ----------------------------------------------------
  try {
    console.log('\n--- 6. Testing CodeExecutionProvider Configuration selection ---');
    
    process.env.CODE_EXECUTION_PROVIDER = 'mock';
    const providerMock = getExecutionProvider();
    if (providerMock.constructor.name !== 'MockExecutionProvider') {
      throw new Error(`Expected MockExecutionProvider, got: ${providerMock.constructor.name}`);
    }

    process.env.CODE_EXECUTION_PROVIDER = 'piston';
    const providerPiston = getExecutionProvider();
    if (providerPiston.constructor.name !== 'PistonExecutionProvider') {
      throw new Error(`Expected PistonExecutionProvider, got: ${providerPiston.constructor.name}`);
    }

    // Reset default
    process.env.CODE_EXECUTION_PROVIDER = 'mock';

    console.log('✅ Provider selection configured and resolved dynamically via env variables.');
    results['6. Provider Selection'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    results['6. Provider Selection'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 7: Submission & Evaluation Generation
  // ----------------------------------------------------
  try {
    console.log('\n--- 7. Testing Final Submission & Evaluation Generation ---');
    const solutionCode = 'def twoSum(nums, target):\n    return [0, 1]';
    const res = await makeRequest('POST', `/coding/sessions/${sessionId}/submit`, {
      userCode: solutionCode
    }, {}, cookieJar);

    if (res.status !== 200) {
      throw new Error(`Invalid status: ${res.status}. Response: ${JSON.stringify(res.data)}`);
    }

    const { session: completedSession, evaluation } = res.data.data;
    if (completedSession.status !== 'COMPLETED') {
      throw new Error('Session status was not updated to COMPLETED');
    }

    if (!evaluation || evaluation.overallScore === undefined) {
      throw new Error(`AI Evaluation not returned: ${JSON.stringify(evaluation)}`);
    }

    console.log(`✅ Session submitted. Grades overall: ${evaluation.overallScore}%`);
    results['7. Submission & Evaluation'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    results['7. Submission & Evaluation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 8: Analytics Generation
  // ----------------------------------------------------
  try {
    console.log('\n--- 8. Testing Dashboard Analytics Overview Generation ---');
    const res = await makeRequest('GET', '/analytics/overview?refresh=true', null, {}, cookieJar);

    if (res.status !== 200) {
      throw new Error(`Invalid status: ${res.status}. Response: ${JSON.stringify(res.data)}`);
    }

    const analytics = res.data.data;
    if (analytics.codingProblemsSolved !== 1 || analytics.averageCodingScore === undefined) {
      throw new Error(`Analytics data incomplete: ${JSON.stringify(analytics)}`);
    }

    console.log(`✅ Analytics updated: codingProblemsSolved=${analytics.codingProblemsSolved}, avgScore=${analytics.averageCodingScore}%`);
    results['8. Analytics Generation'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 8 Failed:', err.message);
    results['8. Analytics Generation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 9: Offline Fallback Behavior
  // ----------------------------------------------------
  try {
    console.log('\n--- 9. Testing Offline Code Evaluation Fallback Behavior ---');
    
    // Create new session
    const createRes = await makeRequest('POST', '/coding/sessions', {
      codingProblemId: problemId,
      language: 'python'
    }, {}, cookieJar);
    const newSessionId = createRes.data.data.session.id;

    // Trigger offline evaluation directly to isolate AST grading without network/Gemini
    const offlineEval = await evaluateCodingSessionOffline(newSessionId, user.id, 2, 0);
    
    if (!offlineEval || offlineEval.overallScore === undefined || offlineEval.correctnessScore !== 100) {
      throw new Error(`Offline evaluation failed: ${JSON.stringify(offlineEval)}`);
    }

    console.log(`✅ Offline static code analyzer generated grades successfully: ${offlineEval.overallScore}%`);
    results['9. Offline Fallback'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 9 Failed:', err.message);
    results['9. Offline Fallback'] = 'FAIL';
  }

  // Final Summary
  console.log('\n====================================================');
  console.log('🏁 Coding Interview (V1.4) Test Summary:');
  console.log('====================================================');
  let overallPass = true;
  Object.entries(results).forEach(([test, status]) => {
    console.log(`${status === 'PASS' ? '🟢' : '🔴'} ${test}: ${status}`);
    if (status !== 'PASS') overallPass = false;
  });
  console.log('====================================================');
  
  if (overallPass) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED. CHECK LOGS ABOVE.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('💥 Test runner encountered fatal crash:', err);
  process.exit(1);
});
