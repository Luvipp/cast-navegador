const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const rooms = new Map(); // code -> { screen, remote }
const clientRooms = new WeakMap();

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const requested = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const full = path.normalize(path.join(PUBLIC, requested));
  if (!full.startsWith(PUBLIC + path.sep) && full !== path.join(PUBLIC, 'index.html')) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(full).toLowerCase();
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });
function send(ws, obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); }
function codeGen() {
  let code;
  do { code = String(Math.floor(100000 + Math.random() * 900000)); } while (rooms.has(code));
  return code;
}
function status(room) {
  if (!room) return;
  send(room.screen, { type: 'peer', connected: !!(room.remote && room.remote.readyState === 1) });
  send(room.remote, { type: 'peer', connected: !!(room.screen && room.screen.readyState === 1) });
}
function drop(ws) {
  const info = clientRooms.get(ws);
  if (!info) return;
  const room = rooms.get(info.code);
  if (!room) return;
  if (info.role === 'screen' && room.screen === ws) room.screen = null;
  if (info.role === 'remote' && room.remote === ws) room.remote = null;
  if (!room.screen && !room.remote) rooms.delete(info.code);
  else status(room);
}
wss.on('connection', ws => {
  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return send(ws, { type: 'error', message: 'Mensagem inválida.' }); }
    if (msg.type === 'register-screen') {
      const code = codeGen();
      const room = { screen: ws, remote: null };
      rooms.set(code, room); clientRooms.set(ws, { code, role: 'screen' });
      send(ws, { type: 'registered', code }); status(room); return;
    }
    if (msg.type === 'join') {
      const code = String(msg.code || '').replace(/\D/g, '').slice(0, 6);
      const room = rooms.get(code);
      if (!room || !room.screen || room.screen.readyState !== 1) return send(ws, { type: 'error', message: 'Código não encontrado. Confira o código mostrado no PS4.' });
      if (room.remote && room.remote.readyState === 1) return send(ws, { type: 'error', message: 'Já existe um celular conectado a este código.' });
      room.remote = ws; clientRooms.set(ws, { code, role: 'remote' });
      send(ws, { type: 'joined' }); status(room); return;
    }
    const info = clientRooms.get(ws);
    if (!info) return send(ws, { type: 'error', message: 'Conecte a uma tela primeiro.' });
    const room = rooms.get(info.code);
    if (!room) return;
    if (info.role === 'remote') {
      if (['load', 'play', 'pause', 'toggle', 'seek', 'volume', 'mute'].includes(msg.type)) send(room.screen, msg);
    } else if (info.role === 'screen' && msg.type === 'progress') {
      send(room.remote, msg);
    }
  });
  ws.on('close', () => drop(ws));
  ws.on('error', () => drop(ws));
});
server.listen(PORT, '0.0.0.0', () => console.log(`Cast Navegador rodando na porta ${PORT}`));
