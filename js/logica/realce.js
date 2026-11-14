/* Realce de sintaxe Python sem biblioteca: tokens e HTML escapado. */
(function (raiz) {
  'use strict';

  var PALAVRAS_CHAVE = ['if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None',
    'def', 'return', 'import', 'from', 'as', 'break', 'continue', 'pass'];
  var FUNCOES = ['print', 'input', 'int', 'float', 'str', 'bool', 'type', 'range', 'len'];

  // A ordem importa: comentário e string antes de tudo, para # e números dentro deles não contarem.
  var REGRAS = [
    { tipo: 'comentario', re: /#[^\n]*/y },
    { tipo: 'string', re: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y },
    { tipo: 'numero', re: /\d+(?:\.\d+)?/y },
    { tipo: 'nome', re: /[A-Za-z_À-ÿ][\wÀ-ÿ]*/y },
    { tipo: 'operador', re: /==|!=|>=|<=|[+\-*/%=<>]/y }
  ];

  function classificarNome(nome) {
    if (/^_+$/.test(nome)) { return 'lacuna'; }
    if (PALAVRAS_CHAVE.indexOf(nome) >= 0) { return 'palavra-chave'; }
    if (FUNCOES.indexOf(nome) >= 0) { return 'funcao'; }
    return 'texto';
  }

  function empurrar(tokens, tipo, texto) {
    var ultimo = tokens[tokens.length - 1];
    if (tipo === 'texto' && ultimo && ultimo.tipo === 'texto') {
      tokens[tokens.length - 1] = { tipo: 'texto', texto: ultimo.texto + texto };
      return;
    }
    tokens.push({ tipo: tipo, texto: texto });
  }

  function casarEm(codigo, pos) {
    for (var i = 0; i < REGRAS.length; i++) {
      REGRAS[i].re.lastIndex = pos;
      var m = REGRAS[i].re.exec(codigo);
      if (m) { return { tipo: REGRAS[i].tipo, texto: m[0] }; }
    }
    return null;
  }

  function tokenizar(codigo) {
    var tokens = [];
    var pos = 0;
    while (pos < codigo.length) {
      var achado = casarEm(codigo, pos);
      if (!achado) {
        empurrar(tokens, 'texto', codigo[pos]);
        pos += 1;
        continue;
      }
      var tipo = achado.tipo === 'nome' ? classificarNome(achado.texto) : achado.tipo;
      empurrar(tokens, tipo, achado.texto);
      pos += achado.texto.length;
    }
    return tokens;
  }

  var ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function escapar(texto) {
    return texto.replace(/[&<>"']/g, function (c) { return ESCAPES[c]; });
  }

  function paraHtml(codigo) {
    return tokenizar(codigo).map(function (t) {
      return t.tipo === 'texto' ? escapar(t.texto) : '<span class="tk-' + t.tipo + '">' + escapar(t.texto) + '</span>';
    }).join('');
  }

  var api = { tokenizar: tokenizar, paraHtml: paraHtml, escapar: escapar };

  raiz.PI = raiz.PI || {};
  raiz.PI.realce = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
