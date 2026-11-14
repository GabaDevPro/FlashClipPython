'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const pl = require('../js/logica/placar.js');

const ATIVIDADES = {
  '1': { premios: [300, 200, 100] }, '2': { premios: [300, 200, 100] }, '3': { premios: [300, 200, 100] },
  '4a': { premios: [300, 200, 100] }, '4b': { premios: [300, 200, 100] }, '5a': { premios: [300, 200, 100] },
  '5b': { premios: [300, 200, 100] }, boss: { premios: [500, 300, 100] }
};
const vazio = () => ({ jogadores: [], resultados: {} });

function comJogadores(nomes) {
  return nomes.reduce((e, n) => pl.adicionarJogador(e, n), vazio());
}

test('adicionar jogador cria id e ordem de cadastro, sem alterar o estado anterior', () => {
  const antes = vazio();
  const depois = pl.adicionarJogador(antes, '  Ana  ');
  assert.equal(antes.jogadores.length, 0);
  assert.deepEqual(depois.jogadores, [{ id: 'j1', nome: 'Ana', acertou: false, ordem: 1 }]);
  assert.equal(pl.adicionarJogador(depois, 'Bruno').jogadores[1].id, 'j2');
});

test('adicionar recusa nome vazio, repetido (sem diferenciar maiúsculas) e longo demais', () => {
  const e = comJogadores(['Ana']);
  assert.throws(() => pl.adicionarJogador(e, '   '), /vazio/);
  assert.throws(() => pl.adicionarJogador(e, 'ana'), /já existe/);
  assert.throws(() => pl.adicionarJogador(e, 'x'.repeat(41)), /40/);
});

test('renomear, marcar acertou e remover jogador', () => {
  let e = comJogadores(['Ana', 'Bruno']);
  e = pl.renomearJogador(e, 'j1', 'Ana Paula');
  assert.equal(e.jogadores[0].nome, 'Ana Paula');
  e = pl.marcarAcertou(e, 'j2', true);
  assert.equal(e.jogadores[1].acertou, true);
  e = pl.registrarTop3(e, '1', ['j1', 'j2']);
  e = pl.removerJogador(e, 'j1');
  assert.deepEqual(e.jogadores.map((j) => j.id), ['j2']);
  assert.deepEqual(e.resultados['1'], ['j2']);
});

test('registrar top 3 aceita até 3 jogadores diferentes e existentes', () => {
  const e = comJogadores(['Ana', 'Bruno', 'Carla', 'Diego']);
  assert.deepEqual(pl.registrarTop3(e, '1', ['j3', 'j1', 'j2']).resultados['1'], ['j3', 'j1', 'j2']);
  assert.throws(() => pl.registrarTop3(e, '1', ['j1', 'j1']), /repetido/);
  assert.throws(() => pl.registrarTop3(e, '1', ['j1', 'j9']), /não existe/);
  assert.throws(() => pl.registrarTop3(e, '1', ['j1', 'j2', 'j3', 'j4']), /3/);
});

test('corrigir o top 3 substitui o anterior e top 3 vazio apaga o resultado', () => {
  let e = comJogadores(['Ana', 'Bruno']);
  e = pl.registrarTop3(e, '1', ['j1', 'j2']);
  e = pl.registrarTop3(e, '1', ['j2']);
  assert.deepEqual(e.resultados['1'], ['j2']);
  e = pl.registrarTop3(e, '1', []);
  assert.equal(e.resultados['1'], undefined);
});

test('ranking soma os prêmios das 8 atividades no caso montado a partir do roteiro', () => {
  let e = comJogadores(['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fábio']);
  e = pl.registrarTop3(e, '1', ['j1', 'j2', 'j3']);
  e = pl.registrarTop3(e, '2', ['j2', 'j1', 'j4']);
  e = pl.registrarTop3(e, '3', ['j1', 'j3', 'j2']);
  e = pl.registrarTop3(e, '4a', ['j4', 'j1', 'j5']);
  e = pl.registrarTop3(e, '4b', ['j1', 'j4', 'j2']);
  e = pl.registrarTop3(e, '5a', ['j3', 'j2', 'j1']);
  e = pl.registrarTop3(e, '5b', ['j5', 'j3', 'j6']);
  e = pl.registrarTop3(e, 'boss', ['j2', 'j1', 'j3']);
  const r = pl.ranking(e, ATIVIDADES);
  const total = (id) => r.find((x) => x.id === id).total;
  assert.equal(total('j1'), 300 + 200 + 300 + 200 + 300 + 100 + 300);
  assert.equal(total('j2'), 200 + 300 + 100 + 100 + 200 + 500);
  assert.equal(total('j3'), 100 + 200 + 300 + 200 + 100);
  assert.equal(total('j6'), 100);
  assert.deepEqual(r.map((x) => x.id), ['j1', 'j2', 'j3', 'j4', 'j5', 'j6']);
  assert.deepEqual(r.map((x) => x.posicao), [1, 2, 3, 4, 5, 6]);
});

test('empate em dinheiro: vence quem tem mais 1ºs lugares; persistindo, a ordem de cadastro', () => {
  let e = comJogadores(['Ana', 'Bruno', 'Carla', 'Diego']);
  e = pl.registrarTop3(e, '1', ['j2', 'j1']);
  e = pl.registrarTop3(e, '2', ['j3', 'j1']);
  e = pl.registrarTop3(e, '3', ['j4', 'j2', 'j1']);
  e = pl.registrarTop3(e, '4a', ['j4', 'j3']);
  // Diego 600 (2 primeiros); Ana, Bruno e Carla com 500. Ana não tem 1º lugar;
  // Bruno e Carla têm 1 cada, e Bruno foi cadastrado antes.
  assert.deepEqual(pl.ranking(e, ATIVIDADES).map((x) => [x.nome, x.total, x.primeiros]), [
    ['Diego', 600, 2], ['Bruno', 500, 1], ['Carla', 500, 1], ['Ana', 500, 0]
  ]);
});

test('premiosDe devolve o valor de cada posição do top 3 da atividade', () => {
  let e = comJogadores(['Ana', 'Bruno']);
  e = pl.registrarTop3(e, 'boss', ['j2', 'j1']);
  assert.deepEqual(pl.top3(e, 'boss', ATIVIDADES), [
    { posicao: 1, id: 'j2', nome: 'Bruno', valor: 500 }, { posicao: 2, id: 'j1', nome: 'Ana', valor: 300 }
  ]);
  assert.deepEqual(pl.top3(e, '1', ATIVIDADES), []);
});

test('candidatos ao sorteio: marcados à mão ou que aparecem em algum top 3', () => {
  let e = comJogadores(['Ana', 'Bruno', 'Carla']);
  e = pl.marcarAcertou(e, 'j3', true);
  e = pl.registrarTop3(e, '1', ['j1']);
  assert.deepEqual(pl.candidatosSorteio(e).map((j) => j.id), ['j1', 'j3']);
});

test('marcar por lista colada aceita um nome por linha e ignora caixa, espaços e nomes desconhecidos', () => {
  let e = comJogadores(['Ana', 'Bruno', 'Carla']);
  const r = pl.marcarPorLista(e, ' ana \nCARLA\nZé\n\n');
  assert.deepEqual(r.estado.jogadores.map((j) => j.acertou), [true, false, true]);
  assert.deepEqual(r.desconhecidos, ['Zé']);
});
