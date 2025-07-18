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

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
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
  });
});
