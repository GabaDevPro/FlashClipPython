'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const av = require('../js/logica/aovivo.js');

const CODIGO_DADOS = [
  'dado1 = int(input("Dado 1: "))',
  'dado2 = int(input("Dado 2: "))',
  'if dado1 == dado2:',
  'print("Dupla! Jogue de novo")',
  'else:',
  'print("Vez do próximo jogador")'
].join('\n');

test('exporta as constantes e se registra em PI.aoVivo', () => {
  assert.equal(av.MAX_CODIGO, 20000);
  assert.equal(av.MAX_SAIDA, 20000);
  assert.equal(av.MAX_ENTRADA, 500);
  assert.equal(av.ORIGEM_ONECOMPILER, 'https://onecompiler.com');
  assert.equal(av.CHAVE, 'pi:aovivo:v1');
  assert.equal(globalThis.PI.aoVivo, av);
});

// ---------- criar e normalizar ----------

test('criar devolve o estado inicial fechado, offline e sem pedido', () => {
  assert.deepEqual(av.criar(), {
    aberto: false, motor: 'offline', codigo: '', versao: 0, autor: 'principal',
    execucao: { estado: 'parado', saida: '', pergunta: '', erroLinha: null },
    pedido: null
  });
});

test('criar devolve objetos independentes a cada chamada', () => {
  const a = av.criar();
  a.execucao.saida = 'x';
  assert.equal(av.criar().execucao.saida, '');
});

test('normalizar aceita um estado válido e o devolve como objeto novo', () => {
  const e = av.criar();
  const n = av.normalizar(e);
  assert.deepEqual(n, e);
  assert.notEqual(n, e);
  assert.notEqual(n.execucao, e.execucao);
});

test('normalizar aceita string JSON e recusa JSON inválido', () => {
  const e = av.abrir(av.criar(), 'onecompiler', 'print(1)', 'painel');
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
    { aberto: 'sim' }, { motor: 'x' }, { motor: 3 }, { codigo: 5 }, { versao: -1 },
    { versao: 1.5 }, { versao: '1' }, { autor: 'outro' }, { execucao: null },
    { execucao: { estado: 'voando', saida: '', pergunta: '', erroLinha: null } },
    { execucao: { estado: 'parado', saida: 1, pergunta: '', erroLinha: null } },
    { execucao: { estado: 'parado', saida: '', pergunta: 1, erroLinha: null } },
    { execucao: { estado: 'parado', saida: '', pergunta: '', erroLinha: 0 } },
    { execucao: { estado: 'parado', saida: '', pergunta: '', erroLinha: 1.5 } },
    { execucao: { estado: 'parado', saida: '', pergunta: '', erroLinha: '2' } },
    { pedido: 'x' },
    { pedido: { id: 0, acao: 'rodar', valor: '' } },
    { pedido: { id: 1, acao: 'dancar', valor: '' } },
    { pedido: { id: 1, acao: 'rodar', valor: 3 } }
  ];
  for (const mudanca of ruins) {
    assert.equal(av.normalizar(Object.assign({}, base, mudanca)), null, JSON.stringify(mudanca));
  }
});

test('normalizar aceita todos os motores, autores, estados e ações permitidos', () => {
  for (const motor of ['offline', 'onecompiler']) {
    assert.equal(av.normalizar(Object.assign(av.criar(), { motor: motor })).motor, motor);
  }
  for (const autor of ['principal', 'painel']) {
    assert.equal(av.normalizar(Object.assign(av.criar(), { autor: autor })).autor, autor);
  }
  for (const estado of ['parado', 'rodando', 'esperando']) {
    const e = av.comExecucao(av.criar(), { estado: estado }, 'principal');
    assert.equal(av.normalizar(e).execucao.estado, estado);
  }
  for (const acao of ['rodar', 'parar', 'responder', 'rodarOneCompiler']) {
    const e = av.pedir(av.criar(), acao, 'v', 'principal');
    assert.equal(av.normalizar(e).pedido.acao, acao);
  }
});

test('normalizar trunca código e pergunta e guarda os últimos caracteres da saída', () => {
  const e = av.criar();
  e.codigo = 'a'.repeat(av.MAX_CODIGO + 10);
  e.execucao.pergunta = 'p'.repeat(av.MAX_ENTRADA + 10);
  e.execucao.saida = 'x'.repeat(10) + 'y'.repeat(av.MAX_SAIDA);
  e.pedido = { id: 2, acao: 'responder', valor: 'v'.repeat(av.MAX_ENTRADA + 5) };
  const n = av.normalizar(e);
  assert.equal(n.codigo.length, av.MAX_CODIGO);
  assert.equal(n.execucao.pergunta.length, av.MAX_ENTRADA);
  assert.equal(n.execucao.saida, 'y'.repeat(av.MAX_SAIDA));
  assert.equal(n.pedido.valor.length, av.MAX_ENTRADA);
});

