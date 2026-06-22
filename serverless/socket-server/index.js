/**
 * Tiny always-on Socket.io server for live dashboard updates.
 *
 * - Recruiter dashboards connect with their JWT and join a room per company.
 * - The worker Lambda POSTs to /emit (with a shared secret) after scoring a CV;
 *   we relay it to that company's room so candidates appear live.
 *
 * Run: `npm run socket`  (listens on :4000)
 */
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.SOCKET_PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const EMIT_SECRET = process.env.EMIT_SECRET || 'worker-emit-secret';

const server = http.createServer((req, res) => {
  // Worker -> server relay. Protected by a shared secret header.
  if (req.method === 'POST' && req.url === '/emit') {
    if (req.headers['x-emit-secret'] !== EMIT_SECRET) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const { companyId, event, payload } = JSON.parse(body);
        io.to(`company:${companyId}`).emit(event || 'candidate.scored', payload);
        console.log(`emit ${event} -> company:${companyId}`, payload?.name || '');
        res.writeHead(200);
        res.end('ok');
      } catch (e) {
        res.writeHead(400);
        res.end('bad request');
      }
    });
    return;
  }
  if (req.url === '/health') {
    res.writeHead(200);
    return res.end('ok');
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(server, { cors: { origin: '*' } });

// JWT handshake — only authenticated dashboards can subscribe, scoped to company.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const d = jwt.verify(token, JWT_SECRET);
    socket.data.companyId = d.companyId;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  const room = `company:${socket.data.companyId}`;
  socket.join(room);
  console.log('client connected ->', room);
});

server.listen(PORT, () => console.log(`✅ Socket.io server on :${PORT}`));
