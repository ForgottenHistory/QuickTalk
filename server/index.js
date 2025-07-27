const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const sessionRoutes = require('./routes/sessionRoutes');
const socketHandler = require('./handlers/socketHandler');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', sessionRoutes);

// Socket.io connection handling
socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});