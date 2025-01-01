const authService = require('../services/authService');

async function testPasswordHashing() {
  try {
    console.log('Testing password hashing...');
    
    // Test password hashing
    const password = 'TestPass123!';
    const hashedPassword = await authService.hashPassword(password);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    
    // Test password verification
    const isMatch = await authService.comparePasswords(password, hashedPassword);
    console.log('Password verification:', isMatch ? 'Success' : 'Failed');
    
    // Test wrong password
    const wrongMatch = await authService.comparePasswords('WrongPass123!', hashedPassword);
    console.log('Wrong password verification:', wrongMatch ? 'Failed' : 'Success');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPasswordHashing(); 