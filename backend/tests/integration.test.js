const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ai_interview_db?schema=public"
    }
  }
});

const BASE_URL = 'http://localhost:5000/api/v1';

// Helper to make HTTP requests and handle cookies/headers
function makeRequest(method, path, body = null, headers = {}, cookieJar = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const urlObj = new URL(url);
    
    // Compile cookies
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
    
    if (cookieString) {
      options.headers['Cookie'] = cookieString;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // Parse set-cookie headers
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
  console.log('🧪 Starting Security, Scalability & Reliability Integration Tests...\n');
  const results = {};
  
  // Clean up database for fresh tests
  try {
    await prisma.user.deleteMany({ where: { email: { in: ['userA@test.com', 'userB@test.com'] } } });
    console.log('🧹 Cleaned up old test users from database.');
  } catch (err) {
    console.warn('⚠️ DB Cleanup warning:', err.message);
  }

  // ----------------------------------------------------
  // TEST 1: Authentication Flow & CSRF Protection
  // ----------------------------------------------------
  try {
    console.log('\n--- 1. Testing CSRF Validation and Auth Flow ---');
    const cookieJar = {};
    
    // Safe request: should receive XSRF-TOKEN cookie
    console.log('Step A: Getting initial CSRF token from health check (should bypass csrf validation but issue token)...');
    const initRes = await makeRequest('GET', '/health', null, {}, cookieJar);
    const initialCsrf = cookieJar['XSRF-TOKEN'];
    if (!initialCsrf) throw new Error('Failed to receive XSRF-TOKEN cookie on initial request');
    console.log(`✓ Initial CSRF Token issued: ${initialCsrf.substring(0, 10)}...`);
    
    // Register without CSRF header should fail with 403
    console.log('Step B: Trying to register without X-XSRF-TOKEN header...');
    const registerPayload = { email: 'userA@test.com', password: 'Password123!', name: 'User A' };
    const failReg = await makeRequest('POST', '/auth/register', registerPayload, {}, cookieJar);
    if (failReg.status !== 403) throw new Error(`Expected 403, got ${failReg.status}`);
    console.log('✓ Request correctly blocked with 403.');
    
    // Register with CSRF header should succeed
    console.log('Step C: Registering User A with valid CSRF header...');
    const successReg = await makeRequest('POST', '/auth/register', registerPayload, {
      'x-xsrf-token': initialCsrf
    }, cookieJar);
    
    if (successReg.status !== 201) throw new Error(`Expected 201, got ${successReg.status}. Data: ${JSON.stringify(successReg.data)}`);
    console.log('✓ User A registered successfully.');
    
    // Verify CSRF Token rotated
    const postRegCsrf = cookieJar['XSRF-TOKEN'];
    if (!postRegCsrf || postRegCsrf === initialCsrf) {
      throw new Error('CSRF Token did not rotate on registration');
    }
    console.log(`✓ CSRF Token successfully rotated: ${postRegCsrf.substring(0, 10)}...`);
    
    // Logout with rotated token
    console.log('Step D: Logging out User A...');
    const logoutRes = await makeRequest('POST', '/auth/logout', {}, {
      'x-xsrf-token': postRegCsrf
    }, cookieJar);
    if (logoutRes.status !== 200) throw new Error(`Logout failed with ${logoutRes.status}`);
    
    // Check if token cleared
    if (cookieJar['XSRF-TOKEN']) {
      throw new Error('CSRF cookie was not cleared on logout');
    }
    console.log('✓ CSRF Token successfully cleared on logout.');
    
    results['auth_and_csrf'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    results['auth_and_csrf'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 2: Analytics Snapshot Isolation & Cache TTL
  // ----------------------------------------------------
  try {
    console.log('\n--- 2. Testing Analytics Snapshot Isolation and Caching ---');
    
    // Clean up test users before re-registering in Test 2
    try {
      await prisma.user.deleteMany({ where: { email: { in: ['userA@test.com', 'userB@test.com'] } } });
    } catch (e) {}
    
    const cookieJarA = {};
    const cookieJarB = {};
    
    // Setup and Login User A
    await makeRequest('GET', '/health', null, {}, cookieJarA);
    await makeRequest('POST', '/auth/register', { email: 'userA@test.com', password: 'Password123!', name: 'User A' }, {
      'x-xsrf-token': cookieJarA['XSRF-TOKEN']
    }, cookieJarA);
    
    // Setup and Login User B
    await makeRequest('GET', '/health', null, {}, cookieJarB);
    await makeRequest('POST', '/auth/register', { email: 'userB@test.com', password: 'Password123!', name: 'User B' }, {
      'x-xsrf-token': cookieJarB['XSRF-TOKEN']
    }, cookieJarB);
    
    // Fetch Analytics Overview for User A
    console.log('Step A: Recalculating overview for User A...');
    const analyticsResA = await makeRequest('GET', '/analytics/overview?refresh=true', null, {}, cookieJarA);
    if (analyticsResA.status !== 200) throw new Error(`Fetch failed: ${analyticsResA.status}`);
    const timeA = analyticsResA.data.data.generatedAt;
    
    // Fetch Analytics Overview for User B (verify isolation)
    console.log('Step B: Recalculating overview for User B...');
    const analyticsResB = await makeRequest('GET', '/analytics/overview?refresh=true', null, {}, cookieJarB);
    if (analyticsResB.status !== 200) throw new Error(`Fetch failed: ${analyticsResB.status}`);
    const timeB = analyticsResB.data.data.generatedAt;
    
    // Check snapshots in database
    console.log('Step C: Checking AnalyticsSnapshot entries in PostgreSQL...');
    const dbSnapshots = await prisma.analyticsSnapshot.findMany({});
    
    const snapA = dbSnapshots.find(s => s.userId === analyticsResA.data.data.userId || s.userId === successUserId(analyticsResA.data.data, 'userA@test.com'));
    const snapB = dbSnapshots.find(s => s.userId === analyticsResB.data.data.userId || s.userId === successUserId(analyticsResB.data.data, 'userB@test.com'));
    
    if (dbSnapshots.length < 2) {
      throw new Error(`Expected at least 2 snapshot records in DB, found ${dbSnapshots.length}. Overwriting leak still present!`);
    }
    console.log('✓ Confirmed two separate snapshot records exist in the database.');
    
    // Test cache hit behavior (should NOT recompute)
    console.log('Step D: Fetching User A overview without refresh (should hit cache)...');
    const cacheHitRes = await makeRequest('GET', '/analytics/overview', null, {}, cookieJarA);
    if (cacheHitRes.data.data.generatedAt !== timeA) {
      throw new Error(`Overview recomputed snapshot! Original time: ${timeA}, Cached time: ${cacheHitRes.data.data.generatedAt}`);
    }
    console.log('✓ Cache hit successfully returned identical snapshot timestamp without recomputation.');
    
    results['analytics_isolation_and_caching'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    results['analytics_isolation_and_caching'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 3: Concurrent Answer Submissions
  // ----------------------------------------------------
  try {
    console.log('\n--- 3. Testing Concurrent Answer Submissions ---');
    
    // Create a dummy question in DB
    const question = await prisma.question.upsert({
      where: { slug: 'test-concurrency-question' },
      update: {},
      create: {
        slug: 'test-concurrency-question',
        title: 'Concurrency test',
        description: 'Test',
        difficulty: 'EASY',
        category: 'DSA',
        topic: 'Arrays',
        estimatedTime: 10,
      }
    });
    
    const userA = await prisma.user.findUnique({ where: { email: 'userA@test.com' } });
    if (!userA) throw new Error('User A not found in DB');
    
    // Create interview session
    const session = await prisma.interviewSession.create({
      data: {
        userId: userA.id,
        title: 'Concurrency Simulator',
        domain: 'DSA',
        difficulty: 'EASY',
        questionCount: 1,
        status: 'IN_PROGRESS',
      }
    });
    
    const interviewQuestion = await prisma.interviewQuestion.create({
      data: {
        interviewSessionId: session.id,
        questionText: 'Is this concurrent?',
        order: 0
      }
    });
    
    const cookieJar = {};
    await makeRequest('GET', '/health', null, {}, cookieJar);
    await makeRequest('POST', '/auth/login', { email: 'userA@test.com', password: 'Password123!' }, {
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);
    
    // Send 5 concurrent answer submission requests
    console.log('Sending 5 concurrent PATCH requests for question answer...');
    const requests = Array.from({ length: 5 }).map((_, idx) => {
      return makeRequest(
        'PATCH',
        `/interviews/${session.id}/questions/${interviewQuestion.id}/answer`,
        { userAnswer: `Concurrent answer try ${idx}` },
        { 'x-xsrf-token': cookieJar['XSRF-TOKEN'] },
        cookieJar
      );
    });
    
    const responses = await Promise.all(requests);
    console.log(`Received all responses: ${responses.map(r => r.status).join(', ')}`);
    
    // Check answeredCount in database
    const updatedSession = await prisma.interviewSession.findUnique({
      where: { id: session.id }
    });
    
    if (updatedSession.answeredCount !== 1) {
      throw new Error(`Expected answeredCount to be 1, but found: ${updatedSession.answeredCount}`);
    }
    console.log('✓ Transactional lock successfully kept answeredCount = 1.');
    
    results['concurrent_submissions'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    results['concurrent_submissions'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 4: Idempotent Evaluation Jobs & Queue Recovery
  // ----------------------------------------------------
  try {
    console.log('\n--- 4. Testing Idempotent Evaluation Queueing ---');
    
    const userA = await prisma.user.findUnique({ where: { email: 'userA@test.com' } });
    const session = await prisma.interviewSession.create({
      data: {
        userId: userA.id,
        title: 'Idempotency Simulator',
        domain: 'SQL',
        difficulty: 'EASY',
        questionCount: 1,
        status: 'IN_PROGRESS',
      }
    });
    
    // Add a question and answer so it's completed
    const iq = await prisma.interviewQuestion.create({
      data: { interviewSessionId: session.id, questionText: 'Dummy query', order: 0 }
    });
    await prisma.interviewAnswer.create({
      data: { interviewSessionId: session.id, interviewQuestionId: iq.id, userAnswer: 'SELECT 1;' }
    });
    
    const cookieJar = {};
    await makeRequest('GET', '/health', null, {}, cookieJar);
    await makeRequest('POST', '/auth/login', { email: 'userA@test.com', password: 'Password123!' }, {
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);
    
    // Concurrently trigger End Session 5 times
    console.log('Sending 5 concurrent end session requests...');
    const requests = Array.from({ length: 5 }).map(() => {
      return makeRequest(
        'PATCH',
        `/interviews/${session.id}/end`,
        { durationSeconds: 45 },
        { 'x-xsrf-token': cookieJar['XSRF-TOKEN'] },
        cookieJar
      );
    });
    
    const responses = await Promise.all(requests);
    console.log(`Received End Session statuses: ${responses.map(r => r.status).join(', ')}`);
    
    // Check DB evaluation job
    const jobRecords = await prisma.evaluationJob.findMany({
      where: { interviewSessionId: session.id }
    });
    
    if (jobRecords.length !== 1) {
      throw new Error(`Expected exactly 1 EvaluationJob record in DB, found ${jobRecords.length}`);
    }
    console.log('✓ Idempotency constraint successfully restricted database enqueues to 1.');
    
    results['idempotent_evaluation'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    results['idempotent_evaluation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 5: Health Check and Queue Diagnostics
  // ----------------------------------------------------
  try {
    console.log('\n--- 5. Testing Health Diagnostics Diagnostics ---');
    const healthRes = await makeRequest('GET', '/health');
    
    if (healthRes.status !== 200) throw new Error(`Health status check failed: ${healthRes.status}`);
    
    const diagnostics = healthRes.data.data;
    console.log('Diagnostics response payload:', JSON.stringify(diagnostics, null, 2));
    
    if (!diagnostics.postgres || !diagnostics.redis || !diagnostics.queue) {
      throw new Error('Health check payload is missing postgres, redis, or queue fields');
    }
    
    if (diagnostics.postgres.status !== 'CONNECTED') throw new Error('Database reported DISCONNECTED');
    
    console.log('✓ Health check endpoint successfully verified connectivity and returned queue diagnostics.');
    
    results['health_checks'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    results['health_checks'] = 'FAIL';
  }

  // Clean up test users
  try {
    await prisma.user.deleteMany({ where: { email: { in: ['userA@test.com', 'userB@test.com'] } } });
  } catch (e) {}
  await prisma.$disconnect();

  console.log('\n====================================================');
  console.log('🏁 Integration Test Results Summary:');
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

// helper
function successUserId(data, email) {
  if (data && data.user && data.user.email === email) return data.user.id;
  return null;
}

runTests().catch(err => {
  console.error('💥 Test runner encountered fatal crash:', err);
  process.exit(1);
});
