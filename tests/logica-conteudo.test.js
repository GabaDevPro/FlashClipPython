'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const conteudo = require('../js/logica/conteudo.js');

const SECAO_A = { id: '01-a', titulo: 'A', bloco: 1, inicioMin: 0, fimMin: 7, slides: [{ n: 1, titulo: 'um' }, { n: 2, titulo: 'dois' }] };
const SECAO_B = { id: '02-b', titulo: 'B', bloco: 1, inicioMin: 7, fimMin: 17, slides: [{ n: 18, titulo: 'x' }, { n: '18b', titulo: 'y', apoio: true }] };

test('registro guarda as seções na ordem em que são declaradas', () => {
  const registro = conteudo.criarRegistro();
  registro.secao(SECAO_A);
  registro.secao(SECAO_B);
  assert.deepEqual(registro.secoes().map((s) => s.id), ['01-a', '02-b']);
});

test('registro devolve cópia da lista, sem expor o array interno', () => {
  const registro = conteudo.criarRegistro();
  registro.secao(SECAO_A);
  registro.secoes().push(SECAO_B);
  assert.equal(registro.secoes().length, 1);
});

test('achatar junta os slides de todas as seções com o índice e os dados da seção', () => {
  const slides = conteudo.achatarSecoes([SECAO_A, SECAO_B]);
  assert.equal(slides.length, 4);
  assert.deepEqual(slides.map((s) => s.indice), [0, 1, 2, 3]);
  assert.equal(slides[3].n, '18b');
  assert.equal(slides[3].secaoId, '02-b');
  assert.equal(slides[3].secaoTitulo, 'B');
});

test('achatar não altera os objetos originais das seções', () => {
  conteudo.achatarSecoes([SECAO_A]);
  assert.equal(SECAO_A.slides[0].indice, undefined);
});

test('indicePorNumero acha slide numerado e slide de apoio, ignorando caixa e espaços', () => {
  const slides = conteudo.achatarSecoes([SECAO_A, SECAO_B]);
  assert.equal(conteudo.indicePorNumero(slides, '2'), 1);
  assert.equal(conteudo.indicePorNumero(slides, ' 18B '), 3);
  assert.equal(conteudo.indicePorNumero(slides, 18), 2);
});

test('indicePorNumero devolve -1 quando o número não existe ou está vazio', () => {
  const slides = conteudo.achatarSecoes([SECAO_A]);
  assert.equal(conteudo.indicePorNumero(slides, '99'), -1);
  assert.equal(conteudo.indicePorNumero(slides, ''), -1);
});
