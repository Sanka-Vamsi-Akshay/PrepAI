process.env.ENABLE_TEST_RATE_LIMIT = 'true';
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

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

// Minimal valid PDF text stream
const MOCK_PDF_BUFFER = Buffer.from('JVBERi0xLjQKJdfljqgKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNSAwIFIKPj4KPj4KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0Nwo+PnN0cmVhbQpCVC9GMSAxMiBUZgoxMDAgNTAwIFRkCihSZWFjdCwgTm9kZS5qcywgVHlwZVNjcmlwdC4pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDcwIDAwMDAwIGYgCjAwMDAwMDAxMjAgMDAwMDAgbiAKMDAwMDAwMDI1OCAwMDAwMCBuIAowMDAwMDAwMzU1IDAwMDAwIGYgCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDQxCiUlRU9GCg==', 'base64');

async function testJwtDefaultSecretCrash() {
  console.log('1. Testing JWT_SECRET validation crash in production environment...');
  return new Promise((resolve) => {
    // We launch node on index.ts using ts-node to simulate startup
    const proc = spawn('npx', ['ts-node', '-r', 'tsconfig-paths/register', 'src/index.ts'], {
      cwd: path.resolve(__dirname, '..'),
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        JWT_SECRET: 'super_secret_jwt_key_change_me_in_production',
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/ai_interview_db?schema=public'
      }
    });

    let stderr = '';
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 1 && stderr.includes('Security Vulnerability: JWT_SECRET cannot be the default')) {
        console.log('🟢 JWT_SECRET validation crash passed successfully! Process exited with code 1 and logged the security warning.');
        resolve(true);
      } else {
        console.error(`🔴 JWT_SECRET validation crash failed. Exit code: ${code}. Stderr: ${stderr}`);
        resolve(false);
      }
    });

    // Terminate after 10 seconds in case it doesn't crash
    setTimeout(() => {
      proc.kill();
      resolve(false);
    }, 10000);
  });
}

