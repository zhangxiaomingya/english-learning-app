#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEY = path.join(__dirname, '30.248.218.200+2-key.pem');
const CERT = path.join(__dirname, '30.248.218.200+2.pem');
const DIST = path.join(__dirname, 'dist');
const PORT = 8443;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
};

const options = {
  key: fs.readFileSync(KEY),
  cert: fs.readFileSync(CERT),
};

const server = https.createServer(options, (req, res) => {
  let urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST, urlPath);

  // SPA fallback
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ HTTPS 服务器已启动`);
  console.log(`\n📱 iPhone 访问地址：`);
  console.log(`   https://30.248.218.200:${PORT}`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});
