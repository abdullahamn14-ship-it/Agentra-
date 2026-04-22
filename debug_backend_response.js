const fetch = require('node-fetch');

async function checkHealth() {
    const url = 'https://agentra-backend.vercel.app/api/auth/agent/login'; // or any endpoint
    console.log(`Checking URL: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com', password: 'test' })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log('Response body start:', text.substring(0, 500)); // Print first 500 chars
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

checkHealth();
