# travel_planner

A full-stack trip planning app with real-time collaboration. You can build day-by-day itineraries, track a trip budget, invite other people to edit with you, and see activities on a map. Multiple users editing the same trip stay in sync via Socket.io.

Built with React + Vite on the frontend, Node.js + Express + PostgreSQL on the backend, and Socket.io for real-time updates. Auth is JWT with 15-minute access tokens and 7-day refresh token rotation.

---

## What it does

**Trip management** — create, edit, and duplicate trips with a status (draft / active / completed).

**Itinerary builder** — organize each trip into days, add activities with time ranges, categories, location data, and cost. Reorder and edit freely.

**Budget tracker** — log expenses by category, visualize spending in a doughnut chart. Budget summary exports to PDF.

**Real-time collaboration** — invite people by email, assign roles (owner / editor / viewer). Everyone editing the same trip sees changes live. Active users are shown with a presence indicator.

**Interactive map** — activities and saved places rendered on a Leaflet map using the Geoapify API.

**Favorite places** — save locations to a personal collection across trips.

**Activity comments** — leave threaded comments on individual activities.

**PDF export** — download the full itinerary and budget summary as a PDF.

---

## Stack

| | |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3, Framer Motion, react-leaflet, Chart.js, Axios |
| Backend | Node.js, Express, PostgreSQL 14 |
| Real-time | Socket.io 4 |
| Auth | JWT — 15-min access tokens, 7-day refresh tokens, bcryptjs |
| Validation | Joi |
| Maps | Leaflet + Geoapify API |
| PDF | jsPDF, html2canvas |
| Rate limiting | express-rate-limit |

---

## Setup

You'll need Node.js 18+, PostgreSQL 14+, and a free [Geoapify API key](https://www.geoapify.com).

```bash
git clone https://github.com/IdhayaBastine15/travel_planner.git
cd travel_planner
npm run install:all
```

**Backend** — create `backend/.env`:

```
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/travel_planner
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** — create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GEOAPIFY_API_KEY=your_geoapify_key
```

Set up the database:

```bash
psql -U postgres -c "CREATE DATABASE travel_planner;"
psql -U postgres -d travel_planner -f backend/config/schema.sql
```

Start both servers:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

---

## Project layout

```
travel_planner/
├── backend/
│   ├── config/
│   │   ├── db.js             → PostgreSQL connection pool
│   │   └── schema.sql        → database schema and indexes
│   ├── controllers/          → request handlers
│   ├── middleware/            → auth, validation, error handling
│   ├── routes/               → Express routers
│   ├── sockets/
│   │   └── tripSocket.js     → Socket.io event handlers
│   ├── utils/                → JWT helpers
│   └── server.js
└── frontend/
    └── src/
        ├── api/              → Axios API calls
        ├── components/       → Auth, Budget, Collaboration, Comments,
        │                       Itinerary, Layout, Map, Trips
        ├── contexts/         → Auth and Trip context providers
        ├── hooks/            → useAuth, useSocket
        ├── pages/            → page-level components
        └── utils/            → formatters and helpers
```

---

## API routes

| Resource | Methods |
|---|---|
| Auth | `POST /api/auth/register` `login` `refresh` `logout` |
| Trips | `GET POST /api/trips` · `GET PUT DELETE /api/trips/:id` · `POST /api/trips/:id/duplicate` |
| Itinerary | `GET /api/itinerary/:tripId` · `GET POST /api/itinerary/:tripId/days` |
| Activities | `POST /api/activities` · `PUT DELETE /api/activities/:id` |
| Expenses | `GET POST /api/expenses/:tripId` · `DELETE /api/expenses/:id` |
| Collaborators | `GET POST /api/collaborations/:tripId` · `PUT DELETE /api/collaborations/:id` |
| Favorites | `GET POST /api/favorites` · `DELETE /api/favorites/:id` |
| Comments | `GET POST /api/comments/:activityId` · `DELETE /api/comments/:id` |

Rate limits: 200 req / 15 min general, 20 req / 15 min on auth routes.

---

## Real-time events (Socket.io)

Clients join a room per trip. Events:

| Event | Trigger |
|---|---|
| `activity_added/updated/deleted` | Any activity change |
| `expense_logged` | New expense added |
| `new_comment` | Comment posted |
| `user_presence` | Active users in a trip |
| `collaborator_joined` | New collaborator accepted |

---

## Database

10 tables with UUID primary keys, foreign key constraints, cascade deletes, and indexed columns:

`users` · `trips` · `collaborations` · `itineraries` · `itinerary_days` · `activities` · `expenses` · `favorite_places` · `comments` · `refresh_tokens`

---

## Scripts

```bash
npm run dev               # start frontend and backend together
npm run dev:backend       # backend only (nodemon)
npm run dev:frontend      # frontend only (Vite)
npm run install:all       # install all dependencies
```
