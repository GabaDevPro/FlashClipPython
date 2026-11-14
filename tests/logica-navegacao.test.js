'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const nav = require('../js/logica/navegacao.js');

test('proximo avança um e para no último slide', () => {
  assert.equal(nav.proximo(0, 57), 1);
  assert.equal(nav.proximo(56, 57), 56);
});

test('anterior volta um e para no primeiro slide', () => {
  assert.equal(nav.anterior(5), 4);
  assert.equal(nav.anterior(0), 0);
});

test('limitar prende o índice entre o primeiro e o último', () => {
  assert.equal(nav.limitar(-3, 10), 0);
  assert.equal(nav.limitar(42, 10), 9);
  assert.equal(nav.limitar(4, 10), 4);
});

test('teclas do passador e do teclado viram avançar e voltar', () => {
  for (const tecla of ['ArrowRight', 'ArrowDown', 'PageDown', ' ']) {
    assert.equal(nav.interpretarTecla(tecla, null).acao, 'proximo', tecla);
  }
  for (const tecla of ['ArrowLeft', 'ArrowUp', 'PageUp']) {
    assert.equal(nav.interpretarTecla(tecla, null).acao, 'anterior', tecla);
  }
});

test('Home, End, F, ? e P têm ações próprias', () => {
  assert.equal(nav.interpretarTecla('Home', null).acao, 'inicio');
  assert.equal(nav.interpretarTecla('End', null).acao, 'fim');
  assert.equal(nav.interpretarTecla('f', null).acao, 'telaCheia');
  assert.equal(nav.interpretarTecla('F', null).acao, 'telaCheia');
  assert.equal(nav.interpretarTecla('?', null).acao, 'ajuda');
  assert.equal(nav.interpretarTecla('p', null).acao, 'painel');
});

test('C, M, Z, S e L controlam cronômetro, som e placar, em maiúscula ou minúscula', () => {
  const esperado = { c: 'cronometro', m: 'mais1', z: 'zerar', s: 'som', l: 'placar' };
  for (const [tecla, acao] of Object.entries(esperado)) {
    assert.equal(nav.interpretarTecla(tecla, null).acao, acao, tecla);
    assert.equal(nav.interpretarTecla(tecla.toUpperCase(), null).acao, acao, tecla.toUpperCase());
  }
});

test('tecla desconhecida não faz nada', () => {
  assert.deepEqual(nav.interpretarTecla('x', null), { acao: null, modoIr: null });
});

test('G abre o modo ir para e os dígitos vão para o número digitado', () => {
  let r = nav.interpretarTecla('g', null);
  assert.deepEqual(r, { acao: 'digitar', modoIr: '' });
  r = nav.interpretarTecla('1', r.modoIr);
  r = nav.interpretarTecla('8', r.modoIr);
  r = nav.interpretarTecla('b', r.modoIr);
  assert.deepEqual(r, { acao: 'digitar', modoIr: '18b' });
  assert.deepEqual(nav.interpretarTecla('Enter', r.modoIr), { acao: 'ir', modoIr: null, numero: '18b' });
});

test('no modo ir para, Backspace apaga, Escape cancela e o número tem no máximo 3 caracteres', () => {
  assert.deepEqual(nav.interpretarTecla('Backspace', '12'), { acao: 'digitar', modoIr: '1' });
  assert.deepEqual(nav.interpretarTecla('Escape', '12'), { acao: 'cancelar', modoIr: null });
  assert.deepEqual(nav.interpretarTecla('7', '123'), { acao: 'digitar', modoIr: '123' });
});

test('no modo ir para, as setas não navegam e Enter vazio só cancela', () => {
  assert.deepEqual(nav.interpretarTecla('ArrowRight', '1'), { acao: 'digitar', modoIr: '1' });
  assert.deepEqual(nav.interpretarTecla('Enter', ''), { acao: 'cancelar', modoIr: null });
});
