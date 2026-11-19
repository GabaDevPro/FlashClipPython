'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const ed = require('../js/logica/edicao.js');

function slidesBase() {
  return [
    { n: 1, indice: 0, layout: 'capa', titulo: 'Capa', secaoId: 's1', secaoTitulo: 'Abertura', bloco: 1 },
    {
      n: '7b', indice: 1, layout: 'conceito', titulo: 'Sete', texto: ['a', 'b'],
      itens: [{ titulo: 'i0', texto: 't0', rotulo: 'r0' }],
      codigo: [{ rotulo: 'c', linguagem: 'python', texto: 'x = 1', saida: '' }],
      secaoId: 's2', secaoTitulo: 'Meio', bloco: 2
    },
    { n: 8, indice: 2, layout: 'conceito', titulo: 'Oito', secaoId: 's2', secaoTitulo: 'Meio', bloco: 2 }
  ];
}

test('constantes têm os valores combinados', () => {
  assert.equal(ed.CHAVE, 'pi:edicao:v1');
  assert.equal(ed.MAX_TEXTO, 300);
  assert.equal(ed.MAX_CODIGO, 4000);
  assert.equal(ed.MAX_LINHAS, 3);
  assert.equal(ed.MAX_NOVOS, 40);
});

test('criar devolve estado vazio novo a cada chamada', () => {
  assert.deepEqual(ed.criar(), { slides: {}, novos: [] });
  assert.notEqual(ed.criar(), ed.criar());
});

test('caminhoValido aceita só os caminhos editáveis', () => {
  const ok = ['titulo', 'texto.0', 'texto.2', 'itens.0.titulo', 'itens.19.texto', 'itens.3.rotulo',
    'codigo.0.texto', 'codigo.9.saida', 'codigo.5.rotulo'];
  const ruim = ['layout', 'n', '__proto__', 'texto.3', 'itens.20.titulo', 'codigo.10.texto',
    'codigo.0.linguagem', 'itens.0.imagem', 'titulo.x', '', 'texto', 'texto.-1', 'itens.01.titulo',
    null, undefined, 5];
  for (const c of ok) { assert.equal(ed.caminhoValido(c), true, String(c)); }
  for (const c of ruim) { assert.equal(ed.caminhoValido(c), false, String(c)); }
});

test('limite é MAX_CODIGO para código e saída e MAX_TEXTO para o resto', () => {
  assert.equal(ed.limite('codigo.1.texto'), 4000);
  assert.equal(ed.limite('codigo.1.saida'), 4000);
  assert.equal(ed.limite('codigo.1.rotulo'), 300);
  assert.equal(ed.limite('titulo'), 300);
  assert.equal(ed.limite('itens.0.texto'), 300);
});

test('normalizar aceita objeto e string JSON válidos', () => {
  const bruto = { slides: { '7B': { campos: { titulo: 'Novo' }, oculto: true } }, novos: [] };
  const esperado = { slides: { '7b': { campos: { titulo: 'Novo' }, oculto: true } }, novos: [] };
  assert.deepEqual(ed.normalizar(bruto), esperado);
  assert.deepEqual(ed.normalizar(JSON.stringify(bruto)), esperado);
});

test('normalizar recusa JSON inválido e entradas que não são objeto', () => {
  for (const v of ['{', 'texto', null, undefined, 5, [], '[]', 'null', true]) {
    assert.equal(ed.normalizar(v), null, String(v));
  }
});

test('normalizar recusa slides ou novos com formato errado', () => {
  assert.equal(ed.normalizar({ slides: [], novos: [] }), null);
  assert.equal(ed.normalizar({ slides: null, novos: [] }), null);
  assert.equal(ed.normalizar({ slides: {}, novos: {} }), null);
  assert.equal(ed.normalizar({ slides: {} }), null);
  assert.equal(ed.normalizar({ novos: [] }), null);
});

test('normalizar recusa mais de MAX_NOVOS novos e aceita exatamente MAX_NOVOS', () => {
  const faz = (q) => Array.from({ length: q }, (_, i) => ({ n: '1+' + (i + 1), depoisDe: '1', modelo: 'texto' }));
  assert.equal(ed.normalizar({ slides: {}, novos: faz(41) }), null);
  assert.equal(ed.normalizar({ slides: {}, novos: faz(40) }).novos.length, 40);
});

