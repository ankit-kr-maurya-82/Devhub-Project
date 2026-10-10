# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# DevHub frontend and backend API

## Local development

1. Configure `backend/.env` with the backend values from `backend/.env.example` and a development MongoDB URI.
2. Start the API and Socket.IO server from `backend/` with `npm run dev` (port 4000 by default).
3. Copy `fronted/.env.example` to `fronted/.env` if you want an explicit frontend API setting. The default Vite proxy forwards `/api` to port 4000.
4. Start the React app from `fronted/` with `npm run dev` (Vite port 5173 by default).

Registration, login, logout, password reset, current account profile, question listing/creation/details, answers, votes, public room membership and room messages use the backend API. Authenticated requests use the HttpOnly token cookie. The community screen polls room messages every four seconds; browser Socket.IO subscriptions are not wired in this frontend yet. Blogs, coding exercises, submissions, dashboard sample stats, and admin moderation screens still use preview data because the backend does not currently expose corresponding APIs.

For a separately hosted frontend, set `VITE_API_URL` to the backend API root ending in `/api/v1` and set the backend `CLIENT_ORIGIN` to the frontend's exact origin. Use HTTPS and a same-site frontend/API deployment for the backend's current `SameSite=Lax` authentication cookie.
