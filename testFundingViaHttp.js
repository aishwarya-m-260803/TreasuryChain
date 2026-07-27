const http = require('http');

const data = JSON.stringify({
  organization: 'finance',
  username: 'finance_admin',
  password: 'Finance@123'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const token = JSON.parse(body).data.token;
    
    const fundingData = JSON.stringify({
        amount: 5000,
        organization: "FinanceMSP",
        source: "Gov Grant",
        referenceNumber: "REF-" + Date.now(),
        reason: "Q3 Budget",
        description: "For Q3 expenses"
    });

    const expReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/treasury/funding',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': fundingData.length, 'Authorization': `Bearer ${token}` }
    }, expRes => {
      let rBody = '';
      expRes.on('data', d => rBody += d);
      expRes.on('end', () => console.log('Funding Proposal Result:', expRes.statusCode, rBody));
    });
    expReq.write(fundingData);
    expReq.end();
  });
});

req.write(data);
req.end();
