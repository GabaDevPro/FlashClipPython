'use strict';

// Servidor estático mínimo, só para a verificação visual no navegador embutido do app
// (que abre arquivo local como data:). A apresentação de verdade abre por file://.
// Uso: node scripts/servidor.js [porta]

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const PORTA = Number(process.argv[2]) || 8137;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2'
};

http.createServer((req, res) => {
  const caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const arquivo = path.normalize(path.join(RAIZ, caminho === '/' ? 'index.html' : caminho));
  if (!arquivo.startsWith(RAIZ)) {
    res.writeHead(403).end('proibido');
    return;
  }
  fs.readFile(arquivo, (erro, dados) => {
    if (erro) {
      res.writeHead(404).end('não encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(dados);
  });
}).listen(PORTA, '127.0.0.1', () => {
  process.stdout.write(`Servindo ${RAIZ} em http://localhost:${PORTA}\n`);
});
