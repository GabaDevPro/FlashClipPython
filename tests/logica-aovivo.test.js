'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const av = require('../js/logica/aovivo.js');

test('exporta as constantes e se registra em PI.aoVivo', () => {
  assert.equal(av.MAX_CODIGO, 20000);
  assert.equal(av.MAX_CONTADOR, 1e9);
  assert.equal(av.ORIGEM_ONECOMPILER, 'https://onecompiler.com');
  assert.equal(av.CHAVE, 'pi:aovivo:v2');
  assert.equal(globalThis.PI.aoVivo, av);
});

test('exporta só a API nova, sem restos do editor offline', () => {
  assert.deepEqual(Object.keys(av).sort(), [
    'CHAVE', 'MAX_CODIGO', 'MAX_CONTADOR', 'ORIGEM_ONECOMPILER',
    'abrir', 'codigoDaMensagem', 'codigoDoSlide', 'codigosDoSlide', 'comCodigo', 'criar', 'fechar',
    'mensagemCodigo', 'mensagemRodar', 'mesmoCodigo', 'normalizar', 'pedir',
    'proximoComCodigo', 'urlOneCompiler'
  ].sort());
});

// ---------- criar e normalizar ----------

test('criar devolve o estado inicial fechado e sem pedido', () => {
  assert.deepEqual(av.criar(), { aberto: false, codigo: '', versao: 0, autor: 'principal', pedido: null });
});

test('criar devolve objetos independentes a cada chamada', () => {
  const a = av.criar();
  a.codigo = 'x';
  assert.equal(av.criar().codigo, '');
});

test('normalizar aceita um estado válido e o devolve como objeto novo', () => {
  const e = av.criar();
  const n = av.normalizar(e);
  assert.deepEqual(n, e);
  assert.notEqual(n, e);
});

test('normalizar aceita string JSON e recusa JSON inválido', () => {
  const e = av.abrir(av.criar(), 'print(1)', 'painel');
  assert.deepEqual(av.normalizar(JSON.stringify(e)), e);
  assert.equal(av.normalizar('{nao e json'), null);
});

test('normalizar recusa null, undefined, número, array e valores que não são objeto', () => {
  for (const v of [null, undefined, 3, true, [], '[]', '3', 'null']) {
    assert.equal(av.normalizar(v), null, String(v));
  }
});

test('normalizar recusa campo com tipo errado ou valor fora da lista', () => {
  const base = av.criar();
  const ruins = [
    { aberto: 'sim' }, { codigo: 5 }, { versao: -1 }, { versao: 1.5 }, { versao: '1' },
    { autor: 'outro' }, { pedido: 'x' }, { pedido: 3 },
    { pedido: { id: 0, acao: 'rodar' } },
    { pedido: { id: 1.5, acao: 'rodar' } },
    { pedido: { id: '1', acao: 'rodar' } },
    { pedido: { id: 1, acao: 'dancar' } },
    { pedido: { id: 1, acao: 'parar' } },
    { pedido: { id: 1 } }
  ];
  for (const mudanca of ruins) {
    assert.equal(av.normalizar(Object.assign({}, base, mudanca)), null, JSON.stringify(mudanca));
  }
});

test('normalizar aceita os dois autores e a ação rodar', () => {
  for (const autor of ['principal', 'painel']) {
    assert.equal(av.normalizar(Object.assign(av.criar(), { autor: autor })).autor, autor);
  }
  const e = av.pedir(av.criar(), 'rodar', 'painel');
  assert.deepEqual(av.normalizar(e).pedido, { id: 1, acao: 'rodar' });
});

test('normalizar trunca o código', () => {
  const e = av.criar();
  e.codigo = 'a'.repeat(av.MAX_CODIGO + 10);
  assert.equal(av.normalizar(e).codigo.length, av.MAX_CODIGO);
  assert.equal(e.codigo.length, av.MAX_CODIGO + 10);
});

test('normalizar descarta campos extras, inclusive os antigos motor e execucao', () => {
  const e = av.pedir(av.criar(), 'rodar', 'principal');
  const sujo = Object.assign({}, e, {
    extra: 1, motor: 'offline',
    execucao: { estado: 'parado', saida: '', pergunta: '', erroLinha: null }
  });
  sujo.pedido = Object.assign({}, e.pedido, { valor: 'x', lixo: 3 });
  assert.deepEqual(av.normalizar(sujo), e);
});

