'use strict';

// Hook PostToolUse (Edit/Write): em arquivo .js, roda node --check e os testes
// rápidos. Passou: uma linha. Falhou: erro inteiro no stderr e código 2, que
// devolve o erro ao Claude.

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..', '..');
const SAIDA_BLOQUEIO = 2;

function lerEntrada() {
  try {
    return JSON.parse(require('node:fs').readFileSync(0, 'utf8') || '{}');
  } catch (erro) {
    process.stderr.write(`pos-edicao: entrada do hook ilegível (${erro.message})\n`);
    return {};
  }
}

function rodar(args) {
  return spawnSync(process.execPath, args, { cwd: RAIZ, encoding: 'utf8' });
}

const entrada = lerEntrada();
const arquivo = (entrada.tool_input && entrada.tool_input.file_path) || '';

if (!arquivo.endsWith('.js')) {
  process.exit(0);
}

const checagem = rodar(['--check', arquivo]);
if (checagem.status !== 0) {
  process.stderr.write(`node --check falhou em ${arquivo}\n${checagem.stderr}`);
  process.exit(SAIDA_BLOQUEIO);
}

const testes = rodar(['--test', 'tests/**/*.test.js']);
if (testes.status !== 0) {
  // Só a parte das falhas, que já traz o erro completo de cada teste.
  const saida = testes.stdout + testes.stderr;
  const inicio = saida.indexOf('✖ failing tests');
  const resumo = inicio >= 0 ? saida.slice(inicio) : saida.split('\n').slice(-60).join('\n');
  process.stderr.write(`Testes rápidos falharam depois de editar ${arquivo}\n${resumo}`);
  process.exit(SAIDA_BLOQUEIO);
}

process.stdout.write(`ok: node --check e testes rápidos (${path.basename(arquivo)})\n`);
