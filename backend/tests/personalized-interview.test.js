require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node'
  }
});
require('tsconfig-paths').register();

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
      req.write(body);
    }
    req.end();
  });
}

// Multipart/form-data builder
function buildMultipartBody(fields, files, boundary) {
  const chunks = [];
  for (const [name, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
  }
  for (const [name, file] of Object.entries(files)) {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${file.filename}"\r\nContent-Type: ${file.mimetype}\r\n\r\n`));
    chunks.push(file.buffer);
    chunks.push(Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}

// Minimal valid PDF text stream base64 (Contains: "React, Node.js, TypeScript. Project: Ecommerce App.")
const MOCK_PDF_BASE64 = 'JVBERi0xLjQKJdfljqgKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNSAwIFIKPj4KPj4KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA3OAo+PnN0cmVhbQpCVC9GMSAxMiBUZgoxMDAgNTAwIFRkCihSZWFjdCwgTm9kZS5qcywgVHlwZVNjcmlwdC4gUHJvamVjdDogRWNvbW1lcmNlIEFwcC4pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDcwIDAwMDAwIGYgCjAwMDAwMDAxMjAgMDAwMDAgbiAKMDAwMDAwMDI1OCAwMDAwMCBuIAowMDAwMDAwMzg2IDAwMDAwIGYgCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDcyCiUlRU9GCg==';

async function runTests() {
  console.log('🧪 Starting Personalized Interview Engine (Version 1.2) Integration Tests...\n');
  const results = {};
  
  const emailA = 'candidateA@personalized.com';
  const emailB = 'candidateB@personalized.com';

  // Cleanup old users
  try {
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
    console.log('🧹 Cleaned up old test users.');
  } catch (err) {
    console.warn('⚠️ DB Cleanup warning:', err.message);
  }

  // Setup candidate jars and user ids
  const jarA = {};
  const jarB = {};
  let userIdA, userIdB;

  try {
    console.log('Setup: Bootstrapping CSRF tokens...');
    await makeRequest('GET', '/health', null, {}, jarA);
    const csrfA = jarA['XSRF-TOKEN'];
    
    await makeRequest('GET', '/health', null, {}, jarB);
    const csrfB = jarB['XSRF-TOKEN'];

    console.log('Setup: Registering candidate A...');
    const regResA = await makeRequest('POST', '/auth/register', JSON.stringify({
      email: emailA, password: 'Password123!', name: 'Candidate A'
    }), { 'Content-Type': 'application/json', 'x-xsrf-token': csrfA }, jarA);
    userIdA = regResA.data.data.user.id;

    console.log('Setup: Registering candidate B...');
    const regResB = await makeRequest('POST', '/auth/register', JSON.stringify({
      email: emailB, password: 'Password123!', name: 'Candidate B'
    }), { 'Content-Type': 'application/json', 'x-xsrf-token': csrfB }, jarB);
    userIdB = regResB.data.data.user.id;

    console.log(`✓ Users bootstrapped. A: ${userIdA}, B: ${userIdB}`);
  } catch (err) {
    console.error('💥 Registration setup failed:', err.message);
    process.exit(1);
  }

  // Helper: Upload resume for user
  async function uploadResume(cookieJar) {
    const boundary = '----TestBoundary' + Math.random().toString(16);
    const pdfBuffer = Buffer.from(MOCK_PDF_BASE64, 'base64');
    
    const body = buildMultipartBody({}, {
      resume: {
        filename: 'resume_profile.pdf',
        mimetype: 'application/pdf',
        buffer: pdfBuffer
      }
    }, boundary);

    const res = await makeRequest('POST', '/resumes/upload', body, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);

    if (res.status !== 201) {
      throw new Error(`Resume upload failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }
    return res.data.data.resume.id;
  }

  let resumeIdA;
  try {
    console.log('Setup: Uploading resume for Candidate A...');
    resumeIdA = await uploadResume(jarA);
    console.log(`✓ Resume uploaded for Candidate A. ID: ${resumeIdA}`);
  } catch (err) {
    console.error('💥 Resume upload setup failed:', err.message);
    process.exit(1);
  }

  // ----------------------------------------------------
  // TEST 1: Empty and Large Resume Parsing Fallback
  // ----------------------------------------------------
  try {
    console.log('\n--- 1. Testing Empty & Large Resume Parsing ---');
    const { parseResumeOffline } = require('../src/services/resume.service');
    
    // Empty resume parsing
    console.log('Step A: Parsing empty resume string...');
    const emptyResult = parseResumeOffline('', 'empty.pdf');
    if (!emptyResult.parsedData || !Array.isArray(emptyResult.parsedData.skills)) {
      throw new Error('Empty parsing should return structure with default skills');
    }
    if (emptyResult.parsedData.skills.length === 0) {
      throw new Error('Empty parsing fallback should populate default skills');
    }
    console.log('✓ Empty resume parsed cleanly.');

    // Large resume parsing
    console.log('Step B: Parsing large resume string...');
    const largeText = 'Developer profile. '.repeat(1000) + ' React. Node.js. TypeScript. C++.';
    const largeResult = parseResumeOffline(largeText, 'large.pdf');
    if (!largeResult.parsedData.skills.includes('React') || !largeResult.parsedData.skills.includes('C++')) {
      throw new Error('Large parsing failed to extract skills: ' + JSON.stringify(largeResult.parsedData.skills));
    }
    console.log('✓ Large resume parsed cleanly.');
    results['empty_and_large_parsing'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    results['empty_and_large_parsing'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 2: Resume Ownership & Rejection Checks
  // ----------------------------------------------------
  try {
    console.log('\n--- 2. Testing Resume Ownership & Invalid IDs Rejection ---');
    
    // Test A: Candidate B tries to use Candidate A's resume
    console.log('Step A: Candidate B starts session with A\'s resume (expecting 403)...');
    const resA = await makeRequest('POST', '/interviews', JSON.stringify({
      domain: 'BACKEND',
      difficulty: 'MEDIUM',
      interviewType: 'PERSONALIZED',
      resumeId: resumeIdA
    }), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jarB['XSRF-TOKEN']
    }, jarB);

    if (resA.status !== 403) {
      throw new Error(`Expected 403 for unauthorized resume use, got: ${resA.status}. Response: ${JSON.stringify(resA.data)}`);
    }
    console.log('✓ Rejected unauthorized resume request with status 403.');

    // Test B: Candidate A tries to use non-existent resume ID
    console.log('Step B: Candidate A starts session with non-existent UUID (expecting 404)...');
    const fakeUUID = 'd3b07384-d113-4f9e-a89a-25c276326e0e';
    const resB = await makeRequest('POST', '/interviews', JSON.stringify({
      domain: 'BACKEND',
      difficulty: 'MEDIUM',
      interviewType: 'PERSONALIZED',
      resumeId: fakeUUID
    }), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jarA['XSRF-TOKEN']
    }, jarA);

    if (resB.status !== 404) {
      throw new Error(`Expected 404 for non-existent resume ID, got: ${resB.status}`);
    }
    console.log('✓ Rejected non-existent resume ID with status 404.');

    // Test C: Missing resumeId for PERSONALIZED run
    console.log('Step C: Starts personalized session without resumeId (expecting 400)...');
    const resC = await makeRequest('POST', '/interviews', JSON.stringify({
      domain: 'BACKEND',
      difficulty: 'MEDIUM',
      interviewType: 'PERSONALIZED'
    }), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jarA['XSRF-TOKEN']
    }, jarA);

    if (resC.status !== 400) {
      throw new Error(`Expected 400 for missing resumeId parameter, got: ${resC.status}`);
    }
    console.log('✓ Rejected missing resumeId parameter with status 400.');

    results['ownership_and_validation'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    results['ownership_and_validation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 3: Personalized Session Creation & Offline Questions
  // ----------------------------------------------------
  let sessionIdA;
  try {
    console.log('\n--- 3. Testing Personalized Session Creation & Questions ---');
    
    console.log('Step A: Starting personalized session...');
    const res = await makeRequest('POST', '/interviews', JSON.stringify({
      domain: 'BACKEND',
      difficulty: 'MEDIUM',
      interviewType: 'PERSONALIZED',
      resumeId: resumeIdA
    }), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jarA['XSRF-TOKEN']
    }, jarA);

    if (res.status !== 201) {
      throw new Error(`Session creation failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }

    const session = res.data.data.session;
    sessionIdA = session.id;
    
    if (session.interviewType !== 'PERSONALIZED') {
      throw new Error('Session interviewType is not PERSONALIZED');
    }
    if (session.resumeId !== resumeIdA) {
      throw new Error('Session resumeId does not match input');
    }

    console.log(`✓ Personalized session successfully created (ID: ${sessionIdA}).`);

    // Fetch session details to check generated questions
    console.log('Step B: Inspecting generated personalized questions...');
    const detailRes = await makeRequest('GET', `/interviews/${sessionIdA}`, null, {}, jarA);
    const questions = detailRes.data.data.session.questions;

    if (!questions || questions.length !== 4) {
      throw new Error('Expected 4 generated questions, got: ' + (questions ? questions.length : 0));
    }

    // Verify offline questions mention the candidate's resume project ("Ecommerce App" or "React")
    const questionsTextJoined = questions.map(q => q.questionText).join(' ');
    if (!questionsTextJoined.includes('Ecommerce App') && !questionsTextJoined.includes('React')) {
      throw new Error('Generated questions did not incorporate resume skills or projects: ' + questionsTextJoined);
    }

    console.log('✓ Tailored questions correctly reference resume content.');
    results['session_creation_and_questions'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    results['session_creation_and_questions'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 4: Concurrent Personalized Session Creation
  // ----------------------------------------------------
  try {
    console.log('\n--- 4. Testing Concurrent Session Creation ---');
    if (!resumeIdA) throw new Error('Skipping: resumeIdA not available');

    console.log('Triggering 3 concurrent session creation requests...');
    const promises = Array.from({ length: 3 }).map(() => {
      return makeRequest('POST', '/interviews', JSON.stringify({
        domain: 'FRONTEND',
        difficulty: 'EASY',
        interviewType: 'PERSONALIZED',
        resumeId: resumeIdA
      }), {
        'Content-Type': 'application/json',
        'x-xsrf-token': jarA['XSRF-TOKEN']
      }, jarA);
    });

    const responses = await Promise.all(promises);
    responses.forEach((res, idx) => {
      if (res.status !== 201) {
        throw new Error(`Concurrent request #${idx + 1} failed with status ${res.status}`);
      }
    });

    console.log('✓ All concurrent session creation requests completed successfully.');
    results['concurrent_creation'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    results['concurrent_creation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 5: Personalized Evaluation & Penalties
  // ----------------------------------------------------
  try {
    console.log('\n--- 5. Testing Personalized Evaluation & Penalties ---');
    if (!sessionIdA) throw new Error('Skipping: sessionIdA not available');

    // Fetch questions to answer
    const sessionRes = await makeRequest('GET', `/interviews/${sessionIdA}`, null, {}, jarA);
    const questions = sessionRes.data.data.session.questions;

    // Submit Answers:
    // Answer 1: Good answer containing resume keywords ("React", "Node.js")
    console.log('Step A: Submitting high-quality answer for Q1...');
    await makeRequest('PATCH', `/interviews/${sessionIdA}/questions/${questions[0].id}/answer`, JSON.stringify({
      userAnswer: 'I chose React for frontend views and Node.js for backend API microservices because of event driven performance and rapid scalability.'
    }), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jarA['XSRF-TOKEN']
    }, jarA);

    // Answer 2: Blank or extremely brief response to trigger consistency penalty
    console.log('Step B: Submitting brief answer for Q2...');
    await makeRequest('PATCH', `/interviews/${sessionIdA}/questions/${questions[1].id}/answer`, JSON.stringify({
      userAnswer: 'no idea'
    }), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jarA['XSRF-TOKEN']
    }, jarA);

    // End session (triggers background evaluation)
    console.log('Step C: Ending session (enqueuing evaluation)...');
    const endRes = await makeRequest('PATCH', `/interviews/${sessionIdA}/end`, JSON.stringify({
      durationSeconds: 120
    }), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jarA['XSRF-TOKEN']
    }, jarA);

    if (endRes.status !== 200) {
      throw new Error('Failed to end interview session: ' + endRes.status);
    }

    // Wait and poll for evaluation completion
    console.log('Step D: Polling for evaluation completion...');
    let evalData = null;
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise(r => setTimeout(r, 1000));
      const res = await makeRequest('GET', `/interviews/${sessionIdA}/evaluation`, null, {}, jarA);
      if (res.data && res.data.data && res.data.data.status === 'COMPLETED') {
        evalData = res.data.data.evaluation;
        break;
      }
    }

    if (!evalData) {
      throw new Error('Evaluation did not complete in time (timeout)');
    }

    console.log('✓ Evaluation completed.');
    console.log(`- Alignment Score: ${evalData.resumeAlignmentScore}%`);
    console.log(`- Consistency Score: ${evalData.consistencyScore}%`);
    console.log(`- Confidence Score: ${evalData.confidenceScore}%`);

    if (evalData.resumeAlignmentScore === null || evalData.consistencyScore === null || evalData.confidenceScore === null) {
      throw new Error('Evaluation is missing personalized score fields');
    }

    // Verify consistency score is penalized (< 80) due to brief answers
    if (evalData.consistencyScore > 80) {
      throw new Error(`Consistency score should be penalized below 80, got: ${evalData.consistencyScore}`);
    }
    console.log('✓ Verified consistency score penalty was successfully applied.');

    // Verify rawResponse holds detailed insights
    const raw = evalData.rawResponse;
    if (!raw.strongestClaimedSkill || !raw.weakestClaimedSkill || !raw.mostConvincingProjectDiscussion || !Array.isArray(raw.skillsRequiringVerification)) {
      throw new Error('Evaluation rawResponse is missing tailored insights payload: ' + JSON.stringify(raw));
    }
    console.log(`✓ AI Insights found: Strongest=${raw.strongestClaimedSkill}, Weakest=${raw.weakestClaimedSkill}`);

    results['evaluation_and_penalties'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    results['evaluation_and_penalties'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 6: Analytics Integration & Trend Calculations
  // ----------------------------------------------------
  try {
    console.log('\n--- 6. Testing Analytics & Trends Calculations ---');

    console.log('Step A: Fetching analytics overview...');
    const overviewRes = await makeRequest('GET', '/analytics/overview', null, {}, jarA);
    if (overviewRes.status !== 200) throw new Error('Failed to fetch analytics overview');
    
    const overview = overviewRes.data.data;
    if (overview.averageResumeAlignment === undefined || overview.averageConsistencyScore === undefined) {
      throw new Error('Overview is missing averageResumeAlignment or averageConsistencyScore properties');
    }
    console.log(`✓ Overview average alignment: ${overview.averageResumeAlignment}%`);
    console.log(`✓ Overview average consistency: ${overview.averageConsistencyScore}%`);

    console.log('Step B: Fetching daily trends...');
    const performanceRes = await makeRequest('GET', '/analytics/performance?days=7', null, {}, jarA);
    if (performanceRes.status !== 200) throw new Error('Failed to fetch performance trends');

    const trendPoints = performanceRes.data.data;
    const hasConfidenceTrend = trendPoints.some(pt => pt.confidenceScore !== null && pt.confidenceScore !== undefined);
    if (!hasConfidenceTrend) {
      throw new Error('Trend points did not report confidence scores');
    }
    console.log('✓ Verified daily confidence score trends are calculated.');

    results['analytics_integration'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    results['analytics_integration'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 7: Resume Deletion Integrity
  // ----------------------------------------------------
  try {
    console.log('\n--- 7. Testing Resume Deletion & Session Integrity ---');
    if (!resumeIdA || !sessionIdA) throw new Error('Skipping: resumeIdA or sessionIdA not available');

    console.log('Step A: Deleting Candidate A\'s resume...');
    const delRes = await makeRequest('DELETE', `/resumes/${resumeIdA}`, null, {
      'x-xsrf-token': jarA['XSRF-TOKEN']
    }, jarA);
    if (delRes.status !== 200) {
      throw new Error('Resume deletion failed: ' + delRes.status);
    }
    console.log('✓ Deleted resume.');

    console.log('Step B: Fetching associated interview session...');
    const sessionRes = await makeRequest('GET', `/interviews/${sessionIdA}`, null, {}, jarA);
    const session = sessionRes.data.data.session;
    
    // The relationship uses ON DELETE SET NULL, so resumeId should now be null
    if (session.resumeId !== null) {
      throw new Error('Session resumeId should have been set to null after delete, got: ' + session.resumeId);
    }
    console.log('✓ Verified session integrity (resumeId set to null successfully).');

    results['resume_deletion_integrity'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    results['resume_deletion_integrity'] = 'FAIL';
  }

  await prisma.$disconnect();

  console.log('\n====================================================');
  console.log('🏁 Personalized Interview Engine (V1.2) Test Summary:');
  console.log('====================================================');
  let overallPass = true;
  Object.entries(results).forEach(([test, status]) => {
    console.log(`${status === 'PASS' ? '🟢' : '🔴'} ${test}: ${status}`);
    if (status !== 'PASS') overallPass = false;
  });
  console.log('====================================================');
  
  if (overallPass) {
    console.log('🎉 ALL PERSONALIZED INTERVIEW (V1.2) TESTS PASSED SUCCESSFULLY!');
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
