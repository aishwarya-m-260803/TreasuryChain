const http = require('http');
const app = require('./backend/src/app');

const server = http.createServer(app);
server.listen(3002, () => {
    console.log("Server running on 3002");
    
    // Test POST /api/treasury/funding
    const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/treasury/funding',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, res => {
        console.log("POST /api/treasury/funding -> Status:", res.statusCode);
        res.on('data', d => console.log(d.toString()));
        res.on('end', () => process.exit(0));
    });
    
    req.write(JSON.stringify({}));
    req.end();
});
