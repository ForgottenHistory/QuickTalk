const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const sessionRoutes = require('./routes/sessionRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Import socket handler
const socketHandler = require('./handlers/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', sessionRoutes);
app.use('/api', settingsRoutes);

// Socket handling
socketHandler(io);

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- GET /api/test');
  console.log('- POST /api/sessions');
  console.log('- GET /api/sessions/:id');
  console.log('- GET /api/settings');
  console.log('- PATCH /api/settings/app');
  console.log('- PATCH /api/settings/llm');
  console.log('- POST /api/settings/app/reset');
  console.log('- POST /api/settings/llm/reset');
  console.log('- POST /api/settings/reset');
});