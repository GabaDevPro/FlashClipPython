'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const est = require('../js/logica/estado.js');

const ATIVIDADES = { '1': { minutos: 5 }, boss: { minutos: 15 } };

function valido() {
  return Object.assign(est.inicial(ATIVIDADES), {
    jogadores: [{ id: 'j1', nome: 'Ana', acertou: true, ordem: 1 }, { id: 'j2', nome: 'Bruno', acertou: false, ordem: 2 }],
    resultados: { '1': ['j2', 'j1'] }
  });
}

test('estado inicial segue o contrato e começa no slide 0 com som ligado', () => {
  const e = est.inicial(ATIVIDADES);
  assert.equal(e.versao, 1);
  assert.equal(e.slide, 0);
  assert.deepEqual(e.jogadores, []);
  assert.deepEqual(e.resultados, {});
  assert.equal(e.cronometro.alvo, '1');
  assert.equal(e.cronometro.restanteMs, 5 * 60000);
  assert.deepEqual(e.roleta, { semRepetir: true, sorteados: [] });
  assert.equal(e.som, true);
});

test('validar aceita um estado bem formado', () => {
  assert.deepEqual(est.validar(valido(), ATIVIDADES), { ok: true });
});

test('validar recusa estrutura, tipos e referências erradas com motivo claro', () => {
  const casos = [
    [null, /objeto/],
    [Object.assign(valido(), { versao: 2 }), /versão/],
    [Object.assign(valido(), { jogadores: 'x' }), /jogadores/],
    [Object.assign(valido(), { jogadores: [{ id: 'j1', nome: 5, acertou: true, ordem: 1 }] }), /nome/],
    [Object.assign(valido(), { jogadores: [{ id: 'j1', nome: 'A', acertou: true, ordem: 1 }, { id: 'j1', nome: 'B', acertou: true, ordem: 2 }] }), /repetido/],
    [Object.assign(valido(), { resultados: { '9': ['j1'] } }), /atividade/],
    [Object.assign(valido(), { resultados: { '1': ['j7'] } }), /jogador/],
    [Object.assign(valido(), { resultados: { '1': ['j1', 'j2', 'j1', 'j2'] } }), /top 3/],
    [Object.assign(valido(), { slide: -1 }), /slide/],
    [Object.assign(valido(), { cronometro: { alvo: '1' } }), /cronômetro/],
    [Object.assign(valido(), { roleta: { semRepetir: 'sim', sorteados: [] } }), /roleta/],
    [Object.assign(valido(), { som: 1 }), /som/]
  ];
  for (const [entrada, motivo] of casos) {
    const r = est.validar(entrada, ATIVIDADES);
    assert.equal(r.ok, false, JSON.stringify(entrada && entrada.versao));
    assert.match(r.erro, motivo);
  }
});

test('validar aceita o último sorteio da roleta e recusa formato errado', () => {
  const com = Object.assign(valido(), { roleta: { semRepetir: true, sorteados: ['j1'], ultimo: { id: 'j1', em: 5 } } });
  assert.deepEqual(est.validar(com, ATIVIDADES), { ok: true });
  const errado = Object.assign(valido(), { roleta: { semRepetir: true, sorteados: [], ultimo: { id: 3 } } });
  assert.match(est.validar(errado, ATIVIDADES).erro, /roleta/);
});

test('validar recusa mais de 200 jogadores e nome com mais de 40 caracteres', () => {
  const muitos = Object.assign(valido(), { jogadores: Array.from({ length: 201 }, (_, i) => ({ id: 'j' + (i + 1), nome: 'J' + i, acertou: false, ordem: i + 1 })), resultados: {} });
  assert.match(est.validar(muitos, ATIVIDADES).erro, /200/);
  const longo = Object.assign(valido(), { jogadores: [{ id: 'j1', nome: 'x'.repeat(41), acertou: false, ordem: 1 }], resultados: {} });
  assert.match(est.validar(longo, ATIVIDADES).erro, /40/);
});

test('exportar e importar devolve o mesmo estado', () => {
  const e = valido();
  const r = est.importar(est.exportar(e), ATIVIDADES);
  assert.equal(r.ok, true);
  assert.deepEqual(r.estado, e);
});

test('importar recusa JSON quebrado, texto grande demais e estado inválido', () => {
  assert.match(est.importar('{quebrado', ATIVIDADES).erro, /JSON/);
  assert.match(est.importar('x'.repeat(est.LIMITE_BYTES + 1), ATIVIDADES).erro, /grande/);
  assert.match(est.importar(JSON.stringify({ versao: 1 }), ATIVIDADES).erro, /jogadores/);
});

test('carregar usa o salvo quando é válido e volta ao inicial quando falta ou está estragado', () => {
  const e = valido();
  assert.deepEqual(est.carregar(est.exportar(e), ATIVIDADES), { estado: e, aviso: null });
  assert.deepEqual(est.carregar(null, ATIVIDADES), { estado: est.inicial(ATIVIDADES), aviso: null });
  const estragado = est.carregar('{x', ATIVIDADES);
  assert.deepEqual(estragado.estado, est.inicial(ATIVIDADES));
  assert.match(estragado.aviso, /JSON/);
});

test('nome do arquivo de backup usa data e hora locais', () => {
  assert.equal(est.nomeArquivo(new Date(2026, 10, 17, 19, 5)), 'placar-2026-11-17-1905.json');
});