test('normalizar recusa chave de slide fora do padrão', () => {
  for (const chave of ['', 'abcde', '7-b', '7+', '7+123', '+1', 'a b', '7+1+2']) {
    const r = ed.normalizar({ slides: { [chave]: { campos: { titulo: 'x' } } }, novos: [] });
    assert.equal(r, null, chave);
  }
  assert.notEqual(ed.normalizar({ slides: { '22B+12': { campos: { titulo: 'x' } } }, novos: [] }), null);
});

test('normalizar recusa campos malformados', () => {
  const com = (entrada) => ed.normalizar({ slides: { 1: entrada }, novos: [] });
  assert.equal(com({ campos: [] }), null);
  assert.equal(com({ campos: 'x' }), null);
  assert.equal(com({ campos: { layout: 'x' } }), null);
  assert.equal(com({ campos: { titulo: 5 } }), null);
  assert.equal(com({ campos: { titulo: 'a' }, oculto: 'sim' }), null);
  assert.equal(com(null), null);
  assert.equal(com('x'), null);
});

test('normalizar trata campos ausentes como vazios e descarta entrada sem nada', () => {
  assert.deepEqual(ed.normalizar({ slides: { 1: {}, 2: { oculto: false }, 3: { campos: {} } }, novos: [] }),
    { slides: {}, novos: [] });
  assert.deepEqual(ed.normalizar({ slides: { 4: { oculto: true } }, novos: [] }),
    { slides: { 4: { campos: {}, oculto: true } }, novos: [] });
});

test('normalizar trunca strings acima do limite e descarta campos extras', () => {
  const r = ed.normalizar({
    extra: 1,
    slides: {
      1: {
        extra: 2,
        campos: { titulo: 'a'.repeat(500), 'codigo.0.texto': 'b'.repeat(5000) },
        oculto: false
      }
    },
    novos: [{ n: '1+1', depoisDe: '1', modelo: 'codigo', extra: 3 }]
  });
  assert.equal(r.slides['1'].campos.titulo.length, 300);
  assert.equal(r.slides['1'].campos['codigo.0.texto'].length, 4000);
  assert.deepEqual(Object.keys(r.slides['1']).sort(), ['campos', 'oculto']);
  assert.deepEqual(r.novos, [{ n: '1+1', depoisDe: '1', modelo: 'codigo' }]);
  assert.deepEqual(Object.keys(r), ['slides', 'novos']);
});

test('normalizar recusa novos malformados e repetidos', () => {
  const novos = (lista) => ed.normalizar({ slides: {}, novos: lista });
  assert.equal(novos([null]), null);
  assert.equal(novos(['x']), null);
  assert.equal(novos([{ depoisDe: '1', modelo: 'texto' }]), null);
  assert.equal(novos([{ n: '1', depoisDe: '1', modelo: 'texto' }]), null);
  assert.equal(novos([{ n: '1+1', modelo: 'texto' }]), null);
  assert.equal(novos([{ n: '1+1', depoisDe: 'xx yy', modelo: 'texto' }]), null);
  assert.equal(novos([{ n: '1+1', depoisDe: '1', modelo: 'video' }]), null);
  assert.equal(novos([{ n: 5, depoisDe: '1', modelo: 'texto' }]), null);
  assert.equal(novos([
    { n: '1+1', depoisDe: '1', modelo: 'texto' },
    { n: '1+1', depoisDe: '2', modelo: 'texto' }
  ]), null);
  // Maiúsculas viram minúsculas; o novo que depende de outro novo vem depois dele na lista.
  assert.deepEqual(novos([{ n: '7B+1', depoisDe: '7B', modelo: 'texto' }, { n: '7B+2', depoisDe: '7B+1', modelo: 'texto' }]).novos,
    [{ n: '7b+1', depoisDe: '7b', modelo: 'texto' }, { n: '7b+2', depoisDe: '7b+1', modelo: 'texto' }]);
});

test('normalizar não muda o objeto de entrada', () => {
  const bruto = { slides: { '7B': { campos: { titulo: 'a'.repeat(400) } } }, novos: [] };
  const copia = JSON.parse(JSON.stringify(bruto));
  ed.normalizar(bruto);
  assert.deepEqual(bruto, copia);
});

test('comCampo grava o valor sem mudar o estado original', () => {
  const alt = ed.criar();
  const novo = ed.comCampo(alt, 7, 'titulo', 'Olá');
  assert.deepEqual(alt, { slides: {}, novos: [] });
  assert.deepEqual(novo.slides['7'], { campos: { titulo: 'Olá' }, oculto: false });
});