test('normalizar descarta campos extras em todos os níveis', () => {
  const e = av.pedir(av.criar(), 'rodar', '', 'principal');
  e.extra = 1;
  e.execucao.lixo = 2;
  e.pedido.lixo = 3;
  assert.deepEqual(av.normalizar(e), av.pedir(av.criar(), 'rodar', '', 'principal'));
});

test('normalizar trata erroLinha e pedido ausentes como null', () => {
  const e = av.criar();
  delete e.pedido;
  delete e.execucao.erroLinha;
  const n = av.normalizar(e);
  assert.equal(n.pedido, null);
  assert.equal(n.execucao.erroLinha, null);
});

test('normalizar não altera a entrada', () => {
  const e = av.criar();
  e.codigo = 'a'.repeat(av.MAX_CODIGO + 1);
  av.normalizar(e);
  assert.equal(e.codigo.length, av.MAX_CODIGO + 1);
});

// ---------- transições ----------

test('abrir liga o editor, define motor, código e autor e sobe a versão', () => {
  const e = av.criar();
  const n = av.abrir(e, 'onecompiler', 'print(1)', 'painel');
  assert.equal(n.aberto, true);
  assert.equal(n.motor, 'onecompiler');
  assert.equal(n.codigo, 'print(1)');
  assert.equal(n.autor, 'painel');
  assert.equal(n.versao, 1);
  assert.equal(e.aberto, false);
  assert.equal(e.versao, 0);
});

test('abrir trunca o código, e motor e autor desconhecidos viram offline e principal', () => {
  const n = av.abrir(av.criar(), 'xyz', 'a'.repeat(av.MAX_CODIGO + 5), 'zzz');
  assert.equal(n.codigo.length, av.MAX_CODIGO);
  assert.equal(n.motor, 'offline');
  assert.equal(n.autor, 'principal');
  assert.equal(av.abrir(av.criar(), 'offline', undefined, 'principal').codigo, '');
});

test('fechar desliga o editor e guarda o autor', () => {
  const aberto = av.abrir(av.criar(), 'offline', 'x', 'principal');
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
});

test('pedir cria o pedido com id igual à nova versão e valor como texto truncado', () => {
  const e = av.comCodigo(av.criar(), 'x', 'principal');
  const n = av.pedir(e, 'responder', 'sete', 'painel');
  assert.deepEqual(n.pedido, { id: 2, acao: 'responder', valor: 'sete' });
  assert.equal(n.versao, 2);
  assert.equal(n.autor, 'painel');
  assert.equal(e.pedido, null);
  assert.equal(av.pedir(e, 'rodar', undefined, 'principal').pedido.valor, '');
  assert.equal(av.pedir(e, 'rodar', null, 'principal').pedido.valor, '');
  assert.equal(av.pedir(e, 'responder', 42, 'principal').pedido.valor, '42');
  assert.equal(av.pedir(e, 'responder', 'v'.repeat(av.MAX_ENTRADA + 9), 'principal').pedido.valor.length, av.MAX_ENTRADA);
});

test('comExecucao mescla só os campos de execução e aplica as regras de normalizar', () => {
  const e = av.criar();
  const n = av.comExecucao(e, { estado: 'esperando', pergunta: 'Dado 1: ', intruso: 1 }, 'painel');
  assert.deepEqual(n.execucao, { estado: 'esperando', saida: '', pergunta: 'Dado 1: ', erroLinha: null });
  assert.equal(n.versao, 1);
  assert.equal(n.autor, 'painel');
  assert.equal(e.execucao.estado, 'parado');
  const longa = av.comExecucao(e, { saida: 'z'.repeat(av.MAX_SAIDA + 4), pergunta: 'q'.repeat(av.MAX_ENTRADA + 4) }, 'principal');
  assert.equal(longa.execucao.saida.length, av.MAX_SAIDA);
  assert.equal(longa.execucao.pergunta.length, av.MAX_ENTRADA);
  assert.equal(av.comExecucao(n, { erroLinha: 4 }, 'principal').execucao.erroLinha, 4);
  assert.equal(av.comExecucao(av.comExecucao(n, { erroLinha: 4 }, 'principal'), { erroLinha: null }, 'principal').execucao.erroLinha, null);
});