test('normalizar trata pedido ausente ou null como null', () => {
  const e = av.criar();
  delete e.pedido;
  assert.equal(av.normalizar(e).pedido, null);
  assert.equal(av.normalizar(Object.assign(av.criar(), { pedido: null })).pedido, null);
});

test('normalizar recusa versão e id de pedido acima do teto, que travariam os pedidos seguintes', () => {
  const bom = av.criar();
  assert.equal(av.normalizar(Object.assign({}, bom, { versao: Math.pow(2, 53) })), null);
  assert.equal(av.normalizar(Object.assign({}, bom, { versao: av.MAX_CONTADOR + 1 })), null);
  assert.ok(av.normalizar(Object.assign({}, bom, { versao: av.MAX_CONTADOR })));
  assert.equal(av.normalizar(Object.assign({}, bom, { pedido: { id: av.MAX_CONTADOR + 1, acao: 'rodar' } })), null);
  assert.ok(av.normalizar(Object.assign({}, bom, { pedido: { id: av.MAX_CONTADOR, acao: 'rodar' } })));
});

// ---------- transições ----------

test('abrir liga o editor, define código e autor e sobe a versão', () => {
  const e = av.criar();
  const n = av.abrir(e, 'print(1)', 'painel');
  assert.equal(n.aberto, true);
  assert.equal(n.codigo, 'print(1)');
  assert.equal(n.autor, 'painel');
  assert.equal(n.versao, 1);
  assert.equal(e.aberto, false);
  assert.equal(e.versao, 0);
});

test('abrir trunca o código, autor desconhecido vira principal e código nulo vira vazio', () => {
  const n = av.abrir(av.criar(), 'a'.repeat(av.MAX_CODIGO + 5), 'zzz');
  assert.equal(n.codigo.length, av.MAX_CODIGO);
  assert.equal(n.autor, 'principal');
  assert.equal(av.abrir(av.criar(), undefined, 'principal').codigo, '');
  assert.equal(av.abrir(av.criar(), null, 'principal').codigo, '');
});

test('fechar desliga o editor e guarda o autor', () => {
  const aberto = av.abrir(av.criar(), 'x', 'principal');
  const n = av.fechar(aberto, 'painel');
  assert.equal(n.aberto, false);
  assert.equal(n.autor, 'painel');
  assert.equal(n.versao, 2);
  assert.equal(n.codigo, 'x');
  assert.equal(aberto.aberto, true);
});

test('comCodigo troca o código truncado, o autor e sobe a versão', () => {
  const e = av.criar();
  const n = av.comCodigo(e, 'b'.repeat(av.MAX_CODIGO + 1), 'painel');
  assert.equal(n.codigo.length, av.MAX_CODIGO);
  assert.equal(n.autor, 'painel');
  assert.equal(n.versao, 1);
  assert.equal(e.codigo, '');
  assert.equal(av.comCodigo(e, undefined, 'x').codigo, '');
  assert.equal(av.comCodigo(e, undefined, 'x').autor, 'principal');
});

test('pedir cria o pedido com id igual à nova versão e preserva o resto', () => {
  const e = av.comCodigo(av.criar(), 'x', 'principal');
  const n = av.pedir(e, 'rodar', 'painel');
  assert.deepEqual(n.pedido, { id: 2, acao: 'rodar' });
  assert.equal(n.versao, 2);
  assert.equal(n.autor, 'painel');
  assert.equal(n.codigo, 'x');
  assert.equal(e.pedido, null);
  assert.equal(av.pedir(e, 'rodar', 'zzz').autor, 'principal');
});

test('transições não alteram o estado de entrada', () => {
  const e = av.pedir(av.criar(), 'rodar', 'principal');
  const copia = JSON.parse(JSON.stringify(e));
  av.abrir(e, 'a', 'painel');
  av.fechar(e, 'painel');
  av.comCodigo(e, 'b', 'painel');
  av.pedir(e, 'rodar', 'painel');
  assert.deepEqual(e, copia);
});

// ---------- slides ----------

test('codigoDoSlide devolve o texto do primeiro bloco python', () => {
  const slide = { codigo: [
    { linguagem: 'text', texto: 'saída' },
    { linguagem: 'python', texto: 'print(1)' },
    { linguagem: 'python', texto: 'print(2)' }
  ] };
  assert.equal(av.codigoDoSlide(slide), 'print(1)');
});

