require('dotenv').config({ path: './backend/.env' });
process.env.TEST_NETWORK_HOME = "/wsl.localhost/Ubuntu/home/aishwarya_m/hyperledger/fabric-samples/test-network";
const app = require('./backend/src/app');
const request = require('supertest');

async function check() {
    console.log("Registered routes in treasuryRoutes:");
    const treasuryRoutes = require('./backend/src/routes/treasuryRoutes');
    treasuryRoutes.stack.forEach(layer => {
        if (layer.route) {
            console.log(Object.keys(layer.route.methods)[0].toUpperCase(), layer.route.path);
        }
    });

    const res = await request(app).post('/api/treasury/funding').send({
        amount: 100,
        organization: "FinanceOrg",
        source: "Budget",
        referenceNumber: "REF-123",
        reason: "Test",
        description: "Test description"
    });
    console.log("POST /api/treasury/funding ->", res.status, res.body);
}

check().catch(console.error);