test('comCampo converte para string, trunca e preserva outros campos e o oculto', () => {
  let alt = ed.comOculto(ed.criar(), '7b', true);
  alt = ed.comCampo(alt, '7b', 'texto.0', 'um');
  alt = ed.comCampo(alt, '7b', 'texto.1', 42);
  alt = ed.comCampo(alt, '7b', 'titulo', 'x'.repeat(999));
  alt = ed.comCampo(alt, '7b', 'codigo.0.texto', 'y'.repeat(9999));
  const e = alt.slides['7b'];
  assert.equal(e.oculto, true);
  assert.equal(e.campos['texto.0'], 'um');
  assert.equal(e.campos['texto.1'], '42');
  assert.equal(e.campos.titulo.length, 300);
  assert.equal(e.campos['codigo.0.texto'].length, 4000);
});

test('comCampo com chave maiúscula grava em minúsculas e trata null como vazio', () => {
  const alt = ed.comCampo(ed.criar(), '7B', 'titulo', null);
  assert.equal(alt.slides['7b'].campos.titulo, '');
});

test('comCampo com caminho inválido devolve o mesmo estado', () => {
  const alt = ed.criar();
  assert.equal(ed.comCampo(alt, 1, 'layout', 'x'), alt);
  assert.equal(ed.comCampo(alt, 1, '__proto__', 'x'), alt);
});

test('comOculto marca e desmarca sem mutar e descarta entrada vazia ao desmarcar', () => {
  const alt = ed.criar();
  const marcado = ed.comOculto(alt, 3, true);
  assert.deepEqual(alt, { slides: {}, novos: [] });
  assert.equal(marcado.slides['3'].oculto, true);
  const desmarcado = ed.comOculto(marcado, 3, false);
  assert.equal(marcado.slides['3'].oculto, true);
  assert.deepEqual(desmarcado.slides, {});
  const comCampo = ed.comOculto(ed.comCampo(marcado, 3, 'titulo', 'x'), 3, false);
  assert.deepEqual(comCampo.slides['3'], { campos: { titulo: 'x' }, oculto: false });
});

test('semAlteracoes tira só a entrada de um slide comum', () => {
  let alt = ed.comCampo(ed.criar(), 1, 'titulo', 'a');
  alt = ed.comCampo(alt, 2, 'titulo', 'b');
  const r = ed.semAlteracoes(alt, 1);
  assert.deepEqual(Object.keys(r.slides), ['2']);
  assert.deepEqual(Object.keys(alt.slides), ['1', '2']);
});

test('semAlteracoes de slide novo remove também os dependentes em cascata', () => {
  let alt = ed.criar();
  const a = ed.comNovo(alt, '5', 'texto'); alt = a.alt;
  const b = ed.comNovo(alt, a.n, 'texto'); alt = b.alt;
  const c = ed.comNovo(alt, b.n, 'codigo'); alt = c.alt;
  const d = ed.comNovo(alt, '5', 'texto'); alt = d.alt;
  alt = ed.comCampo(alt, b.n, 'titulo', 'x');
  alt = ed.comCampo(alt, c.n, 'titulo', 'y');
  alt = ed.comCampo(alt, d.n, 'titulo', 'z');
  const r = ed.semAlteracoes(alt, a.n);
  assert.deepEqual(r.novos.map((x) => x.n), [d.n]);
  assert.deepEqual(Object.keys(r.slides), [d.n]);
  assert.equal(alt.novos.length, 4);
});

test('semAlteracoes de n desconhecido devolve estado equivalente', () => {
  const alt = ed.comCampo(ed.criar(), 1, 'titulo', 'a');
  assert.deepEqual(ed.semAlteracoes(alt, 99), alt);
});

test('comNovo cria 5+1 e depois 5+2 e insere no fim da lista', () => {
  const a = ed.comNovo(ed.criar(), 5, 'texto');
  assert.equal(a.n, '5+1');
  assert.deepEqual(a.alt.novos, [{ n: '5+1', depoisDe: '5', modelo: 'texto' }]);
  const b = ed.comNovo(a.alt, '5', 'codigo');
  assert.equal(b.n, '5+2');
  assert.deepEqual(b.alt.novos.map((x) => x.n), ['5+1', '5+2']);
  assert.deepEqual(a.alt.novos.length, 1);
});

