const mongoose = require('mongoose');
const uri = 'mongodb+srv://khizaralam74_db_user:koXKFG5FG6gPJNTZ@cluster0.7b3wkfw.mongodb.net/agentra?retryWrites=true&w=majority&appName=Cluster0';

console.log('Testing connection to MongoDB Atlas...');
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Could not connect to MongoDB Atlas:', err.message);
        process.exit(1);
    });
