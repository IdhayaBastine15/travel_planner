# Travel Planner

A full-stack collaborative travel planning app. Plan trips, manage itineraries, track budgets, invite collaborators, and explore destinations on a map — all in real time.

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, Chart.js, react-leaflet
- **Backend:** Node.js, Express, PostgreSQL, Socket.io
- **Auth:** JWT (access + refresh tokens)

## Features

- User authentication (register, login, JWT refresh)
- Trips CRUD with status tracking
- Day-by-day itinerary with activities
- Budget tracking with doughnut chart
- Real-time collaboration via Socket.io
- Invite collaborators by email with role-based access (owner / editor / viewer)
- Interactive map with Geoapify tiles
- Favorite places
- PDF export
- Activity comments

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/travel-planner.git
   cd travel-planner
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**

   Copy the example files and fill in your values:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

   - `DATABASE_URL` — your PostgreSQL connection string
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate strong random strings
   - `VITE_GEOAPIFY_API_KEY` — free API key from [geoapify.com](https://www.geoapify.com/)

4. **Set up the database**
   ```bash
   psql -U postgres -c "CREATE DATABASE travel_planner;"
   psql -U postgres -d travel_planner -f backend/config/schema.sql
   ```

5. **Run the app**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## Project Structure

```
travel-planner/
├── backend/
│   ├── config/         # DB connection & schema
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, validation, error handling
│   ├── routes/         # Express routers
│   ├── sockets/        # Socket.io events
│   ├── utils/          # JWT helpers
│   └── server.js
└── frontend/
    └── src/
        ├── api/        # Axios API calls
        ├── components/ # Reusable UI components
        ├── contexts/   # React contexts (Auth, Trip)
        ├── hooks/      # Custom hooks
        ├── pages/      # Page components
        └── utils/      # Formatters & helpers
```
