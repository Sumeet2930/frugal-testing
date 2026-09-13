import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';

const PORT = 3000;
const server = http.createServer((req, res) => {
  const filePath = req.url === '/' ? './public/index.html' : `./public${req.url}`;
  const ext = path.extname(filePath);
  const contentType = ext === '.html' ? 'text/html' : 'text/javascript';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const wss = new WebSocketServer({ server, path: '/stream' });

wss.on('connection', (ws) => {
  console.log('[Server] Client connected to dynamic Canvas stream.');

  // Initially send LOADING state
  ws.send(JSON.stringify({ type: 'STATE_UPDATE', status: 'LOADING', balance: 50.0 }));

  // Transition to ACTIVE state after a short delay to trigger automation
  setTimeout(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'STATE_UPDATE', status: 'ACTIVE', balance: 100.0 }));
    }
  }, 1200);

  ws.on('message', (msg) => {
    // Echo or handle client modifications
  });
});

server.listen(PORT, () => {
  console.log(`[Testbed Server] Running on http://localhost:${PORT}`);
});