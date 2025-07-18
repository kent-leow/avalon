/**
 * Custom Next.js Server with Socket.IO Integration
 * This replaces the default Next.js server to add WebSocket support
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO only on server side
  if (typeof window === 'undefined') {
    // Dynamic import to avoid client-side execution
    import('./src/server/socket.ts').then(({ initializeSocket }) => {
      initializeSocket(server);
      console.log('[Server] Socket.IO initialized');
    }).catch((err) => {
      console.error('[Server] Failed to initialize Socket.IO:', err);
    });
  }

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
