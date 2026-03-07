const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1';
const PORT = 4173;
const BUILD_DIR = path.join(process.cwd(), 'build');

const ENV_JS = `
window.__ENV__ = {
  API_BASE_URL: "http://mock-api.local",
  APP_ENV: "integration"
};
`;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, 'Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    send(res, 200, data, contentType);
  });
}

const server = http.createServer((req, res) => {
  const reqPath = req.url.split('?')[0];

  if (reqPath === '/env.js') {
    return send(res, 200, ENV_JS, 'application/javascript; charset=utf-8');
  }

  let filePath = path.join(BUILD_DIR, reqPath === '/' ? 'index.html' : reqPath.replace(/^\/+/, ''));

  if (!filePath.startsWith(BUILD_DIR)) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      return serveFile(res, filePath);
    }

    const fallback = path.join(BUILD_DIR, 'index.html');
    return serveFile(res, fallback);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Integration test server running at http://${HOST}:${PORT}`);
});