const axios = require('axios');

const API_URL = 'http://localhost:3000/api/auth';

// Avoid hardcoded credentials in scripts. Read from env when available.
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '[REDACTED]';
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || '[REDACTED]';

const testCases = [
  {
    description: "Valid login",
    credentials: {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD
    }
  },
  {
    description: "Wrong password",
    credentials: {
      email: TEST_ADMIN_EMAIL,
      password: process.env.TEST_WRONG_PASSWORD || '[REDACTED]'
    }
  }
];

async function testLogin(credentials, attempt) {
  try {
    console.log(`\nTrying to login with: ${credentials.email}`);
    const response = await axios.post(`${API_URL}/login`, credentials);
    console.log(`✅ Login successful (Attempt ${attempt}):`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ Login failed (Attempt ${attempt}):`, error.response?.data?.message || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🔍 Starting login tests...\n');
  
  // Test 1: Successful login
  console.log("\n🔍 Testing valid credentials:");
  await testLogin(testCases[0].credentials, 1);
  
  // Test 2: Multiple failed attempts
  console.log("\n🔍 Testing multiple failed attempts:");
  for (let i = 1; i <= 6; i++) {
    console.log(`\nAttempt ${i} of 6:`);
    await testLogin(testCases[1].credentials, i);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between attempts
  }
  
  // Test 3: Try valid login after lockout
  console.log("\n🔍 Testing valid login after lockout:");
  await testLogin(testCases[0].credentials, 1);
}

runTests();