const http = require('http');
const app = require('./backend/src/app');
const server = http.createServer(app);

server.listen(3001, () => {
    console.log('Server started on 3001');

    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/treasury/funding',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            server.close();
            process.exit(0);
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        server.close();
        process.exit(1);
    });

    req.write(JSON.stringify({
        amount: 100,
        organization: "FinanceOrg",
        source: "Budget",
        referenceNumber: "REF-123",
        reason: "Test",
        description: "Test description"
    }));
    req.end();
});
