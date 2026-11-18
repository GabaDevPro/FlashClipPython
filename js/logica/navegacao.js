/* Navegação pura: limites dos índices e interpretação das teclas. */
(function (raiz) {
  'use strict';

  var MAX_DIGITOS = 3;
  var TECLAS = {
    ArrowRight: 'proximo', ArrowDown: 'proximo', PageDown: 'proximo', ' ': 'proximo',
    ArrowLeft: 'anterior', ArrowUp: 'anterior', PageUp: 'anterior',
    Home: 'inicio', End: 'fim',
    f: 'telaCheia', F: 'telaCheia',
    '?': 'ajuda',
    p: 'painel', P: 'painel',
    c: 'cronometro', C: 'cronometro',
    m: 'mais1', M: 'mais1',
    z: 'zerar', Z: 'zerar',
    s: 'som', S: 'som',
    l: 'placar', L: 'placar',
    r: 'roleta', R: 'roleta',
    o: 'oneCompiler', O: 'oneCompiler'
  };

  function limitar(indice, total) {
    return Math.max(0, Math.min(indice, total - 1));
  }

  function proximo(indice, total) { return limitar(indice + 1, total); }
  function anterior(indice) { return Math.max(0, indice - 1); }

  function digitando(tecla, modoIr) {
    if (tecla === 'Escape') { return { acao: 'cancelar', modoIr: null }; }
    if (tecla === 'Enter') {
      return modoIr ? { acao: 'ir', modoIr: null, numero: modoIr } : { acao: 'cancelar', modoIr: null };
    }
    if (tecla === 'Backspace') { return { acao: 'digitar', modoIr: modoIr.slice(0, -1) }; }
    if (/^[0-9bB]$/.test(tecla) && modoIr.length < MAX_DIGITOS) {
      return { acao: 'digitar', modoIr: modoIr + tecla.toLowerCase() };
    }
    return { acao: 'digitar', modoIr: modoIr };
  }

  function interpretarTecla(tecla, modoIr) {
    if (modoIr !== null && modoIr !== undefined) { return digitando(tecla, modoIr); }
    if (tecla === 'g' || tecla === 'G') { return { acao: 'digitar', modoIr: '' }; }
    return { acao: TECLAS[tecla] || null, modoIr: null };
  }

  var api = { limitar: limitar, proximo: proximo, anterior: anterior, interpretarTecla: interpretarTecla };

  raiz.PI = raiz.PI || {};
  raiz.PI.navegacao = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
