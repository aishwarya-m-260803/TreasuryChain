const http = require('http');

const data = JSON.stringify({
  organization: 'management',
  username: 'management_admin',
  password: 'Management@123'
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
    
    const histReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/treasury/proposals/P001/history',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, histRes => {
      let rBody = '';
      histRes.on('data', d => rBody += d);
      histRes.on('end', () => console.log('History:', rBody));
    });
    histReq.end();
  });
});

req.write(data);
req.end();
