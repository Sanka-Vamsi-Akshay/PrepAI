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
        'x-test-bypass': 'true',
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
  console.log('🧪 Starting Company Specific Interview Modes (Version 1.3) Integration Tests...\n');
  const results = {};
  
  const testEmail = 'candidateCompany@test.com';

  // Cleanup old user
  try {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    console.log('🧹 Cleaned up old test users.');
  } catch (err) {
    console.warn('⚠️ DB Cleanup warning:', err.message);
  }

  // Setup candidate jar and user id
  const jar = {};
  let userId;

  try {
    console.log('Setup: Bootstrapping CSRF token...');
    await makeRequest('GET', '/health', null, {}, jar);
    const csrf = jar['XSRF-TOKEN'];

    console.log('Setup: Registering test user...');
    const regRes = await makeRequest('POST', '/auth/register', JSON.stringify({
      email: testEmail, password: 'Password123!', name: 'Candidate Company'
    }), { 'Content-Type': 'application/json', 'x-xsrf-token': csrf }, jar);
    userId = regRes.data.data.user.id;
    console.log(`✓ User bootstrapped. ID: ${userId}`);
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

  let resumeId;
  try {
    console.log('Setup: Uploading resume...');
    resumeId = await uploadResume(jar);
    console.log(`✓ Resume uploaded. ID: ${resumeId}`);
  } catch (err) {
    console.error('💥 Resume upload setup failed:', err.message);
    process.exit(1);
  }

  // Save the original Gemini API key to restore it
  const originalApiKey = process.env.GEMINI_API_KEY;

  // ----------------------------------------------------
  // TEST 1: Company Profile Session Creation & Title Formatting
  // ----------------------------------------------------
  try {
    console.log('\n--- 1. Testing Company Session Creation ---');
    
    // Force Offline Fallback for deterministic checks
    process.env.GEMINI_API_KEY = '';

    console.log('Step A: Creating GOOGLE target session (EASY difficulty)...');
    const startPayload = {
      domain: 'DSA',
      difficulty: 'EASY',
      interviewType: 'STANDARD',
      companyProfile: 'GOOGLE'
    };

    const res = await makeRequest('POST', '/interviews', JSON.stringify(startPayload), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jar['XSRF-TOKEN']
    }, jar);

    if (res.status !== 201) {
      throw new Error(`Expected 201, got ${res.status}. Data: ${JSON.stringify(res.data)}`);
    }

    const session = res.data.data.session;
    if (session.companyProfile !== 'GOOGLE') {
      throw new Error(`Expected companyProfile to be GOOGLE, got ${session.companyProfile}`);
    }
    if (!session.title.includes('GOOGLE')) {
      throw new Error(`Expected title to contain company profile name, got ${session.title}`);
    }

    // Verify questions contains company fallback themes
    const questions = session.questions;
    if (questions.length === 0) {
      throw new Error('No questions generated for the company session');
    }
    const hasGoogleTheme = questions.some(q => q.questionText.toLowerCase().includes('google') || q.questionText.toLowerCase().includes('cache eviction') || q.questionText.toLowerCase().includes('map-reduce'));
    if (!hasGoogleTheme) {
      throw new Error('Google fallback questions do not contain Google thematic elements: ' + JSON.stringify(questions));
    }

    console.log('✓ Company target session created and verified.');
    results['company_session_creation'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    results['company_session_creation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 2: Company + Resume Personalization (Combined Context)
  // ----------------------------------------------------
  try {
    console.log('\n--- 2. Testing Company + Resume Personalization ---');
    
    process.env.GEMINI_API_KEY = ''; // Force offline

    console.log('Step A: Starting Amazon target personalized session...');
    const startPayload = {
      domain: 'BACKEND',
      difficulty: 'MEDIUM_HARD',
      interviewType: 'PERSONALIZED',
      resumeId: resumeId,
      companyProfile: 'AMAZON'
    };

    const res = await makeRequest('POST', '/interviews', JSON.stringify(startPayload), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jar['XSRF-TOKEN']
    }, jar);

    if (res.status !== 201) {
      throw new Error(`Expected 201, got ${res.status}`);
    }

    const session = res.data.data.session;
    const questions = session.questions;
    
    // Offline generator should combine resume stack (React, Node) and Amazon focus (Ownership, Customer Order, etc.)
    const containsAmazonWord = questions.some(q => q.questionText.toLowerCase().includes('amazon'));
    const containsResumeWord = questions.some(q => q.questionText.toLowerCase().includes('react') || q.questionText.toLowerCase().includes('node'));

    if (!containsAmazonWord) {
      throw new Error('Questions did not personalize to target company (AMAZON)');
    }
    if (!containsResumeWord) {
      throw new Error('Questions did not personalize to resume details (React / Node)');
    }

    console.log('✓ Questions successfully combined resume stack and company target parameters.');
    results['company_resume_personalization'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    results['company_resume_personalization'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 3: Company Evaluation & Rubric Insights
  // ----------------------------------------------------
  let evaluatedSessionId;
  try {
    console.log('\n--- 3. Testing Company Evaluation Insights ---');
    
    process.env.GEMINI_API_KEY = ''; // Force offline

    console.log('Step A: Creating and starting a completed mock Meta session...');
    const startPayload = {
      domain: 'FRONTEND',
      difficulty: 'HARD',
      interviewType: 'PERSONALIZED',
      resumeId: resumeId,
      companyProfile: 'META'
    };

    const startRes = await makeRequest('POST', '/interviews', JSON.stringify(startPayload), {
      'Content-Type': 'application/json',
      'x-xsrf-token': jar['XSRF-TOKEN']
    }, jar);

    evaluatedSessionId = startRes.data.data.session.id;
    const questions = startRes.data.data.session.questions;

    console.log('Step B: Submitting mock answers...');
    for (const q of questions) {
      await makeRequest('PATCH', `/interviews/${evaluatedSessionId}/questions/${q.id}/answer`, JSON.stringify({
        userAnswer: 'I implemented this project using React and Node.js. Optimized frontend states for fast synchronization.'
      }), { 'Content-Type': 'application/json', 'x-xsrf-token': jar['XSRF-TOKEN'] }, jar);
    }

    console.log('Step C: Ending mock session to queue background evaluation...');
    const endRes = await makeRequest('PATCH', `/interviews/${evaluatedSessionId}/end`, JSON.stringify({
      durationSeconds: 150
    }), { 'Content-Type': 'application/json', 'x-xsrf-token': jar['XSRF-TOKEN'] }, jar);

    if (endRes.status !== 200) {
      throw new Error(`Failed to end session: ${endRes.status}`);
    }

    console.log('Step D: Polling for evaluation completion...');
    let evalRecord = null;
    for (let attempt = 1; attempt <= 15; attempt++) {
      const getRes = await makeRequest('GET', `/interviews/${evaluatedSessionId}/evaluation`, null, {}, jar);
      if (getRes.data.data.status === 'COMPLETED') {
        evalRecord = getRes.data.data.evaluation;
        break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!evalRecord) {
      throw new Error('Evaluation processing timed out or failed');
    }

    console.log('Step E: Validating Meta target assessment rubrics...');
    const raw = evalRecord.rawResponse;
    if (!raw) {
      throw new Error('rawResponse payload is missing from evaluation');
    }

    if (!Array.isArray(raw.companyStrengths) || raw.companyStrengths.length === 0) {
      throw new Error('Meta target strengths are missing from rawResponse');
    }
    if (!Array.isArray(raw.companyWeaknesses) || raw.companyWeaknesses.length === 0) {
      throw new Error('Meta target weaknesses/gaps are missing from rawResponse');
    }
    if (!Array.isArray(raw.companyRecommendations) || raw.companyRecommendations.length === 0) {
      throw new Error('Meta target recommendations are missing from rawResponse');
    }

    console.log('✓ Rubric insights evaluated and stored correctly.');
    results['company_evaluation_insights'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    results['company_evaluation_insights'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 4: Analytics Caching Snapshot Generations
  // ----------------------------------------------------
  try {
    console.log('\n--- 4. Testing Analytics Cache Generation ---');

    console.log('Step A: Fetching analytics overview with refresh=true...');
    const analyticsRes = await makeRequest('GET', '/analytics/overview?refresh=true', null, {}, jar);
    
    if (analyticsRes.status !== 200) {
      throw new Error(`Overview recalculation failed: ${analyticsRes.status}`);
    }

    const data = analyticsRes.data.data;
    console.log('Step B: Inspecting cached company parameters...');
    
    if (!data.companyReadiness || typeof data.companyReadiness !== 'object') {
      throw new Error('companyReadiness mapping is missing from analytics cache');
    }

    // Verify Meta details cached
    const metaReadiness = data.companyReadiness['META'];
    if (!metaReadiness) {
      throw new Error('Meta readiness details were not aggregated');
    }

    if (typeof metaReadiness.readinessScore !== 'number') {
      throw new Error('Meta readiness score is invalid: ' + metaReadiness.readinessScore);
    }
    if (!Array.isArray(metaReadiness.strengths) || metaReadiness.strengths.length === 0) {
      throw new Error('Meta aggregated strengths are missing');
    }

    // Verify strongest/weakest profile fields
    if (data.strongestCompanyProfile !== 'META' && data.weakestCompanyProfile !== 'META') {
      throw new Error(`Expected META to be flagged as strongest/weakest profile, got: strongest=${data.strongestCompanyProfile}, weakest=${data.weakestCompanyProfile}`);
    }

    // Verify DB cache persistence
    const dbSnapshot = await prisma.analyticsSnapshot.findUnique({
      where: { userId }
    });
    if (!dbSnapshot || !dbSnapshot.companyReadiness || dbSnapshot.strongestCompanyProfile === null) {
      throw new Error('Analytics snapshot in database does not cache company profile elements');
    }

    console.log('✓ Analytics snapshot company readiness cached successfully in database.');
    results['analytics_cache_generation'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    results['analytics_cache_generation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 5: Offline Fallback Behavior Checks
  // ----------------------------------------------------
  try {
    console.log('\n--- 5. Testing Offline Fallback Behavior ---');
    
    const { generateQuestions, evaluateSession } = require('../src/services/ai/gemini.service');
    
    console.log('Step A: Checking offline question generation for GOOGLE...');
    process.env.GEMINI_API_KEY = ''; // Force offline mode
    const offlineQuestions = await generateQuestions('DSA', 'HARD', 'GOOGLE');
    const isGoogleOffline = offlineQuestions.some(q => q.toLowerCase().includes('google') || q.toLowerCase().includes('distributed key-value'));
    
    if (!isGoogleOffline) {
      throw new Error('Offline fallback did not generate Google-specific questions: ' + JSON.stringify(offlineQuestions));
    }

    console.log('Step B: Checking offline evaluation for AMAZON...');
    const transcript = [
      { id: 'a0a0a0a0-b0b0-c0c0-d0d0-e0e0e0e0e0e0', questionText: 'Describe a project', userAnswer: 'Built order processing.' }
    ];
    const offlineEval = await evaluateSession('BACKEND', 'MEDIUM_HARD', transcript, 'AMAZON');
    if (!offlineEval.companyStrengths || offlineEval.companyStrengths.length === 0) {
      throw new Error('Offline evaluation failed to produce Amazon specific strengths');
    }
    const hasAmazonName = offlineEval.companyStrengths.some(s => s.toLowerCase().includes('amazon'));
    if (!hasAmazonName) {
      throw new Error('Offline evaluation strengths do not mention target company: ' + JSON.stringify(offlineEval.companyStrengths));
    }

    console.log('✓ Verified full offline functionality and target personalization correctness.');
    results['offline_fallback_behavior'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    results['offline_fallback_behavior'] = 'FAIL';
  }

  // Restore the original Gemini API key
  process.env.GEMINI_API_KEY = originalApiKey;

  // Clean up
  try {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  } catch (e) {}

  console.log('\n====================================================');
  console.log('🏁 Company Specific Interview Modes (V1.3) Test Summary:');
  console.log('====================================================');
  let allPassed = true;
  for (const [test, status] of Object.entries(results)) {
    const symbol = status === 'PASS' ? '🟢' : '🔴';
    console.log(`${symbol} ${test}: ${status}`);
    if (status !== 'PASS') allPassed = false;
  }
  console.log('====================================================');
  if (allPassed) {
    console.log('🎉 ALL COMPANY TARGET INTERVIEW TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED. CHECK LOGS ABOVE.\n');
    process.exit(1);
  }
}

runTests();
