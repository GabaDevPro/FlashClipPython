'use strict';

// Abre index.html por file:// num Chrome ou Edge headless, passa pelos slides pedidos,
// salva um PNG de cada um e lista erros de console e requisições que não são file://.
// Uso: node scripts/capturar.js --largura 1920 --altura 1080 --saida capturas/1920 [--slides 1,15,25] [--navegador caminho]

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA = 9400 + Math.floor(Math.random() * 400);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function argumentos() {
  const a = process.argv.slice(2);
  const valor = (nome, padrao) => { const i = a.indexOf('--' + nome); return i >= 0 ? a[i + 1] : padrao; };
  return {
    largura: Number(valor('largura', 1920)),
    altura: Number(valor('altura', 1080)),
    saida: path.resolve(valor('saida', path.join(RAIZ, 'capturas', 'slides'))),
    slides: valor('slides', ''),
    navegador: valor('navegador', CHROME),
    html: valor('html', 'index.html')
  };
}

async function alvoDaPagina() {
  for (let i = 0; i < 60; i++) {
    try {
      const alvos = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json();
      const pagina = alvos.find((a) => a.type === 'page' && a.url.startsWith('file:'));
      if (pagina) { return pagina; }
    } catch (erro) {
      if (i === 59) { throw new Error('navegador não respondeu: ' + erro.message); }
    }
    await espera(250);
  }
  throw new Error('página file:// não apareceu');
}

function conectar(wsUrl, aoEvento) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pendentes = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pendentes.has(msg.id)) { pendentes.get(msg.id)(msg); pendentes.delete(msg.id); return; }
    if (msg.method) { aoEvento(msg); }
  };
  const pronto = new Promise((r) => { ws.onopen = r; });
  const enviar = (method, params = {}) => new Promise((r) => { id += 1; pendentes.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  return { pronto, enviar, fechar: () => ws.close() };
}

async function avaliar(cdp, expressao) {
  const r = await cdp.enviar('Runtime.evaluate', { expression: expressao, returnByValue: true, awaitPromise: true });
  if (r.result && r.result.exceptionDetails) { throw new Error(r.result.exceptionDetails.text); }
  return r.result.result.value;
}

async function main() {
  const op = argumentos();
  fs.mkdirSync(op.saida, { recursive: true });
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-captura-'));
  const url = 'file:///' + path.join(RAIZ, op.html).replace(/\\/g, '/');
  const proc = spawn(op.navegador, ['--headless=new', `--remote-debugging-port=${PORTA}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', url], { stdio: 'ignore' });
  const erros = [];
  const externas = [];
  try {
    const pagina = await alvoDaPagina();
    const cdp = conectar(pagina.webSocketDebuggerUrl, (m) => {
      if (m.method === 'Runtime.exceptionThrown') { erros.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception || {}).description); }
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') { erros.push(m.params.args.map((a) => a.value || a.description).join(' ')); }
      if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') { erros.push(m.params.entry.text + ' ' + (m.params.entry.url || '')); }
      if (m.method === 'Network.requestWillBeSent' && !/^(file|data|blob):/.test(m.params.request.url)) { externas.push(m.params.request.url); }
    });
    await cdp.pronto;
    await Promise.all(['Runtime.enable', 'Log.enable', 'Network.enable', 'Page.enable'].map((m) => cdp.enviar(m)));
    await cdp.enviar('Emulation.setDeviceMetricsOverride', { width: op.largura, height: op.altura, deviceScaleFactor: 1, mobile: false });
    await cdp.enviar('Page.reload', { ignoreCache: true });
    await espera(1500);
    await avaliar(cdp, 'document.fonts.ready.then(() => true)');
    const numeros = await avaliar(cdp, 'PI.app.slides().map(s => String(s.n))');
    const pedidos = op.slides ? op.slides.split(',').map((s) => s.trim()) : numeros;
    for (const n of pedidos) {
      const indice = numeros.indexOf(n);
      if (indice < 0) { erros.push('slide inexistente: ' + n); continue; }
      await avaliar(cdp, `PI.app.ir(${indice})`);
      await espera(120);
      const foto = await cdp.enviar('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(op.saida, `slide-${n.padStart(2, '0')}.png`), Buffer.from(foto.result.data, 'base64'));
    }
    cdp.fechar();
    process.stdout.write(JSON.stringify({ capturas: pedidos.length, pasta: op.saida, erros, externas }, null, 2) + '\n');
    if (erros.length || externas.length) { process.exitCode = 1; }
  } finally {
    proc.kill();
  }
}

main().catch((erro) => { console.error(erro); process.exit(1); });
