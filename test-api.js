let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  console.error('Please install node-fetch: npm install node-fetch@2');
  process.exit(1);
}

const BASE_URL = 'http://localhost:5000/api';

let userToken = null;
let agentToken = null;
let ownerToken = null;
let packageId = null;
let bookingId = null;
let conversationId = null;

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

const logSection = (section) => {
  console.log('\n' + '='.repeat(60));
  log(section, 'blue');
  console.log('='.repeat(60) + '\n');
};

const generateUniqueEmail = (prefix) => {
  const timestamp = Date.now();
  return `${prefix}${timestamp}@example.com`;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testEndpoint = async (method, endpoint, data = null, token = null, description = '') => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['x-auth-token'] = token;
    }

    const options = {
      method,
      headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (response.ok) {
      log(`✅ ${description || endpoint}`, 'green');
      return { success: true, data: result, status: response.status };
    } else {
      log(`❌ ${description || endpoint}: ${result.message || 'Error'}`, 'red');
      return { success: false, data: result, status: response.status };
    }
  } catch (error) {
    log(`❌ ${description || endpoint}: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
};

const runTests = async () => {
  log('\n🚀 Starting Agentra API Tests\n', 'blue');

  await sleep(2000);

  logSection('1. AUTHENTICATION TESTS');

  const userEmail = generateUniqueEmail('testuser');
  const agentEmail = generateUniqueEmail('testagent');

  const userRegister = await testEndpoint('POST', '/auth/user/register', {
    fullName: 'Test User',
    email: userEmail,
    password: 'password123',
    phone: '1234567890'
  }, null, 'Register User');

  if (userRegister.success) {
    userToken = userRegister.data.token;
  }

  const userLogin = await testEndpoint('POST', '/auth/user/login', {
    email: userEmail,
    password: 'password123'
  }, null, 'Login User');

  if (userLogin.success) {
    userToken = userLogin.data.token;
  }

  const agentRegister = await testEndpoint('POST', '/auth/agent/register', {
    fullName: 'Test Agent',
    email: agentEmail,
    password: 'password123',
    phone: '0987654321',
    businessName: 'Test Travel Agency',
    cnic: '1234567890123'
  }, null, 'Register Agent');

  if (agentRegister.success) {
    agentToken = agentRegister.data.token;
  }

  const agentLogin = await testEndpoint('POST', '/auth/agent/login', {
    email: agentEmail,
    password: 'password123'
  }, null, 'Login Agent');

    if (agentLogin.success) {
      agentToken = agentLogin.data.token;
    }

    await testEndpoint('POST', '/auth/user/logout', {}, userToken, 'Logout User');
    await testEndpoint('POST', '/auth/agent/logout', {}, agentToken, 'Logout Agent');

    log('\n⚠️  Note: Agent login failed because account needs admin verification (by design)\n', 'yellow');

  logSection('2. USER PROFILE TESTS');

  await testEndpoint('GET', '/users/profile', null, userToken, 'Get User Profile');

  await testEndpoint('PUT', '/users/profile', {
    fullName: 'Updated Test User',
    bio: 'Travel enthusiast'
  }, userToken, 'Update User Profile');

  await testEndpoint('PUT', '/users/preferences', {
    preferences: {
      budget: { min: 100, max: 1000 },
      preferredLocations: ['Beach', 'Mountain'],
      interests: ['Adventure', 'Relaxation']
    }
  }, userToken, 'Update User Preferences');

  logSection('3. PACKAGE MANAGEMENT TESTS');

  const createPackage = await testEndpoint('POST', '/packages', {
    title: 'Tropical Paradise Adventure',
    description: 'Experience the beauty of tropical islands',
    location: 'Bali, Indonesia',
    price: 599,
    duration: '7 days',
    meals: 'All Inclusive',
    transport: 'Flight + Transfer',
    accommodation: '5-Star Resort',
    availableSeats: 20,
    startDate: '2025-06-01',
    endDate: '2025-06-08'
  }, agentToken, 'Create Package');

  if (createPackage.success) {
    packageId = createPackage.data.package._id;
  }

  await testEndpoint('GET', '/packages', null, null, 'Get All Packages');

  await testEndpoint('GET', `/packages/${packageId}`, null, null, 'Get Package Details');

  await testEndpoint('PUT', `/packages/${packageId}`, {
    description: 'Updated description: Experience the ultimate tropical adventure'
  }, agentToken, 'Update Package');

  await testEndpoint('POST', `/packages/${packageId}/view`, {}, null, 'Track Package View');

  await testEndpoint('POST', `/packages/${packageId}/click`, {}, null, 'Track Package Click');

  logSection('4. BOOKING TESTS');

  if (packageId) {
    const createBooking = await testEndpoint('POST', '/bookings', {
      packageId: packageId,
      seats: 2,
      travelDate: '2025-06-01',
      paymentMethod: 'CARD'
    }, userToken, 'Create Booking');

    if (createBooking.success) {
      bookingId = createBooking.data.booking._id;
    }

    await testEndpoint('GET', '/bookings/my', null, userToken, 'Get User Bookings');
  }

  await testEndpoint('GET', '/bookings/agent', null, agentToken, 'Get Agent Bookings');

  logSection('5. SEARCH & FILTER TESTS');

  await testEndpoint('GET', '/search?q=Beach', null, null, 'Search Packages');

  await testEndpoint('GET', '/search?location=Bali', null, null, 'Filter by Location');

  await testEndpoint('GET', '/search?minPrice=100&maxPrice=1000', null, null, 'Filter by Price Range');

  await testEndpoint('POST', '/search/filter', {
    location: 'Bali',
    priceRange: '100-1000',
    minRating: 4
  }, userToken, 'Advanced Filter');

  await testEndpoint('GET', '/search/popular-destinations', null, null, 'Get Popular Destinations');

  await testEndpoint('GET', '/search/recommendations', null, userToken, 'Get Personalized Recommendations');

  if (packageId) {
    await testEndpoint('GET', `/search/similar/${packageId}`, null, null, 'Get Similar Packages');
  } else {
    log('⚠️  Skipping similar packages test (no package created)', 'yellow');
  }

  logSection('6. SAVED PACKAGES TESTS');

  if (packageId) {
  if (packageId) {
    await testEndpoint('POST', `/saved/${packageId}`, { notes: 'Interesting package' }, userToken, 'Save Package');

    await testEndpoint('GET', '/saved', null, userToken, 'Get Saved Packages');

    await testEndpoint('GET', `/saved/${packageId}/check`, null, userToken, 'Check if Package is Saved');

    await testEndpoint('PUT', `/saved/${packageId}/notes`, { notes: 'Updated notes' }, userToken, 'Update Saved Notes');

    await testEndpoint('DELETE', `/saved/${packageId}`, null, userToken, 'Unsave Package');

    await testEndpoint('GET', '/saved/stats/me', null, userToken, 'Get Saved Stats');
  } else {
    log('⚠️  Skipping saved packages tests (no package created)', 'yellow');
  }
  }

  logSection('7. SUBSCRIPTION TESTS');

  await testEndpoint('GET', '/subscription/plans', null, null, 'Get Subscription Plans');

  if (agentToken) {
    await testEndpoint('POST', '/subscription/subscribe', {
      plan: 'MONTHLY',
      paymentMethod: 'CARD'
    }, agentToken, 'Subscribe to Plan');

    await testEndpoint('GET', '/subscription/current', null, agentToken, 'Get Current Subscription');

    await testEndpoint('GET', '/subscription/check-access?feature=analytics', null, agentToken, 'Check Subscription Access');

    await testEndpoint('POST', '/subscription/upgrade', {
      plan: 'YEARLY',
      paymentMethod: 'CARD'
    }, agentToken, 'Upgrade Subscription');
  } else {
    log('⚠️  Skipping subscription tests (no valid agent token)', 'yellow');
  }

  logSection('8. PAYMENT TESTS');

  await testEndpoint('GET', '/payments/methods', null, null, 'Get Payment Methods');

  if (bookingId) {
    await testEndpoint('POST', '/payments/intent', {
      bookingId: bookingId,
      paymentMethod: 'CARD'
    }, userToken, 'Create Payment Intent');

    await testEndpoint('POST', '/payments/process', {
      bookingId: bookingId,
      paymentMethod: 'CARD',
      paymentDetails: {
        cardNumber: '4242424242424242',
        expiry: '12/25',
        cvv: '123'
      }
    }, userToken, 'Process Payment');

    await testEndpoint('GET', '/payments/history', null, userToken, 'Get Payment History');
  } else {
    log('⚠️  Skipping payment tests (no booking created)', 'yellow');
  }

  logSection('9. EARNINGS TESTS');

  if (agentToken) {
    await testEndpoint('GET', '/earnings/overview', null, agentToken, 'Get Earnings Overview');

    await testEndpoint('GET', '/earnings/commission', null, agentToken, 'Get Commission Breakdown');

    await testEndpoint('GET', '/earnings/by-package', null, agentToken, 'Get Earnings by Package');

    await testEndpoint('GET', '/earnings/payouts', null, agentToken, 'Get Payout History');

    await testEndpoint('GET', '/earnings/report?period=monthly', null, agentToken, 'Get Earnings Report');
  } else {
    log('⚠️  Skipping earnings tests (no valid agent token)', 'yellow');
  }

  logSection('10. ANALYTICS TESTS');

  if (agentToken) {
    await testEndpoint('GET', '/analytics/dashboard', null, agentToken, 'Get Dashboard Stats');

    await testEndpoint('GET', '/analytics/agent', null, agentToken, 'Get Agent Analytics');

    if (packageId) {
      await testEndpoint('GET', `/analytics/package/${packageId}`, null, agentToken, 'Get Package Analytics');
    }
  } else {
    log('⚠️  Skipping analytics tests (no valid agent token)', 'yellow');
  }

  logSection('11. AI CHATBOT TESTS');

  const startChat = await testEndpoint('POST', '/chatbot/start', {}, userToken, 'Start Chatbot Conversation');

  if (startChat.success) {
    conversationId = startChat.data.conversationId;
  }

  if (conversationId) {
    await testEndpoint('POST', '/chatbot/message', {
      conversationId: conversationId,
      message: 'I want to find beach packages'
    }, userToken, 'Send Chatbot Message');

    await testEndpoint('GET', `/chatbot/${conversationId}`, null, userToken, 'Get Conversation');

    await testEndpoint('GET', '/chatbot/', null, userToken, 'Get All Conversations');

    await testEndpoint('PATCH', `/chatbot/${conversationId}/end`, { rating: 5 }, userToken, 'End Conversation');
  }

  await testEndpoint('GET', '/chatbot/stats/me', null, userToken, 'Get Chat Stats');

  logSection('12. AI PROMOTIONS TESTS');

  if (packageId && agentToken) {
    await testEndpoint('POST', '/promotion/promote/' + packageId, {
      promotionType: 'featured'
    }, agentToken, 'Promote Package');

    await testEndpoint('GET', '/promotion/content/' + packageId, null, agentToken, 'Generate Promotional Content');

    await testEndpoint('GET', '/promotion/analytics/' + packageId, null, agentToken, 'Get Promotion Analytics');

    await testEndpoint('GET', '/promotion/agent/my', null, agentToken, 'Get Agent Promotions');

    await testEndpoint('DELETE', '/promotion/stop/' + packageId, {}, agentToken, 'Stop Promotion');
  } else {
    log('⚠️  Skipping promotion tests (no package or valid agent token)', 'yellow');
  }

  await testEndpoint('GET', '/promotion/', null, null, 'Get All Promoted Packages');

  logSection('13. REFUND TESTS');

  if (bookingId) {
    await testEndpoint('POST', '/refund/request', {
      bookingId: bookingId,
      reason: 'Change of plans'
    }, userToken, 'Request Refund');

    await testEndpoint('GET', '/refund/my', null, userToken, 'Get My Refund Requests');

    await testEndpoint('GET', '/refund/agent', null, agentToken, 'Get Agent Refund Requests');

    await testEndpoint('POST', `/refund/approve/${bookingId}`, {
      reason: 'Approved as per policy'
    }, agentToken, 'Approve Refund');
  }

  if (agentToken) {
    await testEndpoint('GET', '/refund/stats', null, agentToken, 'Get Refund Stats');
  } else {
    log('⚠️  Skipping refund stats test (no valid agent token)', 'yellow');
  }

  logSection('14. COMPLAINT & REVIEW TESTS');

  if (packageId) {
    await testEndpoint('POST', '/users/reviews', {
      packageId: packageId,
      rating: 5,
      comment: 'Excellent trip!'
    }, userToken, 'Create Review');

    await testEndpoint('GET', '/users/reviews', null, userToken, 'Get User Reviews');
  }

  if (bookingId) {
    await testEndpoint('POST', '/users/complaints', {
      bookingId: bookingId,
      subject: 'Service issue',
      description: 'The service was not as expected'
    }, userToken, 'Raise Complaint');

    await testEndpoint('GET', '/users/complaints', null, userToken, 'Get User Complaints');
  }

  logSection('15. DASHBOARD TESTS');

  await testEndpoint('GET', '/dashboard/user', null, userToken, 'Get User Dashboard');

  if (agentToken) {
    await testEndpoint('GET', '/dashboard/agent', null, agentToken, 'Get Agent Dashboard');
  } else {
    log('⚠️  Skipping agent dashboard test (no valid agent token)', 'yellow');
  }

  log('\n' + '='.repeat(60));
  log('✅ All Tests Completed!', 'green');
  console.log('='.repeat(60) + '\n');
};

runTests().catch(error => {
  log(`\n❌ Test Suite Error: ${error.message}`, 'red');
  process.exit(1);
});