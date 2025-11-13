Blog Application (Django + Next.js)

This repo contains a simple blog with a Django backend and a Next.js frontend. It includes JWT-based authentication, posts CRUD with permissions, pagination, and a TypeScript React UI.

Quick start
1) Copy environment templates and adjust values as needed
   ```sh
   # Backend (Django)
   cp backend/.env.example backend/.env

   # Frontend (Next.js)
   cp frontend/.env.example frontend/.env
   ```

2) Start both services with Docker Compose
   ```sh 
      docker compose up --build
   ```

3) Open the apps
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

Sample requests
- Ready-to-run HTTP examples (REST Client / curl) live in:
  docs/sample_requests.http

Endpoints
- POST /register/
- POST /login/
- POST /api/auth/refresh
- GET /posts/?page=1&page_size=10
- GET /posts/:id
- POST /posts/ (auth required)
- PUT /posts/:id (author only)
- DELETE /posts/:id (author only)

Testing (backend)
- From the repo root (requires Python env):
  ```sh
    pip install -r backend/requirements.txt
    pytest -q
  ```
