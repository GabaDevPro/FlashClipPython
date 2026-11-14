'use strict';
// Abre tests/navegador/teste-file.html por file:// num navegador real (headless),
// clica em "Abrir janela filha", recarrega a principal e imprime a tabela de resultados.
// Uso: node scripts/testar-file-headless.js <caminho-do-navegador> <porta> <arquivo-html>

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const [navegador, porta, arquivo] = process.argv.slice(2);
const url = 'file:///' + path.resolve(arquivo).replace(/\\/g, '/');
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'pi-perfil-'));
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function obterAlvos() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${porta}/json/list`);
      const alvos = await r.json();
      if (alvos.some((a) => a.type === 'page' && a.url.startsWith('file:'))) return alvos;
    } catch (_ignorado) { /* navegador ainda subindo */ }
    await espera(200);
  }
  throw new Error('navegador não respondeu na porta ' + porta);
}

function conectar(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pendentes = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pendentes.has(msg.id)) {
      pendentes.get(msg.id)(msg);
      pendentes.delete(msg.id);
    }
  };
  const pronto = new Promise((r) => { ws.onopen = r; });
  const enviar = (method, params = {}) => new Promise((r) => {
    id += 1;
    pendentes.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
  return { pronto, enviar, fechar: () => ws.close() };
}

async function avaliar(cdp, expr, gesto = false) {
  const r = await cdp.enviar('Runtime.evaluate', { expression: expr, returnByValue: true, userGesture: gesto, awaitPromise: true });
  return r.result && r.result.result ? r.result.result.value : r;
}

const LER_TABELA = `Array.from(document.querySelectorAll('#resultados tr')).map(tr =>
  tr.cells[0].textContent + ' | ' + tr.cells[1].textContent + ' | ' + tr.cells[2].textContent.slice(0, 90)).join('\\n')`;

(async () => {
  const proc = spawn(navegador, ['--headless=new', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', url], { stdio: 'ignore' });
  try {
    const alvos = await obterAlvos();
    const pagina = alvos.find((a) => a.type === 'page' && a.url.startsWith('file:'));
    const cdp = conectar(pagina.webSocketDebuggerUrl);
    await cdp.pronto;
    await cdp.enviar('Runtime.enable');
    await espera(1000);
    console.log('--- navegador:', await avaliar(cdp, 'navigator.userAgent'));
    await avaliar(cdp, "document.getElementById('abrir').click()", true);
    await espera(3500);
    console.log('--- depois de abrir a filha\n' + await avaliar(cdp, LER_TABELA));
    await cdp.enviar('Page.reload');
    await espera(3500);
    console.log('--- depois de recarregar a principal\n' + await avaliar(cdp, LER_TABELA));
    cdp.fechar();
  } finally {
    proc.kill();
  }
})().catch((erro) => { console.error(erro); process.exit(1); });