test('comExecucao ignora valores inválidos e mantém os anteriores', () => {
  const e = av.comExecucao(av.criar(), { estado: 'rodando', saida: 'ok', erroLinha: 3 }, 'principal');
  const n = av.comExecucao(e, { estado: 'voando', saida: 7, pergunta: {}, erroLinha: 0 }, 'principal');
  assert.deepEqual(n.execucao, e.execucao);
  assert.equal(n.versao, e.versao + 1);
  assert.deepEqual(av.comExecucao(e, null, 'principal').execucao, e.execucao);
});

test('anexarSaida acrescenta o texto e mantém só os últimos caracteres', () => {
  const e = av.comExecucao(av.criar(), { saida: 'Olá ' }, 'principal');
  const n = av.anexarSaida(e, 'mundo', 'painel');
  assert.equal(n.execucao.saida, 'Olá mundo');
  assert.equal(n.autor, 'painel');
  assert.equal(n.versao, e.versao + 1);
  assert.equal(e.execucao.saida, 'Olá ');
  const cheio = av.comExecucao(av.criar(), { saida: 'a'.repeat(av.MAX_SAIDA) }, 'principal');
  const corte = av.anexarSaida(cheio, 'XYZ', 'principal');
  assert.equal(corte.execucao.saida.length, av.MAX_SAIDA);
  assert.equal(corte.execucao.saida.slice(-3), 'XYZ');
  assert.equal(av.anexarSaida(e, undefined, 'principal').execucao.saida, 'Olá ');
});

// ---------- codigoDoSlide ----------

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

// ---------- traduzirErro ----------

test('traduzirErro: o código dos dados vira IndentationError igual ao do Python oficial', () => {
  const r = av.traduzirErro('SyntaxError: bad input on line 4', CODIGO_DADOS);
  assert.equal(r.tipo, 'IndentationError');
  assert.equal(r.linha, 4);
  assert.equal(r.texto,
    '  File "main.py", line 4\n    print("Dupla! Jogue de novo")\n    ^^^^^\n' +
    "IndentationError: expected an indented block after 'if' statement on line 3");
});

test('traduzirErro: o else sem recuo cita else e a linha do else', () => {
  const r = av.traduzirErro('SyntaxError: bad input on line 6', CODIGO_DADOS);
  assert.equal(r.texto.split('\n').pop(), "IndentationError: expected an indented block after 'else' statement on line 5");
});

test('traduzirErro: elif, for e while usam a própria palavra', () => {
  for (const kw of ['elif', 'for', 'while']) {
    const codigo = kw + ' x:\nprint(1)';
    const r = av.traduzirErro('SyntaxError: bad input on line 2', codigo);
    assert.equal(r.tipo, 'IndentationError', kw);
    assert.equal(r.texto.split('\n').pop(), "IndentationError: expected an indented block after '" + kw + "' statement on line 1", kw);
  }
});

test('traduzirErro: def usa "function definition" e outras palavras só o básico', () => {
  const def = av.traduzirErro('SyntaxError: bad input on line 2', 'def f():\nprint(1)');
  assert.equal(def.texto.split('\n').pop(), 'IndentationError: expected an indented block after function definition on line 1');
  const outra = av.traduzirErro('SyntaxError: bad input on line 2', 'class A:\nprint(1)');
  assert.equal(outra.texto.split('\n').pop(), 'IndentationError: expected an indented block');
});

test('traduzirErro: ignora espaços e comentário depois dos dois-pontos e linhas vazias antes do erro', () => {
  const codigo = 'if x:   # confere\n\n   \nprint(1)';
  const r = av.traduzirErro('SyntaxError: bad input on line 4', codigo);
  assert.equal(r.tipo, 'IndentationError');
  assert.equal(r.texto.split('\n').pop(), "IndentationError: expected an indented block after 'if' statement on line 1");
});

test('traduzirErro: dois-pontos dentro de string ou comentário sem recuo não contam', () => {
  const r = av.traduzirErro('SyntaxError: bad input on line 2', 'x = "a:" # b:\n  y = 1');
  assert.equal(r.texto.split('\n').pop(), 'IndentationError: unexpected indent');
});

