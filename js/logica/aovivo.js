/* Editor ao vivo: estado puro, transições, tradução de erros do Skulpt e mensagens do OneCompiler. */
(function (raiz) {
  'use strict';

  var MAX_CODIGO = 20000;
  var MAX_SAIDA = 20000;
  var MAX_ENTRADA = 500;
  var ORIGEM_ONECOMPILER = 'https://onecompiler.com';
  var CHAVE = 'pi:aovivo:v1';
  var FONTE_PADRAO = 28;
  var FONTE_MIN = 8;
  var FONTE_MAX = 32;
  var MOTORES = ['offline', 'onecompiler'];
  var AUTORES = ['principal', 'painel'];
  var ESTADOS = ['parado', 'rodando', 'esperando'];
  var ACOES = ['rodar', 'parar', 'responder', 'rodarOneCompiler'];
  var CAMPOS_EXECUCAO = ['estado', 'saida', 'pergunta', 'erroLinha'];

  function ehObjeto(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  // Teto para versão, id de pedido e linha: um número gigante gravado por outra página local
  // no mesmo localStorage travaria todos os pedidos seguintes (id <= último).
  var MAX_CONTADOR = 1e9;
  function ehInteiro(v, minimo) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v >= minimo && v <= MAX_CONTADOR; }

  // Módulos que o editor offline pode importar. Lista branca: webbrowser abriria abas, turtle e
  // document mexeriam na página, urllib acessaria a rede.
  var MODULOS_PERMITIDOS = ['sys', 'math', 'random', 'time', 'string', 're', 'itertools', 'collections', 'operator'];
  function moduloPermitido(caminho) {
    var m = /^src\/(?:builtin|lib)\/([a-z_]+)(?:\/__init__)?\.(?:js|py)$/.exec(String(caminho || ''));
    return !!m && MODULOS_PERMITIDOS.indexOf(m[1]) >= 0;
  }
  function truncar(texto, max) { return texto.length > max ? texto.slice(0, max) : texto; }
  function ultimos(texto, max) { return texto.length > max ? texto.slice(texto.length - max) : texto; }
  function emTexto(v) { return v === null || v === undefined ? '' : String(v); }

  /* Devolve o valor normalizado do campo de execução, ou undefined se for inválido. */
  function campoExecucao(nome, v) {
    if (nome === 'estado') { return ESTADOS.indexOf(v) >= 0 ? v : undefined; }
    if (nome === 'saida') { return typeof v === 'string' ? ultimos(v, MAX_SAIDA) : undefined; }
    if (nome === 'pergunta') { return typeof v === 'string' ? truncar(v, MAX_ENTRADA) : undefined; }
    if (v === null || ehInteiro(v, 1)) { return v; }
    return undefined;
  }

  function criar() {
    return {
      aberto: false, motor: 'offline', codigo: '', versao: 0, autor: 'principal',
      execucao: { estado: 'parado', saida: '', pergunta: '', erroLinha: null },
      pedido: null
    };
  }

  function normalizarExecucao(e) {
    if (!ehObjeto(e)) { return null; }
    var saida = {};
    for (var i = 0; i < CAMPOS_EXECUCAO.length; i++) {
      var nome = CAMPOS_EXECUCAO[i];
      var valor = nome === 'erroLinha' && e[nome] === undefined ? null : e[nome];
      valor = campoExecucao(nome, valor);
      if (valor === undefined) { return null; }
      saida[nome] = valor;
    }
    return saida;
  }

  function normalizarPedido(p) {
    if (p === null || p === undefined) { return { ok: true, valor: null }; }
    if (!ehObjeto(p) || !ehInteiro(p.id, 1) || ACOES.indexOf(p.acao) < 0 || typeof p.valor !== 'string') {
      return { ok: false };
    }
    return { ok: true, valor: { id: p.id, acao: p.acao, valor: truncar(p.valor, MAX_ENTRADA) } };
  }

  function normalizar(valor) {
    var e = valor;
    if (typeof valor === 'string') {
      try { e = JSON.parse(valor); } catch (erro) { return null; }
    }
    if (!ehObjeto(e)) { return null; }
    if (typeof e.aberto !== 'boolean' || MOTORES.indexOf(e.motor) < 0 || typeof e.codigo !== 'string' ||
        !ehInteiro(e.versao, 0) || AUTORES.indexOf(e.autor) < 0) {
      return null;
    }
    var execucao = normalizarExecucao(e.execucao);
    var pedido = normalizarPedido(e.pedido);
    if (execucao === null || !pedido.ok) { return null; }
    return {
      aberto: e.aberto, motor: e.motor, codigo: truncar(e.codigo, MAX_CODIGO), versao: e.versao,
      autor: e.autor, execucao: execucao, pedido: pedido.valor
    };
  }

  /* Cópia do estado com as mudanças aplicadas e a versão incrementada. */
  function derivar(e, mudancas, autor) {
    var novo = {
      aberto: e.aberto, motor: e.motor, codigo: e.codigo, versao: e.versao + 1,
      autor: AUTORES.indexOf(autor) >= 0 ? autor : 'principal',
      execucao: {
        estado: e.execucao.estado, saida: e.execucao.saida,
        pergunta: e.execucao.pergunta, erroLinha: e.execucao.erroLinha
      },
      pedido: e.pedido ? { id: e.pedido.id, acao: e.pedido.acao, valor: e.pedido.valor } : null
    };
    for (var chave in mudancas) {
      if (Object.prototype.hasOwnProperty.call(mudancas, chave)) { novo[chave] = mudancas[chave]; }
    }
    return novo;
  }

  function abrir(e, motor, codigo, autor) {
    return derivar(e, {
      aberto: true,
      motor: MOTORES.indexOf(motor) >= 0 ? motor : 'offline',
      codigo: truncar(emTexto(codigo), MAX_CODIGO)
    }, autor);
  }

  function fechar(e, autor) { return derivar(e, { aberto: false }, autor); }

  function comCodigo(e, codigo, autor) {
    return derivar(e, { codigo: truncar(emTexto(codigo), MAX_CODIGO) }, autor);
  }

  function pedir(e, acao, valor, autor) {
    return derivar(e, {
      pedido: { id: e.versao + 1, acao: acao, valor: truncar(String(valor || ''), MAX_ENTRADA) }
    }, autor);
  }

  function comExecucao(e, mudancas, autor) {
    var execucao = {};
    for (var i = 0; i < CAMPOS_EXECUCAO.length; i++) {
      var nome = CAMPOS_EXECUCAO[i];
      var valor = mudancas && Object.prototype.hasOwnProperty.call(mudancas, nome)
        ? campoExecucao(nome, mudancas[nome]) : undefined;
      execucao[nome] = valor === undefined ? e.execucao[nome] : valor;
    }
    return derivar(e, { execucao: execucao }, autor);
  }

  function anexarSaida(e, texto, autor) {
    var saida = ultimos(e.execucao.saida + emTexto(texto), MAX_SAIDA);
    return comExecucao(e, { saida: saida }, autor);
  }

  function codigoDoSlide(slide) {
    var blocos = slide && Array.isArray(slide.codigo) ? slide.codigo : [];
    for (var i = 0; i < blocos.length; i++) {
      if (blocos[i] && blocos[i].linguagem === 'python') { return emTexto(blocos[i].texto); }
    }
    return '';
  }

  /* ---------- tradução de erros ---------- */

  function linhasDe(codigo) { return emTexto(codigo).split(/\r?\n/); }

  function recuo(linha) { return /^[ \t]*/.exec(linha)[0].length; }

  /* Tira o comentário # do fim da linha, respeitando aspas. */
  function semComentario(linha) {
    var aspas = null;
    for (var i = 0; i < linha.length; i++) {
      var c = linha[i];
      if (aspas) {
        if (c === '\\') { i++; } else if (c === aspas) { aspas = null; }
      } else if (c === '"' || c === "'") {
        aspas = c;
      } else if (c === '#') {
        return linha.slice(0, i);
      }
    }
    return linha;
  }

  function terminaEmDoisPontos(linha) {
    return /:\s*$/.test(semComentario(linha));
  }

  /* Última linha não vazia antes da linha n (1-based): { numero, texto } ou null. */
  function linhaAnterior(linhas, n) {
    for (var i = Math.min(n - 1, linhas.length) - 1; i >= 0; i--) {
      if (linhas[i].trim() !== '') { return { numero: i + 1, texto: linhas[i] }; }
    }
    return null;
  }

  /* Linha (1-based) do último '(' sem par, fora de aspas e comentários; 0 se não houver. */
  function linhaDoParentesisAberto(codigo) {
    var linhas = linhasDe(codigo);
    var pilha = [];
    for (var n = 0; n < linhas.length; n++) {
      var linha = linhas[n];
      var aspas = null;
      for (var i = 0; i < linha.length; i++) {
        var c = linha[i];
        if (aspas) {
          if (c === '\\') { i++; } else if (c === aspas) { aspas = null; }
        } else if (c === '"' || c === "'") {
          aspas = c;
        } else if (c === '#') {
          break;
        } else if (c === '(') {
          pilha.push(n + 1);
        } else if (c === ')') {
          pilha.pop();
        }
      }
    }
    return pilha.length ? pilha[pilha.length - 1] : 0;
  }

  function mensagemDeBloco(palavra, numero) {
    if (palavra === 'if' || palavra === 'elif' || palavra === 'else' || palavra === 'for' || palavra === 'while') {
      return "expected an indented block after '" + palavra + "' statement on line " + numero;
    }
    if (palavra === 'def') { return 'expected an indented block after function definition on line ' + numero; }
    return 'expected an indented block';
  }

  /* Reclassifica "bad input" como erro de indentação, se for o caso. */
  function indentacao(linhas, n) {
    var anterior = linhaAnterior(linhas, n);
    if (!anterior) { return null; }
    var atual = linhas[n - 1] === undefined ? '' : linhas[n - 1];
    var termina = terminaEmDoisPontos(anterior.texto);
    if (termina && recuo(atual) <= recuo(anterior.texto)) {
      var palavra = (/^\s*([A-Za-z_]\w*)/.exec(anterior.texto) || [])[1] || '';
      return { msg: mensagemDeBloco(palavra, anterior.numero), caret: true };
    }
    if (!termina && recuo(atual) > recuo(anterior.texto)) {
      return { msg: 'unexpected indent', caret: false };
    }
    return null;
  }

  function montarTexto(tipo, msg, linha, linhas, caret) {
    if (linha === null) { return tipo + ': ' + msg; }
    var fonte = linhas[linha - 1] === undefined ? '' : linhas[linha - 1].replace(/^\s+/, '');
    if (tipo === 'SyntaxError' || tipo === 'IndentationError') {
      var texto = '  File "main.py", line ' + linha + '\n    ' + fonte + '\n';
      if (caret) {
        var palavra = /^[A-Za-z_]\w*/.exec(fonte);
        texto += '    ' + new Array((palavra ? palavra[0].length : 1) + 1).join('^') + '\n';
      }
      return texto + tipo + ': ' + msg;
    }
    return 'Traceback (most recent call last):\n  File "main.py", line ' + linha +
      ', in <module>\n    ' + fonte + '\n' + tipo + ': ' + msg;
  }

  function traduzirErro(mensagem, codigo) {
    var m = /^\s*([A-Za-z_]\w*): ([\s\S]*?)(?: on line (\d+))?\s*$/.exec(emTexto(mensagem));
    if (!m) {
      var bruto = emTexto(mensagem);
      return { tipo: 'Error', texto: 'Error: ' + bruto, linha: null };
    }
    var tipo = m[1];
    var msg = m[2];
    var linha = m[3] ? parseInt(m[3], 10) : null;
    var linhas = linhasDe(codigo);
    var caret = false;
    var achado;

    if (tipo === 'TypeError' && (achado = /^cannot concatenate '(.+?)' and '(.+?)' objects$/.exec(msg))) {
      msg = 'can only concatenate ' + achado[1] + ' (not "' + achado[2] + '") to ' + achado[1];
    } else if (tipo === 'SyntaxError' && msg === 'bad input' && linha !== null && (achado = indentacao(linhas, linha))) {
      tipo = 'IndentationError';
      msg = achado.msg;
      caret = achado.caret;
    } else if (tipo === 'SyntaxError' && msg === 'unindent does not match any outer indentation level') {
      tipo = 'IndentationError';
    } else if (tipo === 'ZeroDivisionError' && msg === 'integer division or modulo by zero') {
      msg = 'division by zero';
    } else if (tipo === 'SyntaxError' && msg === 'EOF in multi-line statement') {
      var abertura = linhaDoParentesisAberto(codigo);
      if (abertura) {
        msg = "'(' was never closed";
        linha = abertura;
      }
    }
    return { tipo: tipo, texto: montarTexto(tipo, msg, linha, linhas, caret), linha: linha };
  }

  /* ---------- OneCompiler ---------- */

  function urlOneCompiler(opcoes) {
    var o = opcoes || {};
    var fonte = ehInteiro(o.fontSize, 0) ? Math.max(FONTE_MIN, Math.min(FONTE_MAX, o.fontSize)) : FONTE_PADRAO;
    return 'https://onecompiler.com/embed/python?hideNew=true&hideNewFileOption=true' +
      '&hideLanguageSelection=true&hideTitle=true&theme=dark&fontSize=' + fonte +
      '&listenToEvents=true' + (o.codeChangeEvent ? '&codeChangeEvent=true' : '');
  }

  function mensagemCodigo(codigo) {
    return {
      eventType: 'populateCode', language: 'python',
      files: [{ name: 'main.py', content: truncar(emTexto(codigo), MAX_CODIGO) }]
    };
  }

  function mensagemRodar() { return { eventType: 'triggerRun' }; }

  function codigoDaMensagem(evento, janelaEsperada) {
    if (!evento || evento.origin !== ORIGEM_ONECOMPILER || !janelaEsperada || evento.source !== janelaEsperada ||
        !ehObjeto(evento.data)) {
      return null;
    }
    var dados = evento.data;
    var texto;
    if (Array.isArray(dados.files) && dados.files.length) {
      var escolhido = dados.files[0];
      for (var i = 0; i < dados.files.length; i++) {
        var f = dados.files[i];
        if (f && typeof f.name === 'string' && /\.py$/.test(f.name)) { escolhido = f; break; }
      }
      texto = escolhido ? escolhido.content : undefined;
    } else {
      texto = dados.code;
    }
    return typeof texto === 'string' ? truncar(paraLF(texto), MAX_CODIGO) : null;
  }

  function paraLF(texto) { return texto.replace(/\r\n?/g, '\n'); }

  // Mesmo código para fins de eco do OneCompiler: ignora CRLF e espaço ou linha vazia no fim.
  function mesmoCodigo(a, b) {
    var limpar = function (x) { return paraLF(String(x || '')).replace(/\s+$/, ''); };
    return limpar(a) === limpar(b);
  }

  var api = {
    MAX_CODIGO: MAX_CODIGO, MAX_SAIDA: MAX_SAIDA, MAX_ENTRADA: MAX_ENTRADA,
    ORIGEM_ONECOMPILER: ORIGEM_ONECOMPILER, CHAVE: CHAVE,
    criar: criar, normalizar: normalizar,
    abrir: abrir, fechar: fechar, comCodigo: comCodigo, pedir: pedir,
    comExecucao: comExecucao, anexarSaida: anexarSaida,
    codigoDoSlide: codigoDoSlide, traduzirErro: traduzirErro,
    urlOneCompiler: urlOneCompiler, mensagemCodigo: mensagemCodigo,
    mensagemRodar: mensagemRodar, codigoDaMensagem: codigoDaMensagem, mesmoCodigo: mesmoCodigo,
    moduloPermitido: moduloPermitido, MAX_CONTADOR: MAX_CONTADOR
  };

  raiz.PI = raiz.PI || {};
  raiz.PI.aoVivo = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