test('codigoDoSlide devolve vazio sem slide, sem código ou sem bloco python', () => {
  assert.equal(av.codigoDoSlide(null), '');
  assert.equal(av.codigoDoSlide(undefined), '');
  assert.equal(av.codigoDoSlide({}), '');
  assert.equal(av.codigoDoSlide({ codigo: [] }), '');
  assert.equal(av.codigoDoSlide({ codigo: [{ linguagem: 'text', texto: 'x' }] }), '');
  assert.equal(av.codigoDoSlide({ codigo: [{ linguagem: 'python' }] }), '');
});

test('codigosDoSlide lista os blocos python em ordem com rótulo, texto, saída e entradas', () => {
  const entradas = ['3', '4'];
  const slide = { codigo: [
    { linguagem: 'text', texto: 'ignorado' },
    { linguagem: 'python', rotulo: 'A', texto: 'print(1)', saida: '1',
      testes: [{ nome: 'sem' }, { entradas: entradas }, { entradas: ['9'] }] },
    { linguagem: 'python', texto: 'print(2)' }
  ] };
  const r = av.codigosDoSlide(slide);
  assert.deepEqual(r, [
    { rotulo: 'A', texto: 'print(1)', saida: '1', entradas: ['3', '4'] },
    { rotulo: '', texto: 'print(2)', saida: null, entradas: [] }
  ]);
  assert.notEqual(r[0].entradas, entradas);
});

test('codigosDoSlide usa valores padrão para campos ausentes e devolve [] sem código', () => {
  assert.deepEqual(av.codigosDoSlide({ codigo: [{ linguagem: 'python' }] }),
    [{ rotulo: '', texto: '', saida: null, entradas: [] }]);
  assert.deepEqual(av.codigosDoSlide({ codigo: [{ linguagem: 'python', testes: 'x' }, null] }),
    [{ rotulo: '', texto: '', saida: null, entradas: [] }]);
  assert.deepEqual(av.codigosDoSlide(null), []);
  assert.deepEqual(av.codigosDoSlide({}), []);
  assert.deepEqual(av.codigosDoSlide({ codigo: [{ linguagem: 'text', texto: 'x' }] }), []);
});

test('proximoComCodigo acha o primeiro slide com python a partir do índice', () => {
  const py = { codigo: [{ linguagem: 'python', texto: 'x' }] };
  const slides = [{}, py, { codigo: [{ linguagem: 'text' }] }, py];
  assert.equal(av.proximoComCodigo(slides, 0), 1);
  assert.equal(av.proximoComCodigo(slides, 1), 1);
  assert.equal(av.proximoComCodigo(slides, 2), 3);
  assert.equal(av.proximoComCodigo(slides, 4), -1);
  assert.equal(av.proximoComCodigo(slides, 99), -1);
  assert.equal(av.proximoComCodigo([{}, {}], 0), -1);
  assert.equal(av.proximoComCodigo([], 0), -1);
  assert.equal(av.proximoComCodigo(null, 0), -1);
  assert.equal(av.proximoComCodigo(slides, -3), 1);
  assert.equal(av.proximoComCodigo(slides, undefined), 1);
});

// ---------- OneCompiler ----------

test('urlOneCompiler monta a URL clara, com fonte 28 por padrão', () => {
  const base = 'https://onecompiler.com/embed/python?hideNew=true&hideNewFileOption=true&hideLanguageSelection=true&hideTitle=true';
  assert.equal(av.urlOneCompiler(), base + '&fontSize=28&listenToEvents=true');
  assert.equal(av.urlOneCompiler({}), base + '&fontSize=28&listenToEvents=true');
  assert.equal(av.urlOneCompiler({ tema: 'claro' }), base + '&fontSize=28&listenToEvents=true');
  assert.equal(av.urlOneCompiler({ tema: 'xyz' }), base + '&fontSize=28&listenToEvents=true');
  assert.equal(av.urlOneCompiler({ codeChangeEvent: true }), base + '&fontSize=28&listenToEvents=true&codeChangeEvent=true');
});

test('urlOneCompiler usa theme=dark só com tema escuro', () => {
  const base = 'https://onecompiler.com/embed/python?hideNew=true&hideNewFileOption=true&hideLanguageSelection=true&hideTitle=true';
  assert.equal(av.urlOneCompiler({ tema: 'escuro' }), base + '&theme=dark&fontSize=28&listenToEvents=true');
  assert.equal(av.urlOneCompiler({ tema: 'escuro', fontSize: 20, codeChangeEvent: true }),
    base + '&theme=dark&fontSize=20&listenToEvents=true&codeChangeEvent=true');
});

