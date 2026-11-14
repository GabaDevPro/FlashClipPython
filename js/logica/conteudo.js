/* Registro das seções de conteudo/secoes/ e lista única de slides. */
(function (raiz) {
  'use strict';

  function criarRegistro() {
    var secoes = [];
    return {
      secao: function (secao) { secoes.push(secao); },
      secoes: function () { return secoes.slice(); }
    };
  }

  function achatarSecoes(secoes) {
    var slides = [];
    secoes.forEach(function (secao) {
      (secao.slides || []).forEach(function (slide) {
        slides.push(Object.assign({}, slide, {
          indice: slides.length,
          secaoId: secao.id,
          secaoTitulo: secao.titulo,
          bloco: secao.bloco
        }));
      });
    });
    return slides;
  }

  function normalizarNumero(n) {
    return String(n === undefined || n === null ? '' : n).trim().toLowerCase();
  }

  function indicePorNumero(slides, numero) {
    var alvo = normalizarNumero(numero);
    if (!alvo) { return -1; }
    for (var i = 0; i < slides.length; i++) {
      if (normalizarNumero(slides[i].n) === alvo) { return i; }
    }
    return -1;
  }

  var api = { criarRegistro: criarRegistro, achatarSecoes: achatarSecoes, indicePorNumero: indicePorNumero };

  raiz.PI = raiz.PI || {};
  raiz.PI.conteudo = api;
  if (!raiz.PI.secao) {
    var registro = criarRegistro();
    raiz.PI.secao = registro.secao;
    raiz.PI.secoes = registro.secoes;
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
