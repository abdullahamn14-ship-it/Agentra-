const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Agent = require('./src/models/Agent');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const EMAIL_TO_VERIFY = 'alamjabbar571@gmail.com';

async function verifyAgent() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGO_URI);

        console.log(`Searching for agent with email: ${EMAIL_TO_VERIFY}`);
        const agent = await Agent.findOne({ email: EMAIL_TO_VERIFY });

        if (!agent) {
            console.error('Agent not found. Please make sure you have registered with this email.');
            process.exit(1);
        }

        agent.isVerified = true;
        await agent.save();

        console.log('\x1b[32m%s\x1b[0m', 'SUCCESS: Agent has been verified. You can now log in!');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verifyAgent();