test('urlOneCompiler prende o tamanho da fonte entre 8 e 32 e usa 28 se não for inteiro', () => {
  const tam = (o) => /fontSize=(\d+)/.exec(av.urlOneCompiler(o))[1];
  assert.equal(tam({ fontSize: 4 }), '8');
  assert.equal(tam({ fontSize: 99 }), '32');
  assert.equal(tam({ fontSize: 20 }), '20');
  assert.equal(tam({ fontSize: 8 }), '8');
  assert.equal(tam({ fontSize: 32 }), '32');
  assert.equal(tam({ fontSize: 'abc' }), '28');
  assert.equal(tam({ fontSize: 20.5 }), '28');
});

test('mensagemCodigo e mensagemRodar montam as mensagens do OneCompiler', () => {
  assert.deepEqual(av.mensagemCodigo('print(1)'), {
    eventType: 'populateCode', language: 'python', files: [{ name: 'main.py', content: 'print(1)' }]
  });
  assert.equal(av.mensagemCodigo('a'.repeat(av.MAX_CODIGO + 3)).files[0].content.length, av.MAX_CODIGO);
  assert.equal(av.mensagemCodigo(undefined).files[0].content, '');
  assert.deepEqual(av.mensagemRodar(), { eventType: 'triggerRun' });
});

test('codigoDaMensagem lê o arquivo .py, o primeiro arquivo ou data.code', () => {
  const janela = {};
  const ev = (data, extra) => Object.assign({ origin: av.ORIGEM_ONECOMPILER, source: janela, data: data }, extra);
  assert.equal(av.codigoDaMensagem(ev({ files: [{ name: 'a.txt', content: 'A' }, { name: 'main.py', content: 'B' }] }), janela), 'B');
  assert.equal(av.codigoDaMensagem(ev({ files: [{ name: 'a.txt', content: 'A' }] }), janela), 'A');
  assert.equal(av.codigoDaMensagem(ev({ code: 'C' }), janela), 'C');
  assert.equal(av.codigoDaMensagem(ev({ files: [], code: 'D' }), janela), 'D');
  assert.equal(av.codigoDaMensagem(ev({ files: [{ name: 'main.py', content: 'x'.repeat(av.MAX_CODIGO + 1) }] }), janela).length, av.MAX_CODIGO);
});

test('codigoDaMensagem recusa origem, janela ou dados inválidos', () => {
  const janela = {};
  const bom = { origin: av.ORIGEM_ONECOMPILER, source: janela, data: { code: 'x' } };
  assert.equal(av.codigoDaMensagem(bom, janela), 'x');
  assert.equal(av.codigoDaMensagem(Object.assign({}, bom, { origin: 'https://evil.com' }), janela), null);
  assert.equal(av.codigoDaMensagem(Object.assign({}, bom, { source: {} }), janela), null);
  assert.equal(av.codigoDaMensagem(Object.assign({}, bom, { data: 'texto' }), janela), null);
  assert.equal(av.codigoDaMensagem(Object.assign({}, bom, { data: null }), janela), null);
  assert.equal(av.codigoDaMensagem(Object.assign({}, bom, { data: {} }), janela), null);
  assert.equal(av.codigoDaMensagem(Object.assign({}, bom, { data: { code: 5 } }), janela), null);
  assert.equal(av.codigoDaMensagem(Object.assign({}, bom, { data: { files: [{ name: 'main.py', content: 7 }] } }), janela), null);
  assert.equal(av.codigoDaMensagem(Object.assign({}, bom, { data: { files: [null] } }), janela), null);
  assert.equal(av.codigoDaMensagem(null, janela), null);
  assert.equal(av.codigoDaMensagem(bom, undefined), null);
});

test('codigoDaMensagem troca a quebra de linha do Windows (CRLF) por LF', () => {
  const janela = {};
  const evento = { origin: 'https://onecompiler.com', source: janela, data: { files: [{ name: 'main.py', content: 'a = 1\r\nprint(a)\r\n' }] } };
  assert.equal(av.codigoDaMensagem(evento, janela), 'a = 1\nprint(a)\n');
});

test('mesmoCodigo ignora a diferença de CRLF e o espaço no fim, mas não o resto', () => {
  assert.equal(av.mesmoCodigo('a = 1\r\nprint(a)\r\n', 'a = 1\nprint(a)'), true);
  assert.equal(av.mesmoCodigo('a = 1\n', 'a = 1   \n\n'), true);
  assert.equal(av.mesmoCodigo('a = 1', 'a = 2'), false);
  assert.equal(av.mesmoCodigo('    a = 1', 'a = 1'), false);
  assert.equal(av.mesmoCodigo(null, ''), true);
});
