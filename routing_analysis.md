Trace the complete request flow:
Frontend Form (CreateFundingModal.jsx) calls `createFundingProposal(payload)`
→ API service (useTreasuryApi.js) calls `api.post('/treasury/funding', data)`
→ Axios request (api.js) resolves `baseURL` + url to `POST http://localhost:3000/api/treasury/funding`
→ Router registration (app.js) mounts `routes/index.js` at `/`
→ Router registration (routes/index.js) mounts `treasuryRoutes.js` at `/api/treasury`
→ Express route (treasuryRoutes.js) matches `router.post('/funding')`
→ Controller (`treasuryController.createFundingProposal`) processes the request

Identify:
- The exact URL being called: `http://localhost:3000/api/treasury/funding`
- The HTTP method: `POST`
- Whether the backend exposes that route: Yes, `treasuryRoutes.js` correctly exposes `router.post('/funding')`.
- Whether the router is registered in server.js: No, the router is registered in `app.js` (which is required by `server.js`). This is the correct Express architecture.

Root cause:
There is no routing issue in the current source code. The exact URL, method, and route definitions all perfectly match. The `HTTP 404` error is likely caused by the Node server not being restarted after the previous agent added the new `POST /funding` routes to `treasuryRoutes.js` (if the server isn't running with `nodemon`).

Files modified:
None.

Correct endpoint:
`POST /api/treasury/funding`
