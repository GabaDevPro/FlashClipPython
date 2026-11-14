/* Cronômetro que conta pelo horário de término: não acumula erro e sobrevive a recarregar. */
(function (raiz) {
  'use strict';

  var MINUTO_MS = 60000;

  function criar(alvo, duracaoMs) {
    return { alvo: alvo, duracaoMs: duracaoMs, rodando: false, terminaEm: null, restanteMs: duracaoMs };
  }

  function restante(c, agora) {
    return c.rodando ? Math.max(0, c.terminaEm - agora) : c.restanteMs;
  }

  function iniciar(c, agora) {
    if (c.rodando) { return c; }
    return Object.assign({}, c, { rodando: true, terminaEm: agora + c.restanteMs });
  }

  function pausar(c, agora) {
    if (!c.rodando) { return c; }
    return Object.assign({}, c, { rodando: false, terminaEm: null, restanteMs: restante(c, agora) });
  }

  function alternar(c, agora) {
    return c.rodando ? pausar(c, agora) : iniciar(c, agora);
  }

  function mais1(c, agora) {
    if (c.rodando) { return Object.assign({}, c, { terminaEm: Math.max(c.terminaEm, agora) + MINUTO_MS }); }
    return Object.assign({}, c, { restanteMs: c.restanteMs + MINUTO_MS });
  }

  function zerar(c) {
    return criar(c.alvo, c.duracaoMs);
  }

  function fase(c, agora) {
    var r = restante(c, agora);
    if (r <= 0) { return 'fim'; }
    return r <= MINUTO_MS ? 'alerta' : 'normal';
  }

  function formatar(ms) {
    var segundos = Math.ceil(Math.max(0, ms) / 1000);
    var resto = segundos % 60;
    return Math.floor(segundos / 60) + ':' + (resto < 10 ? '0' : '') + resto;
  }

  var api = { MINUTO_MS: MINUTO_MS, criar: criar, restante: restante, iniciar: iniciar, pausar: pausar, alternar: alternar, mais1: mais1, zerar: zerar, fase: fase, formatar: formatar };

  raiz.PI = raiz.PI || {};
  raiz.PI.cronometro = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
