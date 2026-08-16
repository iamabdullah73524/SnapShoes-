require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');
const wishlistRoutes = require('./routes/wishlist');
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // allow development connections from any client
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Connect to Database (Mongoose or Fallback JSON files)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Attach socket.io to every request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// REST Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Root test route
app.get('/', (req, res) => {
  res.send({ status: "OK", brand: "SANP SHOES API Server Running", fallbackMode: global.useMockDB });
});

// Socket.io Real-Time connection management
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // User joins their personal room for private order notifications
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`👥 Client ${socket.id} joined personal room: ${userId}`);
    }
  });

  // User leaves their personal room
  socket.on('leave_user_room', (userId) => {
    if (userId) {
      socket.leave(userId);
      console.log(`👥 Client ${socket.id} left personal room: ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 SANP SHOES Server running on port ${PORT}`);
  console.log(`🌐 Fallback database mode active: ${global.useMockDB}`);
});
