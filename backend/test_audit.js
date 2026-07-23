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
    
    const auditReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/treasury/audit-logs',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, auditRes => {
      let rBody = '';
      auditRes.on('data', d => rBody += d);
      auditRes.on('end', () => console.log('Audit Logs:', rBody));
    });
    auditReq.end();
  });
});

req.write(data);
req.end();
