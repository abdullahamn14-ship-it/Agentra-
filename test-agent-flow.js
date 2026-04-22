const fetch = require('node-fetch');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Agent = require('./src/models/Agent');

dotenv.config();

const BASE_URL = 'https://agentra-backend.vercel.app/api';
const MONGO_URI = process.env.MONGO_URI;

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

async function runAgentTest() {
    log('Starting Agent-Side Testing Flow...', 'blue');

    // 1. Database Connection (for manual verification)
    try {
        await mongoose.connect(MONGO_URI);
        log('Connected to Database for verification cleanup', 'green');
    } catch (err) {
        log(' DB Connection Error: ' + err.message, 'red');
        process.exit(1);
    }

    const testAgent = {
        fullName: "Test Agent " + Date.now(),
        email: `agent_${Date.now()}@test.com`,
        password: "password123",
        phone: "0300" + Math.floor(Math.random() * 10000000),
        businessName: "Test Travel Agency",
        cnic: "42101" + Math.floor(Math.random() * 10000000)
    };

    // 2. Register Agent
    log(`\nStep 1: Registering Agent: ${testAgent.email}`, 'yellow');
    const regRes = await fetch(`${BASE_URL}/auth/agent/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testAgent)
    });
    const regData = await regRes.json();

    if (regRes.ok) {
        log(' Agent Registered Successfully', 'green');
    } else {
        log(' Agent Registration Failed: ' + (regData.message || 'Unknown error'), 'red');
        process.exit(1);
    }

    // 3. Manual Verification (Bypass Admin)
    log('\nStep 2: Manually verifying agent in DB to allow login...', 'yellow');
    await Agent.findOneAndUpdate({ email: testAgent.email }, { isVerified: true });
    log(' Agent verified in database', 'green');

    // 4. Login Agent
    log('\nStep 3: Logging in as Agent...', 'yellow');
    const loginRes = await fetch(`${BASE_URL}/auth/agent/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testAgent.email,
            password: testAgent.password
        })
    });
    const loginData = await loginRes.json();

    if (loginRes.ok) {
        log(' Agent Logged In Successfully', 'green');
        var agentToken = loginData.token;
    } else {
        log(' Agent Login Failed: ' + (loginData.message || 'Unknown error'), 'red');
        process.exit(1);
    }

    // 5. Create a Travel Package
    log('\nStep 4: Creating a Travel Package...', 'yellow');
    const packageData = {
        title: "Dream Vacation 2024",
        description: "An amazing 5-day tour of the northern mountains.",
        location: "Skardu, Pakistan",
        price: 45000,
        duration: "5 Days",
        meals: "Breakfast & Dinner",
        transport: "Prado 4x4",
        accommodation: "Luxury Hotel",
        availableSeats: 15,
        startDate: "2024-06-01",
        endDate: "2024-06-05"
    };

    const packRes = await fetch(`${BASE_URL}/packages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': agentToken
        },
        body: JSON.stringify(packageData)
    });
    const packResult = await packRes.json();

    if (packRes.ok) {
        log(' Travel Package Created Successfully', 'green');
        log(`   Package ID: ${packResult.package._id}`);
    } else {
        log(' Package Creation Failed: ' + (packResult.message || 'Unknown error'), 'red');
    }

    // 6. Get Agent Dashboard
    log('\nStep 5: Fetching Agent Dashboard...', 'yellow');
    const dashRes = await fetch(`${BASE_URL}/dashboard/agent`, {
        headers: { 'x-auth-token': agentToken }
    });
    const dashData = await dashRes.json();

    if (dashRes.ok) {
        log(' Agent Dashboard Fetched Successfully', 'green');
        // console.log(JSON.stringify(dashData, null, 2));
    } else {
        log(' Dashboard Fetch Failed: ' + (dashData.message || 'Unknown error'), 'red');
    }

    log('\n Agent-side testing flow completed!', 'blue');

    await mongoose.disconnect();
    process.exit(0);
}

runAgentTest().catch(err => {
    console.error(err);
    process.exit(1);
});
