try {
    console.log('Testing requires...');
    const app = require('./server.js');
    console.log('Server loaded successfully.');

    const authController = require('./src/controllers/auth.controller.js');
    console.log('Auth controller loaded successfully.');

    const authRoutes = require('./src/routes/auth.routes.js');
    console.log('Auth routes loaded successfully.');

    console.log('ALL SYNTAX CHECKS PASSED');
    process.exit(0);
} catch (error) {
    console.error('SYNTAX ERROR DETECTED:');
    console.error(error);
    process.exit(1);
}