test('traduzirErro: recuo a mais depois de linha sem dois-pontos vira unexpected indent', () => {
  const r = av.traduzirErro('SyntaxError: bad input on line 2', 'x = 1\n    y = 2');
  assert.equal(r.tipo, 'IndentationError');
  assert.equal(r.linha, 2);
  assert.equal(r.texto, '  File "main.py", line 2\n    y = 2\nIndentationError: unexpected indent');
});

test('traduzirErro: bad input sem as duas situações continua SyntaxError bad input', () => {
  const r = av.traduzirErro('SyntaxError: bad input on line 2', 'x = 1\ny = 2');
  assert.equal(r.tipo, 'SyntaxError');
  assert.equal(r.texto, '  File "main.py", line 2\n    y = 2\nSyntaxError: bad input');
  const semLinha = av.traduzirErro('SyntaxError: bad input', 'x = 1');
  assert.deepEqual(semLinha, { tipo: 'SyntaxError', texto: 'SyntaxError: bad input', linha: null });
});

test('traduzirErro: bad input com linha fora do código não quebra', () => {
  const r = av.traduzirErro('SyntaxError: bad input on line 9', 'x = 1');
  assert.equal(r.tipo, 'SyntaxError');
  assert.equal(r.linha, 9);
  assert.equal(r.texto, '  File "main.py", line 9\n    \nSyntaxError: bad input');
});

test('traduzirErro: caret usa o tamanho do identificador, ou 1 se a linha não começa com um', () => {
  const r = av.traduzirErro('SyntaxError: bad input on line 2', 'if x:\n"texto"');
  assert.ok(r.texto.indexOf('\n    ^\n') > -1);
  const r2 = av.traduzirErro('SyntaxError: bad input on line 2', 'for i in x:\ncontador = 1');
  assert.ok(r2.texto.indexOf('\n    ^^^^^^^^\n') > -1);
});

test('traduzirErro: unindent inválido vira IndentationError com a mesma mensagem', () => {
  const codigo = 'if x:\n    a = 1\n  b = 2';
  const r = av.traduzirErro('SyntaxError: unindent does not match any outer indentation level on line 3', codigo);
  assert.equal(r.tipo, 'IndentationError');
  assert.equal(r.linha, 3);
  assert.equal(r.texto,
    '  File "main.py", line 3\n    b = 2\nIndentationError: unindent does not match any outer indentation level');
  const sem = av.traduzirErro('SyntaxError: unindent does not match any outer indentation level', codigo);
  assert.deepEqual(sem, {
    tipo: 'IndentationError',
    texto: 'IndentationError: unindent does not match any outer indentation level',
    linha: null
  });
});

test('traduzirErro: TypeError de concatenação usa a mensagem do Python 3.12', () => {
  const r = av.traduzirErro("TypeError: cannot concatenate 'str' and 'int' objects on line 2", 'saldo = 1500\nprint("Saldo: " + saldo)');
  assert.equal(r.tipo, 'TypeError');
  assert.equal(r.linha, 2);
  assert.equal(r.texto,
    'Traceback (most recent call last):\n  File "main.py", line 2, in <module>\n    print("Saldo: " + saldo)\nTypeError: can only concatenate str (not "int") to str');
});

test('traduzirErro: ZeroDivisionError vira division by zero', () => {
  const r = av.traduzirErro('ZeroDivisionError: integer division or modulo by zero on line 1', '    x = 1 / 0');
  assert.equal(r.tipo, 'ZeroDivisionError');
  assert.equal(r.texto,
    'Traceback (most recent call last):\n  File "main.py", line 1, in <module>\n    x = 1 / 0\nZeroDivisionError: division by zero');
});

test('traduzirErro: parêntese aberto vira SyntaxError na linha do último ( sem par', () => {
  const codigo = 'print("a")\nx = (1 + 2\nprint(x';
  const r = av.traduzirErro('SyntaxError: EOF in multi-line statement on line 4', codigo);
  assert.equal(r.tipo, 'SyntaxError');
  assert.equal(r.linha, 3);
  assert.equal(r.texto, '  File "main.py", line 3\n    print(x\nSyntaxError: \'(\' was never closed');
});

