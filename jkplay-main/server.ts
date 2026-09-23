import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.js';
import songRoutes from './server/routes/songs.js';
import playlistRoutes from './server/routes/playlists.js';
import jamRoutes from './server/routes/jam.js';
import storyRoutes from './server/routes/stories.js';
import adminRoutes from './server/routes/admin.js';
import searchRoutes from './server/routes/search.js';
import { authenticateUser } from './server/services/auth.js';
import { setupJamSocketHandlers } from './server/socket/jamHandler.js';

dotenv.config();

const app = express();
const httpServer = createHttpServer(app);
const PORT = process.env.PORT || 3000;

// Setup Socket.IO for Jam Mode synchronization
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
setupJamSocketHandlers(io);

// Parse JSON bodies
app.use(express.json());

// Global auth token parser middleware
app.use(authenticateUser);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/jam', jamRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'KingPlay Music & Stories',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production serve dist files
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[KingPlay] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[KingPlay] Failed to start server:', err);
});
