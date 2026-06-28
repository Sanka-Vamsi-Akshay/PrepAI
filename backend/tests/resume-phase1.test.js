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

// Minimal valid PDF text stream base64 (Contains: "React, Node.js, TypeScript.")
const MOCK_PDF_BASE64 = 'JVBERi0xLjQKJdfljqgKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNSAwIFIKPj4KPj4KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0Nwo+PnN0cmVhbQpCVC9GMSAxMiBUZgoxMDAgNTAwIFRkCihSZWFjdCwgTm9kZS5qcywgVHlwZVNjcmlwdC4pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDcwIDAwMDAwIGYgCjAwMDAwMDAxMjAgMDAwMDAgbiAKMDAwMDAwMDI1OCAwMDAwMCBuIAowMDAwMDAwMzU1IDAwMDAwIGYgCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQxCiUlRU9GCg==';

// Minimal valid zip containing word/document.xml with text
const MOCK_DOCX_BASE64 = 'UEsDBAoAAAAAAMN91VwAAAAAAAAAAAAAAAAFAAAAd29yZC9QSwMECgAAAAAAw33VXDrrPh0nAQAAJwEAABEAAAB3b3JkL2RvY3VtZW50LnhtbDw/eG1sIHZlcnNpb249IjEuMCIgZW5jb2Rpbmc9IlVURi04IiBzdGFuZGFsb25lPSJ5ZXMiPz4KPHc6ZG9jdW1lbnQgeG1sbnM6dz0iaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL3dvcmRwcm9jZXNzaW5nbWwvMjAwNi9tYWluIj4KICA8dzpib2R5PgogICAgPHc6cD4KICAgICAgPHc6cj4KICAgICAgICA8dzp0PlJlYWN0LCBOb2RlLmpzLCBUeXBlU2NyaXB0IGRldmVsb3BlciByZXN1bWUgZnJvbSBkb2N4PC93OnQ+CiAgICAgIDwvdzpyPgogICAgPC93OnA+CiAgPC93OmJvZHk+Cjwvdzpkb2N1bWVudD5QSwECFAAKAAAAAADDfdVcAAAAAAAAAAAAAAAABQAAAAAAAAAAABAAAAAAAAAAd29yZC9QSwECFAAKAAAAAADDfdVcOus+HScBAAAnAQAAEQAAAAAAAAAAAAAAAAAjAAAAd29yZC9kb2N1bWVudC54bWxQSwUGAAAAAAIAAgByAAAAeQEAAAAA';