test('comNovo usa a BASE do depoisDe e reaproveita o menor K livre', () => {
  const a = ed.comNovo(ed.criar(), '7B', 'texto');
  assert.equal(a.n, '7b+1');
  const b = ed.comNovo(a.alt, a.n, 'texto');
  assert.equal(b.n, '7b+2');
  assert.equal(b.alt.novos[1].depoisDe, '7b+1');
  const semUm = ed.semAlteracoes(b.alt, '7b+1');
  assert.equal(ed.comNovo(semUm, '7b', 'texto').n, '7b+1');
});

test('comNovo com modelo inválido ou limite atingido devolve n nulo sem mudança', () => {
  const alt = ed.criar();
  const r = ed.comNovo(alt, 1, 'video');
  assert.equal(r.alt, alt);
  assert.equal(r.n, null);
  let cheio = ed.criar();
  for (let i = 1; i <= 40; i += 1) { cheio = ed.comNovo(cheio, i, 'texto').alt; }
  assert.equal(cheio.novos.length, 40);
  const r2 = ed.comNovo(cheio, 1, 'texto');
  assert.equal(r2.alt, cheio);
  assert.equal(r2.n, null);
});

test('contar soma slides alterados e novos sem entrada', () => {
  assert.equal(ed.contar(ed.criar()), 0);
  let alt = ed.comCampo(ed.criar(), 1, 'titulo', 'a');
  alt = ed.comOculto(alt, 2, true);
  assert.equal(ed.contar(alt), 2);
  const n = ed.comNovo(alt, 1, 'texto');
  assert.equal(ed.contar(n.alt), 3);
  const editado = ed.comCampo(n.alt, n.n, 'titulo', 'b');
  assert.equal(ed.contar(editado), 3);
});

test('modeloNovo devolve objetos novos para texto e código', () => {
  assert.deepEqual(ed.modeloNovo('texto'), { layout: 'conceito', titulo: 'Novo slide', texto: ['Escreva aqui.'] });
  assert.deepEqual(ed.modeloNovo('codigo'), {
    layout: 'conceito', titulo: 'Novo slide',
    codigo: [{ rotulo: 'Exemplo', linguagem: 'python', texto: 'print("Olá")', saida: 'Olá' }]
  });
  assert.notEqual(ed.modeloNovo('texto'), ed.modeloNovo('texto'));
  assert.equal(ed.modeloNovo('outro'), null);
});

test('aplicar sem alterações devolve cópia com os mesmos slides e indices', () => {
  const slides = slidesBase();
  const r = ed.aplicar(slides, ed.criar(), {});
  assert.deepEqual(r, slides);
  assert.notEqual(r, slides);
});

test('aplicar troca título, texto, item e código sem mutar a entrada', () => {
  const slides = slidesBase();
  const copia = JSON.parse(JSON.stringify(slides));
  let alt = ed.comCampo(ed.criar(), '7b', 'titulo', 'Novo título');
  alt = ed.comCampo(alt, '7B', 'texto.1', 'segundo');
  alt = ed.comCampo(alt, '7b', 'itens.0.titulo', 'it');
  alt = ed.comCampo(alt, '7b', 'itens.0.rotulo', 'rr');
  alt = ed.comCampo(alt, '7b', 'codigo.0.saida', 'ok');
  alt = ed.comCampo(alt, '7b', 'codigo.0.texto', 'x = 2');
  const r = ed.aplicar(slides, alt);
  assert.deepEqual(slides, copia);
  assert.equal(r[1].titulo, 'Novo título');
  assert.deepEqual(r[1].texto, ['a', 'segundo']);
  assert.equal(r[1].itens[0].titulo, 'it');
  assert.equal(r[1].itens[0].rotulo, 'rr');
  assert.equal(r[1].codigo[0].saida, 'ok');
  assert.equal(r[1].codigo[0].texto, 'x = 2');
  assert.notEqual(r[1].itens, slides[1].itens);
  assert.notEqual(r[1].codigo[0], slides[1].codigo[0]);
});

test('aplicar cria a lista de texto e preenche posições vazias com string vazia', () => {
  const alt = ed.comCampo(ed.criar(), 8, 'texto.2', 'fim');
  const r = ed.aplicar(slidesBase(), alt);
  assert.deepEqual(r[2].texto, ['', '', 'fim']);
});

test('aplicar ignora item ou código que não existe e entrada de slide ausente', () => {
  let alt = ed.comCampo(ed.criar(), 8, 'itens.0.titulo', 'x');
  alt = ed.comCampo(alt, 8, 'codigo.0.texto', 'x');
  alt = ed.comCampo(alt, '7b', 'itens.3.texto', 'x');
  alt = ed.comCampo(alt, '7b', 'codigo.2.saida', 'x');
  alt = ed.comCampo(alt, 999, 'titulo', 'x');
  const r = ed.aplicar(slidesBase(), alt);
  assert.deepEqual(r, slidesBase());
});

