Server API and environment setup

This project includes a server API route used for admin operations (creating collections/attributes and sponsor documents) that must run server-side using the Node Appwrite SDK.

Files
- app/api/admin/create-collections/route.ts
  - Expects a POST JSON body: { eventId, eventName, sponsor, userId }
  - Uses `node-appwrite` and a server-only admin key to perform admin operations.

Required environment variables (local .env file or host environment)
- NEXT_PUBLIC_ENDPOINT  - Client Appwrite endpoint (public)
- NEXT_PUBLIC_PROJECTID - Client project id (public)
- NEXT_PUBLIC_APPURL - Client app URL (public)
- NEXT_PUBLIC_DATABASEID - Client database id (public)
- NEXT_PUBLIC_EVENT_COLLID - Client event collection id (public)
- NEXT_PUBLIC_EVENTBUCKET - Client event bucket id (public)
- NEXT_PUBLIC_REGDB - Client reg db id (public)
- NEXT_PUBLIC_SPODB - Client sponsor db id (public)

Server-only env (must NOT be exposed to client)
- APPWRITE_ADMIN_KEY - Appwrite service/admin API key with permissions to create collections/attributes and documents.

How to test the server API locally
1. Add environment variables to `.env` (use `.env.example` as reference). Make sure `APPWRITE_ADMIN_KEY` is set.
2. Install dependencies:
   npm install
3. Run dev server:
   npm run dev
4. Send a test POST to the route:
   - You can use curl or a small Node script. Example curl:

curl -X POST http://localhost:3000/api/admin/create-collections \
  -H "Content-Type: application/json" \
  -d '{"eventId":"test-event-123","eventName":"Test Event","sponsor":[{"name":"Acme","url":"https://acme.example"}],"userId":"user-abc"}'

- Expect JSON { success: true } on success or { success: false, error } on failure.

Security note
- Do not store admin keys in client-exposed env vars (NEXT_PUBLIC_...). Keep them server-only. Use hosting provider secrets for production.

If you want, I can add a tiny node script under `scripts/` to POST test payloads to the server route.
