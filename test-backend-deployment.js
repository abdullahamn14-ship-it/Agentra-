// Test script to verify the backend deployment
// Run this after Vercel deployment completes

const testBookingEndpoint = async () => {
    try {
        // This should fail with a proper error message now
        const response = await fetch('https://agentra-backend.vercel.app/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': 'test-token' // Invalid token for testing
            },
            body: JSON.stringify({
                packageId: 'test123',
                seats: 1,
                travelDate: '2026-03-01',
                paymentMethod: 'CARD'
            })
        });

        const data = await response.json();

        console.log('Status Code:', response.status);
        console.log('Response:', data);

        // If the fix is deployed, you should see a structured error response
        // with a 'message' field instead of a generic error
        if (data.message) {
            console.log('✅ Backend fix is deployed! Error message:', data.message);
        } else {
            console.log('⚠️ Old backend version still running');
        }
    } catch (error) {
        console.error('❌ Error testing endpoint:', error);
    }
};

testBookingEndpoint();