test('aplicar ignora caminho inválido que tenha vindo de estado malformado', () => {
  const alt = { slides: { 8: { campos: { layout: 'capa', 'texto.7': 'x' }, oculto: false } }, novos: [] };
  assert.deepEqual(ed.aplicar(slidesBase(), alt), slidesBase());
});

test('aplicar insere novos depois da âncora, copiando seção e bloco', () => {
  let alt = ed.criar();
  const a = ed.comNovo(alt, '7b', 'texto'); alt = a.alt;
  const b = ed.comNovo(alt, a.n, 'codigo'); alt = b.alt;
  const c = ed.comNovo(alt, 1, 'texto'); alt = c.alt;
  const r = ed.aplicar(slidesBase(), alt);
  assert.deepEqual(r.map((s) => String(s.n)), ['1', '1+1', '7b', '7b+1', '7b+2', '8']);
  assert.deepEqual(r.map((s) => s.indice), [0, 1, 2, 3, 4, 5]);
  assert.equal(r[3].novo, true);
  assert.equal(r[3].secaoId, 's2');
  assert.equal(r[3].secaoTitulo, 'Meio');
  assert.equal(r[3].bloco, 2);
  assert.equal(r[3].titulo, 'Novo slide');
  assert.ok(r[4].codigo);
  assert.equal(r[1].secaoId, 's1');
  assert.equal(r[0].novo, undefined);
});

test('aplicar ignora novo sem âncora e novos não compartilham o modelo', () => {
  const alt = { slides: {}, novos: [{ n: '99+1', depoisDe: '99', modelo: 'texto' }] };
  assert.equal(ed.aplicar(slidesBase(), alt).length, 3);
  const dois = ed.comNovo(ed.comNovo(ed.criar(), 1, 'texto').alt, 8, 'texto').alt;
  const r = ed.aplicar(slidesBase(), dois);
  r[1].texto[0] = 'mudou';
  assert.equal(r[r.length - 1].texto[0], 'Escreva aqui.');
});

test('aplicar edita slide novo e preserva o modelo para campos inexistentes', () => {
  const a = ed.comNovo(ed.criar(), 1, 'codigo');
  const alt = ed.comCampo(a.alt, a.n, 'codigo.0.texto', 'print(1)');
  const r = ed.aplicar(slidesBase(), alt);
  assert.equal(r[1].codigo[0].texto, 'print(1)');
  assert.equal(r[1].codigo[0].linguagem, 'python');
});

test('aplicar remove ocultos por padrão e mantém com incluirOcultos', () => {
  const alt = ed.comOculto(ed.criar(), '7b', true);
  const sem = ed.aplicar(slidesBase(), alt);
  assert.deepEqual(sem.map((s) => String(s.n)), ['1', '8']);
  assert.deepEqual(sem.map((s) => s.indice), [0, 1]);
  const com = ed.aplicar(slidesBase(), alt, { incluirOcultos: true });
  assert.equal(com.length, 3);
  assert.equal(com[1].oculto, true);
  assert.deepEqual(com.map((s) => s.indice), [0, 1, 2]);
  assert.equal(ed.aplicar(slidesBase(), alt, { incluirOcultos: 'sim' }).length, 2);
});

test('aplicar com entrada oculta false não marca o slide', () => {
  const alt = ed.comCampo(ed.criar(), 8, 'titulo', 'Z');
  const r = ed.aplicar(slidesBase(), alt, { incluirOcultos: true });
  assert.equal(r[2].oculto, undefined);
});

test('aplicar reatribui indice mesmo com lista de entrada fora de ordem de indice', () => {
  const slides = slidesBase().map((s) => ({ ...s, indice: 99 }));
  const r = ed.aplicar(slides, ed.criar());
  assert.deepEqual(r.map((s) => s.indice), [0, 1, 2]);
  assert.equal(slides[0].indice, 99);
});

