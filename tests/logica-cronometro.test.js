'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const cr = require('../js/logica/cronometro.js');

const MIN = 60000;
const T0 = 1_000_000;

test('criar deixa o cronômetro parado com o tempo cheio', () => {
  const c = cr.criar('1', 5 * MIN);
  assert.deepEqual(c, { alvo: '1', duracaoMs: 5 * MIN, rodando: false, terminaEm: null, restanteMs: 5 * MIN });
  assert.equal(cr.restante(c, T0), 5 * MIN);
});

test('iniciar marca o horário de término e o restante conta pelo relógio', () => {
  const c = cr.iniciar(cr.criar('1', 5 * MIN), T0);
  assert.equal(c.rodando, true);
  assert.equal(c.terminaEm, T0 + 5 * MIN);
  assert.equal(cr.restante(c, T0 + 90000), 5 * MIN - 90000);
});

test('terminar não deixa o restante negativo', () => {
  const c = cr.iniciar(cr.criar('1', 5 * MIN), T0);
  assert.equal(cr.restante(c, T0 + 6 * MIN), 0);
});

test('pausar congela o restante e retomar continua dali', () => {
  let c = cr.iniciar(cr.criar('1', 5 * MIN), T0);
  c = cr.pausar(c, T0 + MIN);
  assert.equal(c.rodando, false);
  assert.equal(c.terminaEm, null);
  assert.equal(cr.restante(c, T0 + 10 * MIN), 4 * MIN);
  c = cr.iniciar(c, T0 + 10 * MIN);
  assert.equal(cr.restante(c, T0 + 11 * MIN), 3 * MIN);
});

test('iniciar ou pausar duas vezes não muda nada', () => {
  const rodando = cr.iniciar(cr.criar('1', MIN), T0);
  assert.equal(cr.iniciar(rodando, T0 + 5000), rodando);
  const parado = cr.criar('1', MIN);
  assert.equal(cr.pausar(parado, T0), parado);
});

test('alternar inicia quando parado e pausa quando rodando', () => {
  const c = cr.alternar(cr.criar('1', MIN), T0);
  assert.equal(c.rodando, true);
  assert.equal(cr.alternar(c, T0 + 1000).rodando, false);
});

test('mais um minuto vale rodando, parado e depois de terminar', () => {
  const rodando = cr.mais1(cr.iniciar(cr.criar('1', MIN), T0), T0);
  assert.equal(cr.restante(rodando, T0), 2 * MIN);
  const parado = cr.mais1(cr.criar('1', MIN), T0);
  assert.equal(cr.restante(parado, T0), 2 * MIN);
  const acabado = cr.mais1(cr.iniciar(cr.criar('1', MIN), T0), T0 + 5 * MIN);
  assert.equal(cr.restante(acabado, T0 + 5 * MIN), MIN);
});

test('zerar volta ao tempo cheio e para', () => {
  const c = cr.zerar(cr.iniciar(cr.criar('1', 5 * MIN), T0));
  assert.deepEqual(c, cr.criar('1', 5 * MIN));
});

test('fase é normal, alerta no último minuto e fim em zero', () => {
  const c = cr.iniciar(cr.criar('1', 5 * MIN), T0);
  assert.equal(cr.fase(c, T0), 'normal');
  assert.equal(cr.fase(c, T0 + 4 * MIN), 'alerta');
  assert.equal(cr.fase(c, T0 + 5 * MIN), 'fim');
});

test('formatar mostra minutos e segundos, arredondando para cima', () => {
  assert.equal(cr.formatar(5 * MIN), '5:00');
  assert.equal(cr.formatar(15 * MIN), '15:00');
  assert.equal(cr.formatar(61000), '1:01');
  assert.equal(cr.formatar(59001), '1:00');
  assert.equal(cr.formatar(400), '0:01');
  assert.equal(cr.formatar(0), '0:00');
});

test('um cronômetro de 5:00 termina com menos de 1 s de erro mesmo com ticks irregulares', () => {
  const c = cr.iniciar(cr.criar('1', 5 * MIN), T0);
  let agora = T0;
  while (cr.restante(c, agora) > 0) { agora += 250 + (agora % 7); }
  assert.ok(agora - (T0 + 5 * MIN) < 1000);
});