test('traduzirErro: parêntese dentro de aspas não conta e fechados não geram erro', () => {
  const ok = av.traduzirErro('SyntaxError: EOF in multi-line statement on line 2', 'print("(")\nprint(\'(\')');
  assert.equal(ok.tipo, 'SyntaxError');
  assert.equal(ok.texto, '  File "main.py", line 2\n    print(\'(\')\nSyntaxError: EOF in multi-line statement');
  const par = av.traduzirErro('SyntaxError: EOF in multi-line statement on line 2', 'x = (1\ny = ")" + (');
  assert.equal(par.linha, 2);
  const fechado = av.traduzirErro('SyntaxError: EOF in multi-line statement', 'x = (1)\ny = "(("');
  assert.equal(fechado.linha, null);
  assert.equal(fechado.texto, 'SyntaxError: EOF in multi-line statement');
});

test('traduzirErro: parêntese aberto sem número de linha na mensagem usa a linha do (', () => {
  const r = av.traduzirErro('SyntaxError: EOF in multi-line statement', 'x = 1\nprint(');
  assert.equal(r.linha, 2);
  assert.equal(r.texto.split('\n').pop(), "SyntaxError: '(' was never closed");
});

test('traduzirErro: outros erros mantêm tipo e mensagem, só tiram on line', () => {
  const r = av.traduzirErro("NameError: name 'x' is not defined on line 1", 'print(x)');
  assert.deepEqual(r, {
    tipo: 'NameError',
    texto: 'Traceback (most recent call last):\n  File "main.py", line 1, in <module>\n    print(x)\nNameError: name \'x\' is not defined',
    linha: 1
  });
  assert.deepEqual(av.traduzirErro("NameError: name 'x' is not defined", 'print(x)'), {
    tipo: 'NameError', texto: "NameError: name 'x' is not defined", linha: null
  });
});

test('traduzirErro: mensagem fora do formato vira Error com o texto original', () => {
  assert.deepEqual(av.traduzirErro('algo estranho', ''), { tipo: 'Error', texto: 'Error: algo estranho', linha: null });
  assert.deepEqual(av.traduzirErro(undefined, undefined), { tipo: 'Error', texto: 'Error: ', linha: null });
});

test('traduzirErro: aceita quebra de linha CRLF no código', () => {
  const r = av.traduzirErro('SyntaxError: bad input on line 2', 'if x:\r\nprint(1)');
  assert.equal(r.tipo, 'IndentationError');
  assert.equal(r.texto.split('\n')[1], '    print(1)');
});

test('traduzirErro: TypeError diferente de concatenação não é reescrito', () => {
  const r = av.traduzirErro("TypeError: unsupported operand on line 1", 'x');
  assert.equal(r.texto.split('\n').pop(), 'TypeError: unsupported operand');
});

// ---------- OneCompiler ----------

test('urlOneCompiler monta a URL com fonte 28 por padrão e sem opções', () => {
  const base = 'https://onecompiler.com/embed/python?hideNew=true&hideNewFileOption=true&hideLanguageSelection=true&hideTitle=true&theme=dark&fontSize=';
  assert.equal(av.urlOneCompiler(), base + '28&listenToEvents=true');
  assert.equal(av.urlOneCompiler({}), base + '28&listenToEvents=true');
  assert.equal(av.urlOneCompiler({ codeChangeEvent: true }), base + '28&listenToEvents=true&codeChangeEvent=true');
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

test('moduloPermitido libera só os módulos da aula e bloqueia os que abrem aba, mexem na página ou acessam a rede', () => {
  for (const caminho of ['src/builtin/sys.js', 'src/builtin/math.js', 'src/builtin/math/__init__.js', 'src/lib/math.js', 'src/lib/random.js', 'src/lib/string.py', 'src/lib/time.js']) {
    assert.equal(av.moduloPermitido(caminho), true, caminho);
  }
  for (const caminho of ['src/lib/webbrowser.js', 'src/lib/webbrowser.py', 'src/lib/turtle.js', 'src/lib/document.js', 'src/lib/urllib/request.js', 'src/lib/webgl/math.js', 'constructor', '__proto__', '', null]) {
    assert.equal(av.moduloPermitido(caminho), false, String(caminho));
  }
});

test('normalizar recusa versão e id de pedido acima do teto, que travariam os pedidos seguintes', () => {
  const bom = av.criar();
  assert.equal(av.normalizar(Object.assign({}, bom, { versao: Math.pow(2, 53) })), null);
  assert.equal(av.normalizar(Object.assign({}, bom, { versao: av.MAX_CONTADOR + 1 })), null);
  assert.ok(av.normalizar(Object.assign({}, bom, { versao: av.MAX_CONTADOR })));
  assert.equal(av.normalizar(Object.assign({}, bom, { pedido: { id: av.MAX_CONTADOR + 1, acao: 'rodar', valor: '' } })), null);
});
