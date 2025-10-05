// Simple test client to POST to the server API route for creating collections
// Usage: node scripts/test-create-collections.js

const payload = {
  eventId: process.env.TEST_EVENT_ID || 'test-event-123',
  eventName: process.env.TEST_EVENT_NAME || 'Test Event',
  sponsor: [
    { name: 'Acme', url: 'https://acme.example' }
  ],
  userId: process.env.TEST_USER_ID || 'user-abc'
};

const url = process.env.TEST_API_URL || 'http://localhost:3000/api/admin/create-collections';

(async () => {
  try {
    console.log('Posting to', url, 'payload:', payload);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response body:', data);
  } catch (err) {
    console.error('Error posting to API:', err);
    process.exit(1);
  }
})();
