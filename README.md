# Travel Planner

A full-stack collaborative travel planning web app. Plan trips, build day-by-day itineraries, track budgets, invite collaborators, and explore destinations on an interactive map — all with real-time synchronization.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)

---

## Features

- **Authentication** — Register, login, JWT access + refresh token rotation
- **Trip Management** — Create, edit, duplicate, and delete trips with status tracking (draft / active / completed)
- **Day-by-Day Itinerary** — Organize activities with time ranges, location data, categories, and costs
- **Budget Tracking** — Log expenses by category, visualize spending with a doughnut chart
- **Real-Time Collaboration** — Invite collaborators by email with role-based access (owner / editor / viewer) and live presence updates via Socket.io
- **Interactive Map** — View activities and saved places on a Leaflet map powered by Geoapify
- **Favorite Places** — Save frequently visited locations to a personal collection
- **Activity Comments** — Discuss and annotate activities with threaded comments
- **PDF Export** — Generate and download trip itineraries and budget summaries

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, react-leaflet, Chart.js, Axios |
| Backend | Node.js, Express, PostgreSQL, Socket.io |
| Auth | JWT (15-min access tokens, 7-day refresh tokens), bcryptjs |
| Validation | Joi |
| Rate Limiting | express-rate-limit |
| PDF Export | jsPDF, html2canvas |
| Maps | Leaflet + Geoapify API |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A free [Geoapify API key](https://www.geoapify.com/)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/travel-planner.git
cd travel-planner
```

### 2. Install dependencies

```bash
npm run install:all
```

This installs dependencies for the root, backend, and frontend in one step.

### 3. Configure environment variables

**Backend** — create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/travel_planner
JWT_ACCESS_SECRET=your_strong_access_secret
JWT_REFRESH_SECRET=your_strong_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
```

### 4. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE travel_planner;"
psql -U postgres -d travel_planner -f backend/config/schema.sql
```

### 5. Run the app

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run dev:backend` | Start backend only (nodemon) |
| `npm run dev:frontend` | Start frontend only (Vite) |
| `npm run install:all` | Install all dependencies (root + backend + frontend) |
| `npm --prefix frontend build` | Build frontend for production |
| `npm --prefix frontend preview` | Preview production build |
| `npm --prefix backend start` | Start backend in production mode |

---

## Project Structure

```
travel-planner/
├── backend/
│   ├── config/
│   │   ├── db.js           # PostgreSQL connection pool
│   │   └── schema.sql      # Database schema & indexes
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, validation, error handling
│   ├── routes/             # Express routers
│   ├── sockets/
│   │   └── tripSocket.js   # Real-time Socket.io events
│   ├── utils/              # JWT helpers
│   └── server.js
└── frontend/
    └── src/
        ├── api/            # Axios API client calls
        ├── components/     # Reusable UI components
        │   ├── Auth/
        │   ├── Budget/
        │   ├── Collaboration/
        │   ├── Comments/
        │   ├── Itinerary/
        │   ├── Layout/
        │   ├── Map/
        │   └── Trips/
        ├── contexts/       # React Context (Auth, Trip)
        ├── hooks/          # Custom hooks (useAuth, useSocket)
        ├── pages/          # Page-level components
        └── utils/          # Formatters & helpers
```

---

## API Overview

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout` |
| Trips | `GET/POST /api/trips`, `GET/PUT/DELETE /api/trips/:id`, `POST /api/trips/:id/duplicate` |
| Itinerary | `GET /api/itinerary/:tripId`, `GET/POST /api/itinerary/:tripId/days` |
| Activities | `POST /api/activities`, `PUT/DELETE /api/activities/:id` |
| Expenses | `GET/POST /api/expenses/:tripId`, `DELETE /api/expenses/:id` |
| Collaborators | `GET/POST /api/collaborations/:tripId`, `PUT/DELETE /api/collaborations/:id` |
| Favorites | `GET/POST /api/favorites`, `DELETE /api/favorites/:id` |
| Comments | `GET/POST /api/comments/:activityId`, `DELETE /api/comments/:id` |

Rate limits: **200 req / 15 min** general, **20 req / 15 min** on auth endpoints.

---

## Real-Time Events (Socket.io)

Clients join a trip-specific namespace. Events emitted:

| Event | Description |
|-------|-------------|
| `join_trip` / `leave_trip` | User enters or leaves a trip room |
| `activity_added` / `activity_updated` / `activity_deleted` | Activity changes broadcast to all collaborators |
| `expense_logged` | New expense synced in real time |
| `new_comment` | Comment posted on an activity |
| `user_presence` | Active users list for a trip |
| `collaborator_joined` | New collaborator accepted invite |

---

## Database Schema

10 tables with UUID primary keys, proper foreign keys, cascade deletion, and indexed columns for performance:

`users` · `trips` · `collaborations` · `itineraries` · `itinerary_days` · `activities` · `expenses` · `favorite_places` · `comments` · `refresh_tokens`

---

## License

MIT