test('valorDe devolve o valor atual do caminho ou string vazia', () => {
  const s = slidesBase()[1];
  assert.equal(ed.valorDe(s, 'titulo'), 'Sete');
  assert.equal(ed.valorDe(s, 'texto.1'), 'b');
  assert.equal(ed.valorDe(s, 'texto.2'), '');
  assert.equal(ed.valorDe(s, 'itens.0.rotulo'), 'r0');
  assert.equal(ed.valorDe(s, 'itens.1.titulo'), '');
  assert.equal(ed.valorDe(s, 'codigo.0.texto'), 'x = 1');
  assert.equal(ed.valorDe(s, 'codigo.0.saida'), '');
  assert.equal(ed.valorDe(slidesBase()[0], 'texto.0'), '');
  assert.equal(ed.valorDe(slidesBase()[0], 'codigo.0.texto'), '');
  assert.equal(ed.valorDe(slidesBase()[0], 'itens.0.texto'), '');
  assert.equal(ed.valorDe(s, 'layout'), '');
  assert.equal(ed.valorDe(null, 'titulo'), '');
  assert.equal(ed.valorDe({ titulo: 5 }, 'titulo'), '');
});

test('exportar gera JSON com 2 espaços que normalizar lê de volta', () => {
  const alt = ed.comNovo(ed.comCampo(ed.criar(), 1, 'titulo', 'a'), 1, 'texto').alt;
  const json = ed.exportar(alt);
  assert.equal(json, JSON.stringify(alt, null, 2));
  assert.deepEqual(ed.normalizar(json), alt);
});

test('nomeArquivo usa a data local com zeros à esquerda', () => {
  assert.equal(ed.nomeArquivo(new Date(2026, 0, 5, 7, 3)), 'alteracoes-slides-2026-01-05-0703.json');
  assert.equal(ed.nomeArquivo(new Date(2026, 10, 18, 14, 45)), 'alteracoes-slides-2026-11-18-1445.json');
});

test('desfazer um slide comum não apaga os slides novos criados depois dele', () => {
  let alt = ed.comCampo(ed.criar(), '7b', 'titulo', 'mudado');
  const novo = ed.comNovo(alt, '7b', 'texto'); alt = novo.alt;
  const r = ed.semAlteracoes(alt, '7b');
  assert.deepEqual(Object.keys(r.slides), []);
  assert.deepEqual(r.novos.map((x) => x.n), [novo.n]);
});

test('aplicar nunca devolve a apresentação vazia: com todos escondidos, ignora o esconder', () => {
  let alt = ed.criar();
  for (const n of [1, '7b', 8]) { alt = ed.comOculto(alt, n, true); }
  const r = ed.aplicar(slidesBase(), alt);
  assert.deepEqual(r.map((s) => s.n), [1, '7b', 8]);
  assert.deepEqual(r.map((s) => s.indice), [0, 1, 2]);
});

test('código e saída guardam no máximo MAX_LINHAS_CODIGO linhas', () => {
  const longo = Array.from({ length: ed.MAX_LINHAS_CODIGO + 5 }, (_, i) => 'print(' + i + ')').join('\n');
  const alt = ed.comCampo(ed.criar(), '7b', 'codigo.0.texto', longo);
  assert.equal(alt.slides['7b'].campos['codigo.0.texto'].split('\n').length, ed.MAX_LINHAS_CODIGO);
  const importado = ed.normalizar({ slides: { '7b': { campos: { 'codigo.0.saida': longo } } }, novos: [] });
  assert.equal(importado.slides['7b'].campos['codigo.0.saida'].split('\n').length, ed.MAX_LINHAS_CODIGO);
  assert.equal(ed.comCampo(ed.criar(), '7b', 'titulo', 'a\nb').slides['7b'].campos.titulo, 'a\nb');
});

test('normalizar recusa slide novo que depende de outro novo que ainda não apareceu na lista', () => {
  const fora = { slides: {}, novos: [{ n: '5+2', depoisDe: '5+1', modelo: 'texto' }, { n: '5+1', depoisDe: '5', modelo: 'texto' }] };
  assert.equal(ed.normalizar(fora), null);
  const certo = { slides: {}, novos: [{ n: '5+1', depoisDe: '5', modelo: 'texto' }, { n: '5+2', depoisDe: '5+1', modelo: 'texto' }] };
  assert.ok(ed.normalizar(certo));
});

test('normalizar recusa mais de MAX_ALTERADOS slides alterados', () => {
  const slides = {};
  for (let i = 0; i <= ed.MAX_ALTERADOS; i++) { slides[String(i)] = { campos: { titulo: 't' } }; }
  assert.equal(ed.normalizar({ slides, novos: [] }), null);
  delete slides['0'];
  assert.ok(ed.normalizar({ slides, novos: [] }));
});
