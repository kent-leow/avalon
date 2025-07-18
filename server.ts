/**
 * Custom Next.js Server with Socket.IO Integration
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeSocket } from './src/server/socket';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Configure Next.js with development optimizations
const app = next({ 
  dev, 
  hostname, 
  port,
  turbo: dev, // Enable turbo mode in development
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log('[Server] Next.js application prepared');
  
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

  // Initialize Socket.IO
  initializeSocket(server);
  console.log('[Server] Socket.IO initialized');

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Next.js ${dev ? 'development' : 'production'} server with Socket.IO`);
  });
});
