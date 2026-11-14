'use strict';

// Hook Stop: roda npm test (testes e cobertura de js/logica/). Se falhar,
// devolve o erro com código 2 e a sessão não encerra. Na segunda tentativa
// seguida (stop_hook_active) só avisa, para não prender a sessão em laço.

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..', '..');
const SAIDA_BLOQUEIO = 2;

let entrada = {};
try {
  entrada = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch (erro) {
  process.stderr.write(`ao-parar: entrada do hook ilegível (${erro.message})\n`);
}

const resultado = spawnSync('npm', ['test'], { cwd: RAIZ, encoding: 'utf8', shell: true });

if (resultado.status === 0) {
  process.exit(0);
}

const relatorio = `npm test falhou:\n${resultado.stdout}${resultado.stderr}`;
if (entrada.stop_hook_active) {
  process.stderr.write(`Aviso: ${relatorio}`);
  process.exit(0);
}
process.stderr.write(relatorio);
process.exit(SAIDA_BLOQUEIO);
