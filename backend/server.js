require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const itineraryRoutes = require('./routes/itinerary');
const activityRoutes = require('./routes/activities');
const { standaloneRouter: activityStandaloneRoutes } = require('./routes/activities');
const expenseRoutes = require('./routes/expenses');
const { standaloneRouter: expenseStandaloneRoutes } = require('./routes/expenses');
const collaborationRoutes = require('./routes/collaborations');
const favoriteRoutes = require('./routes/favorites');
const commentRoutes = require('./routes/comments');
const { standaloneRouter: commentStandaloneRoutes } = require('./routes/comments');
const errorHandler = require('./middleware/errorHandler');
const setupTripSocket = require('./sockets/tripSocket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true },
});
setupTripSocket(io);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests, please try again later.' } }));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips/:id/itinerary', itineraryRoutes);
app.use('/api/trips/:id/itinerary/days/:dayIndex/activities', activityRoutes);
app.use('/api/activities', activityStandaloneRoutes);
app.use('/api/trips/:id/expenses', expenseRoutes);
app.use('/api/expenses', expenseStandaloneRoutes);
app.use('/api/trips/:id/collaborators', collaborationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/activities/:id/comments', commentRoutes);
app.use('/api/comments', commentStandaloneRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = { app, server };