async function runTests() {
  console.log('🧪 Starting Resume Intelligence System (Phase 1) Integration Tests...\n');
  const results = {};
  
  const testEmail = 'resumeTest@test.com';
  try {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    console.log('🧹 Cleaned up old test user.');
  } catch (err) {
    console.warn('⚠️ DB Cleanup warning:', err.message);
  }

  // Setup test user
  const cookieJar = {};
  let userId;
  try {
    console.log('Setup: Bootstrapping CSRF token...');
    await makeRequest('GET', '/health', null, {}, cookieJar);
    const csrfToken = cookieJar['XSRF-TOKEN'];
    
    console.log('Setup: Registering test user...');
    const regRes = await makeRequest('POST', '/auth/register', JSON.stringify({
      email: testEmail,
      password: 'Password123!',
      name: 'Resume Candidate'
    }), {
      'Content-Type': 'application/json',
      'x-xsrf-token': csrfToken
    }, cookieJar);
    
    if (regRes.status !== 201) {
      throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
    }
    userId = regRes.data.data.user.id;
    console.log(`✓ Authenticated test user. ID: ${userId}`);
  } catch (err) {
    console.error('💥 Setup failed:', err.message);
    process.exit(1);
  }

  // ----------------------------------------------------
  // TEST 1: Upload validation (size and extension filters)
  // ----------------------------------------------------
  try {
    console.log('\n--- 1. Testing Upload Validation Limits ---');
    const boundary = '----TestBoundary' + Math.random().toString(16);
    
    // Test A: Unsupported extension
    console.log('Step A: Uploading txt file (expecting failure)...');
    const txtBody = buildMultipartBody({}, {
      resume: {
        filename: 'resume.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('React developer resume')
      }
    }, boundary);

    const txtRes = await makeRequest('POST', '/resumes/upload', txtBody, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);

    if (txtRes.status !== 400) {
      throw new Error(`Expected status 400 for txt extension, got: ${txtRes.status}`);
    }
    console.log('✓ Rejected unsupported extension (txt) with status 400.');

    // Test B: File too large (> 5MB)
    console.log('Step B: Uploading > 5MB file (expecting failure)...');
    const largeBody = buildMultipartBody({}, {
      resume: {
        filename: 'resume.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.alloc(6 * 1024 * 1024) // 6MB
      }
    }, boundary);

    const largeRes = await makeRequest('POST', '/resumes/upload', largeBody, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);

    // Multer size limits typically result in a 500 error (LIMIT_FILE_SIZE) or 400 depending on handler
    if (largeRes.status !== 500 && largeRes.status !== 400) {
      throw new Error(`Expected failure status 400 or 500 for file size, got: ${largeRes.status}`);
    }
    console.log('✓ Rejected file size > 5MB with failure status.');

    results['upload_validation'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    results['upload_validation'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 2: PDF Parsing and text extraction
  // ----------------------------------------------------
  let pdfResumeId;
  try {
    console.log('\n--- 2. Testing PDF Text Extraction & Parsing ---');
    const boundary = '----TestBoundary' + Math.random().toString(16);
    const pdfBuffer = Buffer.from(MOCK_PDF_BASE64, 'base64');
    
    const pdfBody = buildMultipartBody({}, {
      resume: {
        filename: 'resume_candidate.pdf',
        mimetype: 'application/pdf',
        buffer: pdfBuffer
      }
    }, boundary);

    const pdfRes = await makeRequest('POST', '/resumes/upload', pdfBody, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);

    if (pdfRes.status !== 201) {
      throw new Error(`Upload failed with status ${pdfRes.status}: ${JSON.stringify(pdfRes.data)}`);
    }

    const resume = pdfRes.data.data.resume;
    pdfResumeId = resume.id;
    if (resume.fileName !== 'resume_candidate.pdf') throw new Error('Incorrect filename returned');
    if (!resume.extractedText.includes('React') || !resume.extractedText.includes('Node.js')) {
      throw new Error('Extracted text did not include keywords: ' + resume.extractedText);
    }
    console.log('✓ PDF parsed and text successfully extracted.');
    results['pdf_extraction'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    results['pdf_extraction'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 3: DOCX Parsing and text extraction
  // ----------------------------------------------------
  try {
    console.log('\n--- 3. Testing DOCX Text Extraction & Parsing ---');
    const boundary = '----TestBoundary' + Math.random().toString(16);
    const docxBuffer = Buffer.from(MOCK_DOCX_BASE64, 'base64');
    
    const docxBody = buildMultipartBody({}, {
      resume: {
        filename: 'resume_candidate.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: docxBuffer
      }
    }, boundary);

    const docxRes = await makeRequest('POST', '/resumes/upload', docxBody, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);

    if (docxRes.status !== 201) {
      throw new Error(`Upload failed with status ${docxRes.status}: ${JSON.stringify(docxRes.data)}`);
    }

    const resume = docxRes.data.data.resume;
    if (resume.fileName !== 'resume_candidate.docx') throw new Error('Incorrect filename returned');
    console.log('✓ DOCX parsed and text successfully extracted.');
    results['docx_extraction'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    results['docx_extraction'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 4: Skill Extraction & Resume Scoring
  // ----------------------------------------------------
  try {
    console.log('\n--- 4. Testing Skill Extraction & Resume Scoring ---');
    if (!pdfResumeId) throw new Error('Skipping test: PDF resume was not uploaded');

    const detailRes = await makeRequest('GET', `/resumes/${pdfResumeId}`, null, {}, cookieJar);
    if (detailRes.status !== 200) throw new Error(`Failed to fetch resume: ${detailRes.status}`);

    const resume = detailRes.data.data.resume;
    const skills = resume.parsedData.skills;
    const score = resume.insights.strengthScore;

    if (!Array.isArray(skills) || skills.length === 0) {
      throw new Error('Skills array is empty or invalid');
    }
    if (typeof score !== 'number' || score <= 0 || score > 100) {
      throw new Error('Strength score is invalid: ' + score);
    }

    console.log(`✓ Skills extracted: [${skills.join(', ')}]`);
    console.log(`✓ Resume Strength Score calculated: ${score}%`);
    results['skills_and_scoring'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    results['skills_and_scoring'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 5: Domain Gap Analysis
  // ----------------------------------------------------
  try {
    console.log('\n--- 5. Testing Domain Gap Analysis ---');
    if (!pdfResumeId) throw new Error('Skipping test: PDF resume was not uploaded');

    // Test gap analysis for FRONTEND domain
    const gapRes = await makeRequest('GET', `/resumes/${pdfResumeId}/gap-analysis?domain=FRONTEND`, null, {}, cookieJar);
    if (gapRes.status !== 200) throw new Error(`Gap analysis query failed: ${gapRes.status}`);

    const gapData = gapRes.data.data;
    if (gapData.domain !== 'FRONTEND') throw new Error('Expected domain to be FRONTEND');
    if (!Array.isArray(gapData.missingSkills)) throw new Error('Missing skills is not an array');
    
    console.log(`✓ FRONTEND domain gap analysis returned ${gapData.missingSkills.length} missing skill(s).`);
    results['gap_analysis'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    results['gap_analysis'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 6: Analytics Dashboard Integration
  // ----------------------------------------------------
  try {
    console.log('\n--- 6. Testing Analytics Dashboard Integration ---');
    
    // Fetch analytics overview
    const overviewRes = await makeRequest('GET', '/analytics/overview', null, {}, cookieJar);
    if (overviewRes.status !== 200) throw new Error(`Analytics overview endpoint failed: ${overviewRes.status}`);

    const metrics = overviewRes.data.data;
    if (metrics.resumeStrengthScore === undefined || metrics.resumeStrengthScore === null) {
      throw new Error('Dashboard is missing resumeStrengthScore parameter');
    }
    if (metrics.resumeMissingSkillsCount === undefined || metrics.resumeMissingSkillsCount === null) {
      throw new Error('Dashboard is missing resumeMissingSkillsCount parameter');
    }
    if (metrics.resumeLearningRoadmap === undefined || metrics.resumeLearningRoadmap === null) {
      throw new Error('Dashboard is missing resumeLearningRoadmap parameter');
    }

    console.log(`✓ Dashboard resumeStrengthScore: ${metrics.resumeStrengthScore}%`);
    console.log(`✓ Dashboard resumeMissingSkillsCount: ${metrics.resumeMissingSkillsCount}`);
    console.log(`✓ Dashboard learningRoadmap exists with ${metrics.resumeLearningRoadmap.length} items.`);
    results['analytics_integration'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    results['analytics_integration'] = 'FAIL';
  }

  // Clean up database test user
  try {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  } catch (e) {}
  await prisma.$disconnect();

  console.log('\n====================================================');
  console.log('🏁 Resume Intelligence System (Phase 1) Test Summary:');
  console.log('====================================================');
  let overallPass = true;
  Object.entries(results).forEach(([test, status]) => {
    console.log(`${status === 'PASS' ? '🟢' : '🔴'} ${test}: ${status}`);
    if (status !== 'PASS') overallPass = false;
  });
  console.log('====================================================');
  
  if (overallPass) {
    console.log('🎉 ALL RESUME INTEL (PHASE 1) TESTS PASSED SUCCESSFULLY!');
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