async function runTests() {
  console.log('🧪 Starting Production Hardening & Security Integration Tests...\n');
  const results = {};

  // Verify JWT crash
  try {
    const jwtCrashOk = await testJwtDefaultSecretCrash();
    results['JWT Secret Production Crash'] = jwtCrashOk ? 'PASS' : 'FAIL';
  } catch (err) {
    console.error('💥 Failed checking JWT crash:', err);
    results['JWT Secret Production Crash'] = 'FAIL';
  }

  // Setup test user for other routes
  const testEmail = 'prodHardening@test.com';
  const cookieJar = {};
  let csrfToken = '';
  
  try {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  } catch (e) {}

  try {
    console.log('\nBootstrapping user session...');
    // health check issues a CSRF token
    await makeRequest('GET', '/health', null, {}, cookieJar);
    csrfToken = cookieJar['XSRF-TOKEN'];

    const regRes = await makeRequest('POST', '/auth/register', JSON.stringify({
      email: testEmail,
      password: 'SecurePass123',
      name: 'Prod Hardening User'
    }), {
      'Content-Type': 'application/json',
      'x-xsrf-token': csrfToken
    }, cookieJar);

    if (regRes.status !== 201) {
      throw new Error(`Failed to register test user. Status: ${regRes.status}. Data: ${JSON.stringify(regRes.data)}`);
    }

    // Refresh cookies
    csrfToken = cookieJar['XSRF-TOKEN'];

    // ----------------------------------------------------
    // TEST 2: Cookie configurations
    // ----------------------------------------------------
    console.log('\n2. Verifying production cookie SameSite=Lax configuration...');
    const setCookieHeaders = regRes.headers['set-cookie'] || [];
    let sameSiteLaxOk = true;
    
    setCookieHeaders.forEach(cookie => {
      if (!cookie.toLowerCase().includes('samesite=lax')) {
        sameSiteLaxOk = false;
        console.error(`🔴 Cookie did not have SameSite=Lax: ${cookie}`);
      }
    });

    if (sameSiteLaxOk && setCookieHeaders.length > 0) {
      console.log('🟢 Production cookie SameSite=Lax check passed!');
      results['Cookie sameSite=Lax Policy'] = 'PASS';
    } else {
      console.error('🔴 Production cookie SameSite=Lax check failed.');
      results['Cookie sameSite=Lax Policy'] = 'FAIL';
    }

    // ----------------------------------------------------
    // TEST 3: Resume upload hardening
    // ----------------------------------------------------
    console.log('\n3. Verifying resume upload hardening rules...');

    // A. Reject .doc or application/msword
    const boundary = '----WebKitFormBoundaryE1bC4V8u8xP8s';
    const invalidFileMime = buildMultipartBody({}, {
      resume: {
        filename: 'resume.doc',
        mimetype: 'application/msword',
        buffer: Buffer.from('mock word contents')
      }
    }, boundary);

    const uploadDocRes = await makeRequest('POST', '/resumes/upload', invalidFileMime, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'x-xsrf-token': csrfToken
    }, cookieJar);

    if (uploadDocRes.status === 400 && uploadDocRes.data.message.toLowerCase().includes('supported')) {
      console.log('🟢 Rejected invalid word document successfully.');
      results['Reject invalid MIME type (.doc)'] = 'PASS';
    } else {
      console.error(`🔴 Allowed invalid word document or returned wrong status: ${uploadDocRes.status}, data:`, uploadDocRes.data);
      results['Reject invalid MIME type (.doc)'] = 'FAIL';
    }

    // B. Reject incorrect mimetype with valid extension (e.g. extension .pdf but mime type image/png)
    const spoofedFile = buildMultipartBody({}, {
      resume: {
        filename: 'resume.pdf',
        mimetype: 'image/png',
        buffer: Buffer.from('mock image contents pretending to be pdf')
      }
    }, boundary);

    const uploadSpoofedRes = await makeRequest('POST', '/resumes/upload', spoofedFile, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'x-xsrf-token': csrfToken
    }, cookieJar);

    if (uploadSpoofedRes.status === 400) {
      console.log('🟢 Rejected spoofed file mime successfully.');
      results['Reject spoofed MIME type (pdf ext, png mime)'] = 'PASS';
    } else {
      console.error(`🔴 Allowed spoofed file mime or returned wrong status: ${uploadSpoofedRes.status}`);
      results['Reject spoofed MIME type (pdf ext, png mime)'] = 'FAIL';
    }

    // C. Reject file over 5MB
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const largeFile = buildMultipartBody({}, {
      resume: {
        filename: 'large.pdf',
        mimetype: 'application/pdf',
        buffer: largeBuffer
      }
    }, boundary);

    const uploadLargeRes = await makeRequest('POST', '/resumes/upload', largeFile, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'x-xsrf-token': csrfToken
    }, cookieJar);

    if (uploadLargeRes.status === 400 || uploadLargeRes.status === 500) {
      console.log('🟢 Rejected file > 5MB successfully.');
      results['Reject files larger than 5MB'] = 'PASS';
    } else {
      console.error(`🔴 Allowed file > 5MB or returned wrong status: ${uploadLargeRes.status}`);
      results['Reject files larger than 5MB'] = 'FAIL';
    }

    // ----------------------------------------------------
    // TEST 4: Rate limiters
    // ----------------------------------------------------
    console.log('\n4. Verifying rate limiting thresholds...');

    // A. Resume Upload rate limiter (max 5)
    // Send 5 valid uploads, then check 6th
    const validFile = buildMultipartBody({}, {
      resume: {
        filename: 'valid.pdf',
        mimetype: 'application/pdf',
        buffer: MOCK_PDF_BUFFER
      }
    }, boundary);

    console.log('Testing Resume Upload Rate Limiter (sending 6 uploads)...');
    let uploadRateLimited = false;
    for (let i = 0; i < 6; i++) {
      const res = await makeRequest('POST', '/resumes/upload', validFile, {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'x-xsrf-token': csrfToken
      }, cookieJar);
      
      if (res.status === 429) {
        uploadRateLimited = true;
        console.log(`🟢 Upload rate limiter blocked request #${i + 1} with HTTP 429.`);
        break;
      }
    }
    
    results['Resume Upload Rate Limiter'] = uploadRateLimited ? 'PASS' : 'FAIL';

    // B. AI Intensive Rate Limiter (max 10) - we can test it using POST /interviews/quick-start
    console.log('Testing AI-Intensive Route Rate Limiter (sending 12 Quick Starts)...');
    let aiRateLimited = false;
    for (let i = 0; i < 12; i++) {
      const res = await makeRequest('POST', '/interviews/quick-start', null, {
        'x-xsrf-token': csrfToken
      }, cookieJar);
      
      if (res.status === 429) {
        aiRateLimited = true;
        console.log(`🟢 AI-Intensive rate limiter blocked quick start #${i + 1} with HTTP 429.`);
        break;
      }
    }
    
    results['AI Intensive Rate Limiter'] = aiRateLimited ? 'PASS' : 'FAIL';

  } catch (err) {
    console.error('💥 Test run failed with crash:', err);
  } finally {
    try {
      await prisma.user.deleteMany({ where: { email: testEmail } });
    } catch (e) {}
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log('🏁 Production Hardening Verification Summary:');
  console.log('====================================================');
  let overallPass = true;
  Object.entries(results).forEach(([test, status]) => {
    console.log(`${status === 'PASS' ? '🟢' : '🔴'} ${test}: ${status}`);
    if (status !== 'PASS') overallPass = false;
  });
  console.log('====================================================');
  
  if (overallPass) {
    console.log('🎉 ALL PRODUCTION HARDENING TESTS PASSED!');
    process.exit(0);
  } else {
    console.log('❌ SOME HARDENING CHECKS FAILED.');
    process.exit(1);
  }
}

runTests();
