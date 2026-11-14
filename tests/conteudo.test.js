'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const RAIZ = path.join(__dirname, '..');
const PASTA_SECOES = path.join(RAIZ, 'conteudo', 'secoes');
const ARQUIVO_CONFIG = path.join(RAIZ, 'conteudo', 'config.js');

const LAYOUTS = [
  'capa', 'ministrantes', 'regras', 'instrucoes', 'algoritmo', 'atualizacao', 'conceito',
  'cartas', 'erro', 'enunciado', 'resposta', 'recap', 'ranking', 'intervalo',
  'impacto', 'premios', 'proximos', 'encerramento',
];
const MAX_LINHAS_TEXTO = 3;
const REGEX_EMOJI = /\p{Extended_Pictographic}|‍|️/u;
const REGEX_TRAVESSAO = /[—–]/;

function carregarConteudo() {
  const secoes = [];
  const PI = { secao: (s) => secoes.push(s) };
  const contexto = { PI };
  contexto.window = contexto;
  vm.createContext(contexto);

  const arquivos = fs.readdirSync(PASTA_SECOES).filter((a) => a.endsWith('.js')).sort();
  for (const arquivo of arquivos) {
    vm.runInContext(fs.readFileSync(path.join(PASTA_SECOES, arquivo), 'utf8'), contexto, { filename: arquivo });
  }
  vm.runInContext(fs.readFileSync(ARQUIVO_CONFIG, 'utf8'), contexto, { filename: 'config.js' });
  return { secoes, config: PI.config };
}

function coletarTextos(valor, acumulado = []) {
  if (typeof valor === 'string') {
    acumulado.push(valor);
  } else if (Array.isArray(valor)) {
    valor.forEach((v) => coletarTextos(v, acumulado));
  } else if (valor && typeof valor === 'object') {
    Object.values(valor).forEach((v) => coletarTextos(v, acumulado));
  }
  return acumulado;
}

const { secoes, config } = carregarConteudo();
const slides = secoes.flatMap((s) => s.slides);
const porNumero = (n) => slides.find((s) => s.n === n);

test('o conteúdo tem 10 seções e 57 slides no total', () => {
  assert.equal(secoes.length, 10);
  assert.equal(slides.length, 57);
});

test('a sequência de números vai de 1 a 56, com o 18b logo depois do 18', () => {
  const esperado = [];
  for (let i = 1; i <= 56; i++) {
    esperado.push(i);
    if (i === 18) esperado.push('18b');
  }
  assert.deepEqual(slides.map((s) => s.n), esperado);
});

test('todo slide usa um layout da lista do contrato', () => {
  for (const slide of slides) {
    assert.ok(LAYOUTS.includes(slide.layout), `slide ${slide.n}: layout "${slide.layout}" fora do contrato`);
  }
});

test('todo slide tem título', () => {
  for (const slide of slides) {
    assert.equal(typeof slide.titulo, 'string', `slide ${slide.n} sem título`);
    assert.ok(slide.titulo.trim().length > 0, `slide ${slide.n} com título vazio`);
  }
});

test('o texto de cada slide tem no máximo 3 linhas', () => {
  for (const slide of slides) {
    if (slide.texto === undefined) continue;
    assert.ok(Array.isArray(slide.texto), `slide ${slide.n}: texto não é lista`);
    assert.ok(slide.texto.length <= MAX_LINHAS_TEXTO, `slide ${slide.n} tem ${slide.texto.length} linhas`);
  }
});

test('nenhum texto tem emoji', () => {
  for (const slide of slides) {
    for (const texto of coletarTextos(slide)) {
      assert.ok(!REGEX_EMOJI.test(texto), `slide ${slide.n} tem emoji em: ${texto}`);
    }
  }
});

test('nenhum texto tem travessão', () => {
  for (const slide of slides) {
    for (const texto of coletarTextos(slide)) {
      assert.ok(!REGEX_TRAVESSAO.test(texto), `slide ${slide.n} tem travessão em: ${texto}`);
    }
  }
});

test('toda atividade citada num slide existe em config.atividades', () => {
  for (const slide of slides) {
    if (slide.atividade === undefined) continue;
    assert.ok(config.atividades[slide.atividade], `slide ${slide.n}: atividade "${slide.atividade}" não existe no config`);
  }
});

test('os slides 37 e 52 mostram o ranking', () => {
  assert.equal(porNumero(37).ranking, 'parcial');
  assert.equal(porNumero(52).ranking, 'final');
});

test('sem QR code: o slide 4 mostra como mostrar a resposta e o 55 mostra o link do Forms em texto', () => {
  assert.equal(porNumero(4).layout, 'instrucoes');
  assert.equal(porNumero(55).layout, 'instrucoes');
  assert.equal(porNumero(55).link, 'forms');
  assert.ok(porNumero(55).link in config.links);
  assert.ok(slides.every((s) => s.qr === undefined));
});

test('o prêmio do 1º lugar de cada atividade é chocolate', () => {
  assert.ok(Object.values(config.atividades).every((a) => /chocolate/i.test(a.premio)));
});

test('o config tem as 8 atividades e 5 ministrantes com cores diferentes', () => {
  assert.deepEqual(Object.keys(config.atividades).sort(), ['1', '2', '3', '4a', '4b', '5a', '5b', 'boss']);
  assert.equal(config.ministrantes.length, 5);
  assert.equal(new Set(config.ministrantes.map((m) => m.cor)).size, 5);
});
