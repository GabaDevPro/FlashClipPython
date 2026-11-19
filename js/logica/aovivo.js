/* Modo ao vivo: estado puro, transições, códigos dos slides e mensagens do OneCompiler embutido. */
(function (raiz) {
  'use strict';

  var MAX_CODIGO = 20000;
  // Teto para versão e id de pedido: um número gigante gravado por outra página local
  // no mesmo localStorage travaria todos os pedidos seguintes (id <= último).
  var MAX_CONTADOR = 1e9;
  var ORIGEM_ONECOMPILER = 'https://onecompiler.com';
  var CHAVE = 'pi:aovivo:v2';
  var FONTE_PADRAO = 28;
  var FONTE_MIN = 8;
  var FONTE_MAX = 32;
  var AUTORES = ['principal', 'painel'];
  var ACOES = ['rodar'];

  function ehObjeto(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function ehInteiro(v, minimo) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v && v >= minimo && v <= MAX_CONTADOR; }
  function truncar(texto, max) { return texto.length > max ? texto.slice(0, max) : texto; }
  function emTexto(v) { return v === null || v === undefined ? '' : String(v); }
  function autorValido(autor) { return AUTORES.indexOf(autor) >= 0 ? autor : 'principal'; }

  function criar() {
    return { aberto: false, codigo: '', versao: 0, autor: 'principal', pedido: null };
  }

  function normalizarPedido(p) {
    if (p === null || p === undefined) { return { ok: true, valor: null }; }
    if (!ehObjeto(p) || !ehInteiro(p.id, 1) || ACOES.indexOf(p.acao) < 0) { return { ok: false }; }
    return { ok: true, valor: { id: p.id, acao: p.acao } };
  }

  function normalizar(valor) {
    var e = valor;
    if (typeof valor === 'string') {
      try { e = JSON.parse(valor); } catch (erro) { return null; }
    }
    if (!ehObjeto(e)) { return null; }
    if (typeof e.aberto !== 'boolean' || typeof e.codigo !== 'string' ||
        !ehInteiro(e.versao, 0) || AUTORES.indexOf(e.autor) < 0) {
      return null;
    }
    var pedido = normalizarPedido(e.pedido);
    if (!pedido.ok) { return null; }
    return {
      aberto: e.aberto, codigo: truncar(e.codigo, MAX_CODIGO), versao: e.versao,
      autor: e.autor, pedido: pedido.valor
    };
  }

  /* Cópia do estado com as mudanças aplicadas e a versão incrementada. */
  function derivar(e, mudancas, autor) {
    return {
      aberto: 'aberto' in mudancas ? mudancas.aberto : e.aberto,
      codigo: 'codigo' in mudancas ? mudancas.codigo : e.codigo,
      versao: e.versao + 1,
      autor: autorValido(autor),
      pedido: 'pedido' in mudancas ? mudancas.pedido : (e.pedido ? { id: e.pedido.id, acao: e.pedido.acao } : null)
    };
  }

  function abrir(e, codigo, autor) {
    return derivar(e, { aberto: true, codigo: truncar(emTexto(codigo), MAX_CODIGO) }, autor);
  }

  function fechar(e, autor) { return derivar(e, { aberto: false }, autor); }

  function comCodigo(e, codigo, autor) {
    return derivar(e, { codigo: truncar(emTexto(codigo), MAX_CODIGO) }, autor);
  }

  function pedir(e, acao, autor) {
    return derivar(e, { pedido: { id: e.versao + 1, acao: acao } }, autor);
  }

  /* ---------- códigos dos slides ---------- */

  function blocosPython(slide) {
    var blocos = slide && Array.isArray(slide.codigo) ? slide.codigo : [];
    var achados = [];
    for (var i = 0; i < blocos.length; i++) {
      if (blocos[i] && blocos[i].linguagem === 'python') { achados.push(blocos[i]); }
    }
    return achados;
  }

  function codigoDoSlide(slide) {
    var blocos = blocosPython(slide);
    return blocos.length ? emTexto(blocos[0].texto) : '';
  }

  /* Entradas do primeiro teste do bloco que tiver a lista, copiadas. */
  function entradasDoBloco(bloco) {
    var testes = Array.isArray(bloco.testes) ? bloco.testes : [];
    for (var i = 0; i < testes.length; i++) {
      if (testes[i] && Array.isArray(testes[i].entradas)) { return testes[i].entradas.slice(); }
    }
    return [];
  }

  function codigosDoSlide(slide) {
    return blocosPython(slide).map(function (bloco) {
      return {
        rotulo: emTexto(bloco.rotulo),
        texto: emTexto(bloco.texto),
        saida: bloco.saida === undefined ? null : bloco.saida,
        entradas: entradasDoBloco(bloco)
      };
    });
  }

  function proximoComCodigo(slides, indice) {
    var lista = Array.isArray(slides) ? slides : [];
    var inicio = typeof indice === 'number' && indice > 0 ? Math.floor(indice) : 0;
    for (var i = inicio; i < lista.length; i++) {
      if (blocosPython(lista[i]).length) { return i; }
    }
    return -1;
  }

  /* ---------- OneCompiler ---------- */

  function urlOneCompiler(opcoes) {
    var o = opcoes || {};
    var fonte = ehInteiro(o.fontSize, 0) ? Math.max(FONTE_MIN, Math.min(FONTE_MAX, o.fontSize)) : FONTE_PADRAO;
    return 'https://onecompiler.com/embed/python?hideNew=true&hideNewFileOption=true' +
      '&hideLanguageSelection=true&hideTitle=true' + (o.tema === 'escuro' ? '&theme=dark' : '') +
      '&fontSize=' + fonte + '&listenToEvents=true' + (o.codeChangeEvent ? '&codeChangeEvent=true' : '');
  }

  function mensagemCodigo(codigo) {
    return {
      eventType: 'populateCode', language: 'python',
      files: [{ name: 'main.py', content: truncar(emTexto(codigo), MAX_CODIGO) }]
    };
  }

  function mensagemRodar() { return { eventType: 'triggerRun' }; }

  function paraLF(texto) { return texto.replace(/\r\n?/g, '\n'); }

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

  // Mesmo código para fins de eco do OneCompiler: ignora CRLF e espaço ou linha vazia no fim.
  function mesmoCodigo(a, b) {
    var limpar = function (x) { return paraLF(String(x || '')).replace(/\s+$/, ''); };
    return limpar(a) === limpar(b);
  }

  var api = {
    MAX_CODIGO: MAX_CODIGO, MAX_CONTADOR: MAX_CONTADOR,
    ORIGEM_ONECOMPILER: ORIGEM_ONECOMPILER, CHAVE: CHAVE,
    criar: criar, normalizar: normalizar,
    abrir: abrir, fechar: fechar, comCodigo: comCodigo, pedir: pedir,
    codigoDoSlide: codigoDoSlide, codigosDoSlide: codigosDoSlide, proximoComCodigo: proximoComCodigo,
    urlOneCompiler: urlOneCompiler, mensagemCodigo: mensagemCodigo,
    mensagemRodar: mensagemRodar, codigoDaMensagem: codigoDaMensagem, mesmoCodigo: mesmoCodigo
  };

  raiz.PI = raiz.PI || {};
  raiz.PI.aoVivo = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
