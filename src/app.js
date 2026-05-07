import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';

// Import route handlers
import homeRoutes from './routes/home.js';
import callRoutes from './routes/calls.js';
import webhookRoutes from './routes/webhooks.js';

// Import handlers
import { initMediaStreamHandler } from './mediaStreamHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// ============================================
// Middleware Setup
// ============================================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// ============================================
// View Engine Setup (EJS)
// ============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// ============================================
// Static Files
// ============================================
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// Global Variables
// ============================================
app.locals.appName = 'Telnyx Media Streaming App';
app.locals.version = '1.0.0';

// ============================================
// Request Logging Middleware
// ============================================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// Routes
// ============================================
app.use('/', homeRoutes);
app.use('/calls', callRoutes);
app.use('/webhooks', webhookRoutes);

// ============================================
// WebSocket Server Setup (Media Streaming)
// ============================================
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log(`[WebSocket] New connection from ${req.socket.remoteAddress}`);
  initMediaStreamHandler(ws, req);
});

// ============================================
// Error Handling Middleware
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', {
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).render('404', {
    requestedUrl: req.originalUrl
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Telnyx Media Streaming App Running    ║
╠════════════════════════════════════════╣
║  Server: http://${HOST}:${PORT}
║  Environment: ${process.env.NODE_ENV || 'development'}
║  WebSocket: ws://${HOST}:${PORT}
╚════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
