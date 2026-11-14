'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const cg = require('../js/logica/cronograma.js');

const CRONOGRAMA = [
  { bloco: 1, inicioMin: 0, fimMin: 7, etapa: 'Abertura' },
  { bloco: 1, inicioMin: 7, fimMin: 17, etapa: 'print e comentários' },
  { bloco: 1, inicioMin: 80, fimMin: 85, etapa: 'Intervalo' },
  { bloco: 2, inicioMin: 0, fimMin: 23, etapa: 'Laços for e while' },
  { bloco: 2, inicioMin: 46, fimMin: 50, etapa: 'Premiação final' }
];

test('linha do tempo põe o bloco 2 depois do fim do bloco 1, com o intervalo', () => {
  const linha = cg.linhaDoTempo(CRONOGRAMA);
  assert.deepEqual(linha[3], { etapa: 'Laços for e while', inicio: 85, fim: 108 });
  assert.deepEqual(linha[4], { etapa: 'Premiação final', inicio: 131, fim: 135 });
});

test('minutos desde o início da aula contam pelo relógio do dia', () => {
  assert.equal(cg.minutosDesde('19:10', new Date(2026, 10, 17, 19, 40, 30)), 30.5);
  assert.equal(cg.minutosDesde('19:10', new Date(2026, 10, 17, 19, 0)), -10);
});

test('etapa prevista para um minuto, antes do início e depois do fim', () => {
  const linha = cg.linhaDoTempo(CRONOGRAMA);
  assert.equal(cg.etapaEm(linha, 3), 'Abertura');
  assert.equal(cg.etapaEm(linha, 7), 'print e comentários');
  assert.equal(cg.etapaEm(linha, 90), 'Laços for e while');
  assert.equal(cg.etapaEm(linha, -5), 'antes do início');
  assert.equal(cg.etapaEm(linha, 140), 'fim do cronograma');
  assert.equal(cg.etapaEm(linha, 50), 'fora do cronograma');
});

test('janela da seção usa o mesmo deslocamento do bloco 2', () => {
  assert.deepEqual(cg.janelaDaSecao({ bloco: 2, inicioMin: 23, fimMin: 46 }, CRONOGRAMA), { inicio: 108, fim: 131 });
  assert.deepEqual(cg.janelaDaSecao({ bloco: 1, inicioMin: 7, fimMin: 17 }, CRONOGRAMA), { inicio: 7, fim: 17 });
});

test('ritmo diz adiantado, no tempo ou atrasado em minutos inteiros', () => {
  const janela = { inicio: 7, fim: 17 };
  assert.deepEqual(cg.ritmo(janela, 4.2), { estado: 'adiantado', minutos: 3 });
  assert.deepEqual(cg.ritmo(janela, 12), { estado: 'no tempo', minutos: 0 });
  assert.deepEqual(cg.ritmo(janela, 20.5), { estado: 'atrasado', minutos: 4 });
});

test('relógio formata a hora com dois dígitos', () => {
  assert.equal(cg.hora(new Date(2026, 10, 17, 9, 5)), '09:05');
});
