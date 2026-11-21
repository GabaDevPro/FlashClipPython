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

const PRIMEIRO_EXTRA = 57;
const ULTIMO_EXTRA = 66;

test('o conteúdo tem 11 seções e 71 slides no total', () => {
  assert.equal(secoes.length, 11);
  assert.equal(slides.length, 71);
});

test('a sequência vai de 1 a 66, com 7b, 18b, 22b e 30b depois do 7, 18, 22 e 30, e o 29 dividido em 29a e 29b', () => {
  const esperado = [];
  for (let i = 1; i <= ULTIMO_EXTRA; i++) {
    if (i === 29) { esperado.push('29a', '29b'); continue; }
    esperado.push(i);
    if ([7, 18, 22, 30].includes(i)) esperado.push(i + 'b');
  }
  assert.deepEqual(slides.map((s) => s.n), esperado);
});

test('a abertura segue a ordem da professora: nós, a linguagem, a história, algoritmo e o OneCompiler por fim', () => {
  const abertura = secoes.find((s) => s.id === '01-abertura').slides;
  assert.deepEqual(Array.from(abertura, (s) => s.titulo), [
    'Python Imobiliário', 'Ministrantes', 'Onde o Python é usado', 'Prazer, Python',
    'Um turno do jogo', 'Regras do jogo', 'Nosso compilador', 'Como mostrar sua resposta',
  ]);
  assert.equal(porNumero(7).link, 'compilador');
});

test('o slide 22b ensina concatenação logo depois da pegadinha do 34', () => {
  const s = porNumero('22b');
  assert.match(s.titulo, /Concatenação/);
  assert.match(s.codigo[0].texto, /" \+ nome \+ "/);
  assert.match(s.codigo[0].texto, /str\(/);
  assert.ok(s.codigo[0].testes.length > 0, 'o exemplo precisa ser conferido pelos gabaritos');
});

test('o desafio do while (5b) conta subindo, de 1 até 3', () => {
  const enunciado = porNumero(45);
  const gabarito = porNumero(46).codigo[0];
  assert.equal(enunciado.atividade, '5b');
  assert.match(enunciado.texto.join(' '), /de 1 até 3/);
  assert.match(gabarito.texto, /while \w+ <= 3:/);
  assert.match(gabarito.texto, /(\w+) = \1 \+ 1/);
  assert.ok(gabarito.saida.startsWith('Turno na prisão: 1\n'));
});

test('o plano B fica numa seção própria depois do Obrigado, com 4 desafios bônus que valem dinheiro', () => {
  const extras = secoes[secoes.length - 1];
  assert.equal(extras.id, '11-extras');
  assert.deepEqual([extras.slides[0].n, extras.slides[extras.slides.length - 1].n], [PRIMEIRO_EXTRA, ULTIMO_EXTRA]);
  const bonus = ['b1', 'b2', 'b3', 'b4'];
  for (const id of bonus) {
    const daAtividade = extras.slides.filter((s) => s.atividade === id);
    assert.deepEqual(Array.from(daAtividade, (s) => s.layout), ['enunciado', 'resposta'], `bônus ${id}`);
    assert.ok(daAtividade[1].codigo[0].testes.length > 0, `gabarito do bônus ${id} sem teste`);
  }
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

test('o slide 55 mostra o link e o QR code do Forms, e nenhum outro slide tem QR', () => {
  assert.equal(porNumero(55).layout, 'instrucoes');
  assert.equal(porNumero(55).link, 'forms');
  assert.equal(porNumero(55).qr, 'forms');
  assert.ok(porNumero(55).link in config.links);
  assert.deepEqual(slides.filter((s) => s.qr !== undefined).map((s) => s.n), [55]);
});

test('o prêmio do 1º lugar de cada atividade é chocolate', () => {
  assert.ok(Object.values(config.atividades).every((a) => /chocolate/i.test(a.premio)));
});

test('o config tem as 8 atividades, os 4 bônus do plano B e 5 ministrantes com cores diferentes', () => {
  assert.deepEqual(Object.keys(config.atividades).sort(), ['1', '2', '3', '4a', '4b', '5a', '5b', 'b1', 'b2', 'b3', 'b4', 'boss']);
  assert.equal(config.ministrantes.length, 5);
  assert.equal(new Set(config.ministrantes.map((m) => m.cor)).size, 5);
});

test('o cronograma segue o programa do evento: bloco 1 de 80 min, intervalo de 10 e bloco 2 de 55', () => {
  const bloco = (n) => config.cronograma.filter((c) => c.bloco === n);
  const intervalo = config.cronograma.find((c) => c.etapa === 'Intervalo');
  assert.equal(config.tempos.intervalo, 10);
  assert.equal(intervalo.fimMin - intervalo.inicioMin, 10);
  assert.equal(Math.max(...bloco(1).filter((c) => c !== intervalo).map((c) => c.fimMin)), 80);
  assert.equal(Math.max(...bloco(2).map((c) => c.fimMin)), 55);
  assert.equal(config.aula.inicio, '14:00');
});

test('cada seção ocupa a mesma janela da linha correspondente do cronograma', () => {
  for (const s of secoes) {
    const linha = config.cronograma.find((c) => c.bloco === s.bloco && c.inicioMin === s.inicioMin);
    assert.ok(linha, `seção ${s.id} sem linha no cronograma`);
    assert.equal(linha.fimMin, s.fimMin, `seção ${s.id}`);
  }
});
