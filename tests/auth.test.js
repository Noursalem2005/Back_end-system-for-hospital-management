const axios = require('axios');

const API_URL = 'http://localhost:3000/api/auth';
const testCases = [
  {
    description: "Valid login",
    credentials: {
      email: "admin@hospital.com",
      password: "Admin@123" // Use the correct password
    }
  },
  {
    description: "Wrong password",
    credentials: {
      email: "admin@hospital.com",
      password: "wrongpassword"
    }
  }
];

async function testLogin(credentials, attempt) {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    console.log(`✅ Login successful (Attempt ${attempt}):`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ Login failed (Attempt ${attempt}):`, error.response?.data?.message || error.message);
    return null;
  }
}

async function runTests() {
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