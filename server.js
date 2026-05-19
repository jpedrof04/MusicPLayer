const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;

  if (pathname === '/api/songs') {
    const songsDir = path.join(__dirname, 'songs');
    fs.readdir(songsDir, (err, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read songs directory' }));
        return;
      }
      const songs = files
        .filter(f => /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(f))
        .map(f => ({
          name: f,
          url: `/songs/${encodeURIComponent(f)}`,
        }));
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(songs));
    });
    return;
  }

  let baseDir = __dirname;
  if (pathname.startsWith('/songs/')) {
    baseDir = __dirname;
  } else {
    baseDir = path.join(__dirname, 'src');
  }

  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
    baseDir = path.join(__dirname, 'src');
  }

  const filePath = path.join(baseDir, pathname);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
