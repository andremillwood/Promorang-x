const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const API_URL = 'http://localhost:3001/api/rewards/coupons';

const demoUserId = '00000000-0000-0000-0000-000000000001';
const token = jwt.sign(
    {
        userId: demoUserId,
        email: 'creator@demo.com',
        role: 'creator'
    },
    JWT_SECRET,
    { expiresIn: '1h' }
);

async function testRedemption(id, type) {
    console.log(`\nTesting ${type} redemption for ID: ${id}`);
    const response = await fetch(`${API_URL}/${id}/redeem`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.status === 200 && data.success) {
        console.log(`✅ ${type} redemption successful!`);
    } else {
        console.log(`❌ ${type} redemption failed.`);
    }
}

async function runTests() {
    // Test Marketplace Coupon (the one that was failing with 404)
    await testRedemption('b826fa97-35e0-4e25-a244-3cf0b3ba6ff4', 'Marketplace Coupon');

    // Test Assigned Coupon (existing functionality)
    await testRedemption('31000000-0000-0000-0000-000000000002', 'Assigned Coupon');
}

runTests().catch(console.error);
