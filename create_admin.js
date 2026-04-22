require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Owner = require('./src/models/Owner');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@agentra.com';
        const password = 'admin123'; // Real password to be hashed
        const existingAdmin = await Owner.findOne({ email });

        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await Owner.create({
            fullName: 'Super Admin',
            email,
            password: hashedPassword,
            role: 'OWNER'
        });

        console.log('Admin created successfully:', admin);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
