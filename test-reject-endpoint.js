// Test script to verify reject agent endpoint
const https = require('https');

const agentId = 'REPLACE_WITH_ACTUAL_AGENT_ID'; // Get this from your database
const token = 'REPLACE_WITH_OWNER_TOKEN'; // Get this from admin login

const options = {
    hostname: 'agentra-backend.vercel.app',
    port: 443,
    path: `/api/owner/agents/${agentId}/reject`,
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
    }
};

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.end();
