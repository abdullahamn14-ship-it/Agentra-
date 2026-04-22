const http = require('http');

const data = JSON.stringify({
  fullName: 'Test User ' + Date.now(),
  email: 'test' + Date.now() + '@example.com',
  password: 'password123',
  phone: '1234567890'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/user/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response Body:', body);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
