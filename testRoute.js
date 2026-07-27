const request = require('supertest');
const app = require('./backend/src/app');

async function testRoutes() {
    const res = await request(app).post('/api/treasury/funding').send({
        amount: 100,
        organization: "FinanceOrg",
        source: "Budget",
        referenceNumber: "REF-123",
        reason: "Test",
        description: "Test description"
    });
    console.log("POST /api/treasury/funding -> Status:", res.status);
    console.log("Body:", res.body);
    
    // Check GET
    const resGet = await request(app).get('/api/treasury/funding');
    console.log("GET /api/treasury/funding -> Status:", resGet.status);
    
    // Check POST proposals
    const resPostProp = await request(app).post('/api/treasury/proposals').send({amount:100, purpose:"test"});
    console.log("POST /api/treasury/proposals -> Status:", resPostProp.status);
}

testRoutes().catch(console.error);
