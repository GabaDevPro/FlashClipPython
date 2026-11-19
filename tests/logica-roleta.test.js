'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const ro = require('../js/logica/roleta.js');

const sempre = (x) => () => x;
const roletaVazia = () => ({ semRepetir: true, sorteados: [] });

test('sorteia só entre os candidatos, pelo número aleatório', () => {
  assert.equal(ro.sortear(['j1', 'j2', 'j3'], roletaVazia(), sempre(0), 1000).id, 'j1');
  assert.equal(ro.sortear(['j1', 'j2', 'j3'], roletaVazia(), sempre(0.99), 1000).id, 'j3');
});

test('registra o vencedor e o último sorteio, sem alterar a roleta anterior', () => {
  const antes = roletaVazia();
  const r = ro.sortear(['j1', 'j2'], antes, sempre(0.6), 1234);
  assert.equal(r.ok, true);
  assert.deepEqual(r.roleta, { semRepetir: true, sorteados: ['j2'], ultimo: { id: 'j2', em: 1234 } });
  assert.deepEqual(antes.sorteados, []);
});

test('com a opção ligada não repete vencedor; com a opção desligada pode repetir', () => {
  const ja = { semRepetir: true, sorteados: ['j1'] };
  assert.equal(ro.sortear(['j1', 'j2'], ja, sempre(0), 1).id, 'j2');
  assert.equal(ro.sortear(['j1', 'j2'], { semRepetir: false, sorteados: ['j1'] }, sempre(0), 1).id, 'j1');
});

test('sem candidatos, ou todos já sorteados, avisa e não sorteia', () => {
  assert.deepEqual(ro.sortear([], roletaVazia(), sempre(0), 1), { ok: false, erro: 'Ninguém marcado como acertou alguma atividade.' });
  assert.deepEqual(ro.sortear(['j1'], { semRepetir: true, sorteados: ['j1'] }, sempre(0), 1), { ok: false, erro: 'Todos os candidatos já foram sorteados.' });
});

test('mil sorteios sem repetir nunca saem da lista nem repetem', () => {
  let roleta = roletaVazia();
  const candidatos = ['j1', 'j2', 'j3', 'j4', 'j5'];
  for (let i = 0; i < candidatos.length; i++) {
    const r = ro.sortear(candidatos, roleta, Math.random, i);
    assert.ok(candidatos.includes(r.id));
    roleta = r.roleta;
  }
  assert.equal(new Set(roleta.sorteados).size, 5);
});

test('limpar apaga sorteados e o último, mantendo a opção', () => {
  assert.deepEqual(ro.limpar({ semRepetir: false, sorteados: ['j1'], ultimo: { id: 'j1', em: 1 } }), { semRepetir: false, sorteados: [], ultimo: null });
});

test('ângulo final gira pelo menos as voltas pedidas e para dentro de uma volta extra', () => {
  assert.equal(ro.anguloFinal(5, sempre(0)), 1800);
  assert.equal(ro.anguloFinal(5, sempre(0.5)), 1980);
});

test('desacelerar começa em 0, termina em 1, anda rápido no começo e devagar no fim', () => {
  assert.equal(ro.desacelerar(0), 0);
  assert.equal(ro.desacelerar(1), 1);
  assert.ok(ro.desacelerar(0.2) > 0.6, 'no primeiro quinto já fez mais da metade do giro');
  assert.ok(ro.desacelerar(0.9) - ro.desacelerar(0.8) < 0.01, 'quase parado no fim');
  assert.equal(ro.desacelerar(-1), 0);
  assert.equal(ro.desacelerar(2), 1);
});

test('fatiaNoPonteiro diz qual das fatias está embaixo do ponteiro depois de girar', () => {
  // Fatia 0 começa no topo e segue no sentido horário; o ponteiro fica embaixo.
  assert.equal(ro.fatiaNoPonteiro(0, 8), 4);
  assert.equal(ro.fatiaNoPonteiro(10, 8), 3);
  assert.equal(ro.fatiaNoPonteiro(45, 8), 3);
  assert.equal(ro.fatiaNoPonteiro(180, 8), 0);
  assert.equal(ro.fatiaNoPonteiro(360 * 6 + 180, 8), 0);
  assert.equal(ro.fatiaNoPonteiro(-30, 8), 4);
});

test('embaralhar devolve os mesmos nomes em outra ordem, sem mudar a lista original', () => {
  const nomes = ['Ana', 'Bia', 'Caio', 'Duda'];
  const r = ro.embaralhar(nomes, sempre(0));
  assert.deepEqual([...r].sort(), [...nomes].sort());
  assert.notDeepEqual(r, nomes);
  assert.deepEqual(nomes, ['Ana', 'Bia', 'Caio', 'Duda']);
  assert.deepEqual(ro.embaralhar([], sempre(0.5)), []);
});
