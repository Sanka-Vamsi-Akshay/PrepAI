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
  console.log('🧪 Starting Version 1.1 UX Upgrade Integration Tests...\n');
  const results = {};
  
  // Clean up database for fresh tests
  const testEmail = 'userUX@test.com';
  try {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    console.log('🧹 Cleaned up old test user.');
  } catch (err) {
    console.warn('⚠️ DB Cleanup warning:', err.message);
  }

  // ----------------------------------------------------
  // Setup: Register and Authenticate test user
  // ----------------------------------------------------
  const cookieJar = {};
  let userId;
  try {
    console.log('Step 0: Bootstrapping CSRF token...');
    await makeRequest('GET', '/health', null, {}, cookieJar);
    const csrfToken = cookieJar['XSRF-TOKEN'];
    
    console.log('Step 0b: Registering test user...');
    const regRes = await makeRequest('POST', '/auth/register', {
      email: testEmail,
      password: 'Password123!',
      name: 'User UX'
    }, {
      'x-xsrf-token': csrfToken
    }, cookieJar);
    
    if (regRes.status !== 201) {
      throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(regRes.data)}`);
    }
    userId = regRes.data.data.user.id;
    console.log(`✓ Authenticated successfully. User ID: ${userId}`);
  } catch (err) {
    console.error('💥 Failed to setup test user:', err.message);
    process.exit(1);
  }

  // ----------------------------------------------------
  // TEST 1: Bookmarks & Favorites
  // ----------------------------------------------------
  try {
    console.log('\n--- 1. Testing Bookmarks (Toggling, Filtering, Flags) ---');
    
    // Fetch a question from the bank
    console.log('Step A: Retrieving questions from bank...');
    const questionsRes = await makeRequest('GET', '/questions?limit=5', null, {}, cookieJar);
    if (questionsRes.status !== 200) throw new Error('Failed to fetch questions');
    
    const questions = questionsRes.data.data.questions;
    if (questions.length === 0) throw new Error('Question bank is empty. Seed questions first.');
    const targetQuestion = questions[0];
    console.log(`✓ Selected target question: "${targetQuestion.title}" (ID: ${targetQuestion.id})`);
    
    // Toggle bookmark ON
    console.log('Step B: Toggling bookmark ON...');
    const toggleOnRes = await makeRequest('POST', '/bookmarks/toggle', { questionId: targetQuestion.id }, {
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);
    if (toggleOnRes.status !== 200) throw new Error(`Toggle failed: ${toggleOnRes.status}`);
    if (toggleOnRes.data.data.bookmarked !== true) throw new Error('Expected bookmarked = true');
    console.log('✓ Bookmark toggled ON successfully.');
    
    // Verify bookmarked filter returns only the bookmarked question
    console.log('Step C: Fetching question list with bookmarked=true filter...');
    const filterRes = await makeRequest('GET', '/questions?bookmarked=true', null, {}, cookieJar);
    if (filterRes.status !== 200) throw new Error('Filter query failed');
    const filteredQuestions = filterRes.data.data.questions;
    
    if (filteredQuestions.length === 0) throw new Error('Expected at least 1 bookmarked question');
    if (!filteredQuestions.every(q => q.isBookmarked === true)) {
      throw new Error('Some questions in filtered list do not show isBookmarked = true');
    }
    console.log(`✓ Filtered query successfully returned ${filteredQuestions.length} bookmarked question(s).`);
    
    // Fetch specific question details and check isBookmarked flag
    console.log('Step D: Fetching individual question details...');
    const detailRes = await makeRequest('GET', `/questions/${targetQuestion.id}`, null, {}, cookieJar);
    if (detailRes.status !== 200) throw new Error('Details fetch failed');
    if (detailRes.data.data.question.isBookmarked !== true) {
      throw new Error('Question details response is missing isBookmarked = true flag');
    }
    console.log('✓ Details view returns correct isBookmarked = true flag.');

    // Toggle bookmark OFF
    console.log('Step E: Toggling bookmark OFF...');
    const toggleOffRes = await makeRequest('POST', '/bookmarks/toggle', { questionId: targetQuestion.id }, {
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);
    if (toggleOffRes.status !== 200) throw new Error('Toggle OFF failed');
    if (toggleOffRes.data.data.bookmarked !== false) throw new Error('Expected bookmarked = false');
    console.log('✓ Bookmark toggled OFF successfully.');

    results['bookmarks'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    results['bookmarks'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 2: Quick Start Mock Practice
  // ----------------------------------------------------
  try {
    console.log('\n--- 2. Testing Quick Start Practice Run Creation ---');
    
    // Trigger Quick Start mock creation
    console.log('Step A: Triggering quick-start practice run...');
    const quickStartRes = await makeRequest('POST', '/interviews/quick-start', {}, {
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);
    
    if (quickStartRes.status !== 201) {
      throw new Error(`Quick start endpoint failed with status ${quickStartRes.status}: ${JSON.stringify(quickStartRes.data)}`);
    }
    
    const session = quickStartRes.data.data.session;
    if (session.questionCount !== 1) {
      throw new Error(`Expected exactly 1 question, but session has: ${session.questionCount}`);
    }
    if (session.status !== 'IN_PROGRESS') {
      throw new Error(`Expected session status to be IN_PROGRESS, got: ${session.status}`);
    }
    console.log(`✓ Quick Start session created: "${session.title}" (ID: ${session.id})`);
    
    results['quick_start'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    results['quick_start'] = 'FAIL';
  }

  // ----------------------------------------------------
  // TEST 3: Notifications
  // ----------------------------------------------------
  try {
    console.log('\n--- 3. Testing Notification Center & Alerting Loops ---');
    
    // Manually write an completed evaluation notification into DB
    console.log('Step A: Writing a mock notification in database...');
    const notif = await prisma.notification.create({
      data: {
        userId,
        title: 'Mock Test Completed',
        message: 'Your evaluation is ready.',
        type: 'EVALUATION_COMPLETED',
        link: '/interviews/workspace/some-session-id'
      }
    });
    console.log(`✓ Mock notification created in DB (ID: ${notif.id})`);
    
    // Fetch notifications list via API
    console.log('Step B: Fetching notifications list from API...');
    const listRes = await makeRequest('GET', '/notifications', null, {}, cookieJar);
    if (listRes.status !== 200) throw new Error(`Notifications list API failed: ${listRes.status}`);
    
    const notificationsList = listRes.data.data.notifications;
    const testNotif = notificationsList.find(n => n.id === notif.id);
    if (!testNotif) throw new Error('Mock notification was not returned by the API');
    if (testNotif.isRead !== false) throw new Error('Notification should default to unread');
    console.log(`✓ Notifications list returned correct mock item (isRead: false, link: "${testNotif.link}").`);
    
    // Mark as read
    console.log('Step C: Marking notification as read...');
    const readRes = await makeRequest('PATCH', `/notifications/${notif.id}/read`, {}, {
      'x-xsrf-token': cookieJar['XSRF-TOKEN']
    }, cookieJar);
    if (readRes.status !== 200) throw new Error(`Mark read API failed: ${readRes.status}`);
    if (readRes.data.data.notification.isRead !== true) {
      throw new Error('Notification isRead was not updated to true');
    }
    console.log('✓ Notification successfully marked as read.');
    
    results['notifications'] = 'PASS';
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    results['notifications'] = 'FAIL';
  }

  // Clean up test user
  try {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  } catch (e) {}
  await prisma.$disconnect();

  console.log('\n====================================================');
  console.log('🏁 Version 1.1 UX Upgrade Integration Test Summary:');
  console.log('====================================================');
  let overallPass = true;
  Object.entries(results).forEach(([test, status]) => {
    console.log(`${status === 'PASS' ? '🟢' : '🔴'} ${test}: ${status}`);
    if (status !== 'PASS') overallPass = false;
  });
  console.log('====================================================');
  
  if (overallPass) {
    console.log('🎉 ALL UX INTEGRATION TESTS PASSED SUCCESSFULLY!');
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
