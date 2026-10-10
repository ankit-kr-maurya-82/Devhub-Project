# DevHub frontend and backend API

## Local development

1. Configure `backend/.env` with the backend values from `backend/.env.example` and a development MongoDB URI.
2. Start the API and Socket.IO server from `backend/` with `npm run dev` (port 4000 by default).
3. Copy `fronted/.env.example` to `fronted/.env` if you want an explicit frontend API setting. The default Vite proxy forwards `/api` to port 4000.
4. Start the React app from `fronted/` with `npm run dev` (Vite port 5173 by default).

Authentication, account profiles, questions, answers, votes, comments, notifications, public room membership, and room messages use the backend API. There are no bundled sample accounts, posts, questions, messages, statistics, or submissions. Blog publishing, coding exercises, submissions, and administrative moderation stay unavailable until their backend APIs are implemented.

For a separately hosted frontend, set `VITE_API_URL` to the backend API root ending in `/api/v1` and set the backend `CLIENT_ORIGIN` to the frontend's exact origin. Use HTTPS and a same-site frontend/API deployment for the backend's current `SameSite=Lax` authentication cookie.
