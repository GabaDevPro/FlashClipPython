'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const realce = require('../js/logica/realce.js');

const tipos = (codigo) => realce.tokenizar(codigo).filter((t) => t.tipo !== 'texto').map((t) => [t.tipo, t.texto]);

test('separa função, string, número e comentário', () => {
  assert.deepEqual(tipos('print("Olá") # oi'), [
    ['funcao', 'print'], ['string', '"Olá"'], ['comentario', '# oi'],
  ]);
  assert.deepEqual(tipos('saldo = 1500'), [['operador', '='], ['numero', '1500']]);
});

test('reconhece palavras-chave e decimais', () => {
  assert.deepEqual(tipos('if x >= 37.5:'), [['palavra-chave', 'if'], ['operador', '>='], ['numero', '37.5']]);
  assert.deepEqual(tipos('preso = False'), [['operador', '='], ['palavra-chave', 'False']]);
});

test('número dentro de nome de variável não vira número', () => {
  assert.deepEqual(tipos('dado1 = 3'), [['operador', '='], ['numero', '3']]);
});

test('# dentro de string não vira comentário', () => {
  assert.deepEqual(tipos('print("# não")'), [['funcao', 'print'], ['string', '"# não"']]);
});

test('lacuna ___ dos esqueletos vira tipo lacuna', () => {
  assert.deepEqual(tipos('saldo = ___'), [['operador', '='], ['lacuna', '___']]);
});

test('juntar os textos dos tokens devolve o código original, com recuo e quebras', () => {
  const codigo = 'if a == b:\n    print("Dupla! Jogue de novo")\nelse:\n    print(\'x\')';
  assert.equal(realce.tokenizar(codigo).map((t) => t.texto).join(''), codigo);
});

test('paraHtml escapa < > & e aspas e marca cada token com a classe do tipo', () => {
  const html = realce.paraHtml('print("<b>&")');
  assert.equal(html, '<span class="tk-funcao">print</span>(<span class="tk-string">&quot;&lt;b&gt;&amp;&quot;</span>)');
});

test('paraHtml de código vazio devolve texto vazio', () => {
  assert.equal(realce.paraHtml(''), '');
});
