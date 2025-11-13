Blog Frontend (Next.js + TypeScript)

A minimal Next.js frontend for the Blog backend. Implements login/registration, posts list with pagination, post details, and create/edit/delete for authenticated users. Uses Redux for auth state and Chakra UI for styling. The app has been migrated to TypeScript.

Requirements satisfied
- State Management (Redux): stores access/refresh tokens and user (decoded from JWT)
- Pages: Login, Register, Blog List, Post Detail, Create/Edit (only if logged in)
- Logout functionality
- Persist login state with localStorage
- Access control in UI (hide create/edit/delete if not authenticated or not the author)
- Error toasts/messages
- Bonus: SSR for posts list page (index)

Run
1. Install deps
   - cd frontend
   - npm install
2. Start dev server
   - npm run dev
3. Open http://localhost:3000

Config
- Copy env template: `cp frontend/.env.example frontend/.env`
- Backend API base URL via env: NEXT_PUBLIC_API_BASE (default http://localhost:8000)

TypeScript
- Source files are in .ts/.tsx under pages/, lib/, and src/components/.
- tsconfig.json is provided; Next.js handles type-checking during build/dev.

Date/time rendering
- Timestamps are displayed in the user's local timezone on the client. To avoid hydration mismatches, the server renders a UTC placeholder which is replaced on the client after hydration via a Time component.

Endpoints used:
- POST /register/
- POST /login/
- GET /posts/?page=1&page_size=10
- GET /posts/:id
- POST /posts/
- PUT /posts/:id
- DELETE /posts/:id
- POST /api/auth/refresh (not automatically used here, but wired for future)
