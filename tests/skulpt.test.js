'use strict';

// O editor offline (tecla E) roda Python com o Skulpt. Este teste roda no Skulpt todo código de slide
// que tem `testes` e confere com as mesmas regras de scripts/conferir-gabaritos.py (que usa o Python
// oficial): mesma saída, sem o texto das perguntas do input(), e o mesmo nome de erro nos slides de erro.
// O slide 30 também precisa mostrar a mensagem do IndentationError igual à do slide.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const aoVivo = require('../js/logica/aovivo.js');

const RAIZ = path.join(__dirname, '..');
const PASTA_SECOES = path.join(RAIZ, 'conteudo', 'secoes');
const LIMITE_MS = 5000;

function carregarSkulpt() {
  const contexto = { console, setTimeout, clearTimeout, Promise, Date, Math, JSON };
  contexto.window = contexto;
  contexto.self = contexto;
  vm.createContext(contexto);
  for (const arquivo of ['skulpt.min.js', 'skulpt-stdlib.js']) {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, 'vendor', 'skulpt', arquivo), 'utf8'), contexto, { filename: arquivo });
  }
  return contexto.Sk;
}

function carregarBlocos() {
  const secoes = [];
  const contexto = { PI: { secao: (s) => secoes.push(s) } };
  vm.createContext(contexto);
  for (const arquivo of fs.readdirSync(PASTA_SECOES).filter((a) => a.endsWith('.js')).sort()) {
    vm.runInContext(fs.readFileSync(path.join(PASTA_SECOES, arquivo), 'utf8'), contexto, { filename: arquivo });
  }
  return secoes.flatMap((s) => s.slides).flatMap((slide) =>
    (slide.codigo || []).filter((b) => b.testes && b.testes.length).map((bloco) => ({ slide, bloco })));
}

const Sk = carregarSkulpt();

function rodar(codigo, entradas, limiteMs = LIMITE_MS) {
  const fila = [...(entradas || [])];
  let saida = '';
  Sk.configure({
    output: (texto) => { saida += texto; },
    // Mesma lista branca do motor (js/ui/motor-skulpt.js).
    read: (nome) => {
      if (!aoVivo.moduloPermitido(nome) || !Object.prototype.hasOwnProperty.call(Sk.builtinFiles.files, nome)) {
        throw "File not found: '" + nome + "'";
      }
      return Sk.builtinFiles.files[nome];
    },
    __future__: Sk.python3,
    inputfunTakesPrompt: true,
    inputfun: () => Promise.resolve(fila.shift() || ''),
    yieldLimit: 50,
    killableWhile: true,
    killableFor: true,
  });
  const inicio = Date.now();
  const limite = { '*': () => { if (Date.now() - inicio > limiteMs) { throw new Error('passou de ' + limiteMs + ' ms'); } } };
  return Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, codigo, true), limite)
    .then(() => ({ saida }), (erro) => ({ saida, erro: aoVivo.traduzirErro(String(erro.toString()), codigo) }));
}

function normalizar(texto) {
  const linhas = String(texto || '').replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd());
  while (linhas.length && !linhas[linhas.length - 1]) { linhas.pop(); }
  return linhas.join('\n');
}

const blocos = carregarBlocos();

test('existem blocos de código com testes para conferir no Skulpt', () => {
  assert.ok(blocos.length >= 30, `só ${blocos.length} blocos com testes`);
});

for (const { slide, bloco } of blocos) {
  bloco.testes.forEach((teste, i) => {
    test(`slide ${slide.n}, teste ${i + 1}: o Skulpt dá o mesmo resultado do Python`, async () => {
      if (teste.erro) {
        const trechos = teste.porLinha ? bloco.texto.split('\n').filter((l) => l.trim()) : [bloco.texto];
        const esperados = Array.isArray(teste.erro) ? teste.erro : trechos.map(() => teste.erro);
        for (let k = 0; k < trechos.length; k++) {
          const r = await rodar(trechos[k], teste.entradas);
          assert.ok(r.erro, `esperava ${esperados[k]} em ${JSON.stringify(trechos[k])}, mas rodou sem erro`);
          assert.equal(r.erro.tipo, esperados[k], `em ${JSON.stringify(trechos[k])}: ${r.erro.texto}`);
        }
        return;
      }
      const esperado = teste.saida !== undefined ? teste.saida : bloco.saida;
      const r = await rodar(bloco.texto, teste.entradas);
      assert.equal(r.erro, undefined, r.erro && r.erro.texto);
      assert.equal(normalizar(r.saida), normalizar(esperado));
    });
  });
}

test('no slide 30, o editor offline mostra o mesmo IndentationError que o slide', async () => {
  const { bloco } = blocos.find(({ slide }) => slide.n === 30);
  const r = await rodar(bloco.texto, ['3', '3']);
  assert.equal(r.erro.texto, bloco.saida);
  assert.equal(r.erro.linha, 4);
});

test('o editor offline não importa webbrowser, turtle nem document', async () => {
  for (const modulo of ['webbrowser', 'turtle', 'document']) {
    const r = await rodar('import ' + modulo);
    assert.equal(r.erro && r.erro.tipo, 'ImportError', modulo);
  }
  assert.equal((await rodar('import math\nprint(math.sqrt(9))')).saida.trim(), '3.0');
});

test('o laço infinito para pelo limite de tempo em vez de travar', async () => {
  const r = await rodar('x = 1\nwhile x > 0:\n    x = x + 1', [], 300);
  assert.match(String(r.erro && r.erro.texto), /passou de/);
});
