require('dotenv').config({ path: '../backend/.env' });
const { findProfileByEmailOrCustomer } = require('./controllers/billingController');

async function testFindProfile() {
  const email = 'abdullahshahid10101@gmail.com';
  const customerId = 'cus_T6qCgUoE5pw9J3';
  const profile = await findProfileByEmailOrCustomer(email, customerId);
  console.log('Test find profile result:', profile);
}

testFindProfile();
