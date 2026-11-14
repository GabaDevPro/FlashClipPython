/* Roleta de sorteio entre quem acertou alguma atividade. O aleatório entra de fora para testar. */
(function (raiz) {
  'use strict';

  function sortear(candidatos, roleta, aleatorio, agora) {
    if (!candidatos.length) { return { ok: false, erro: 'Ninguém marcado como acertou alguma atividade.' }; }
    var pote = roleta.semRepetir
      ? candidatos.filter(function (id) { return roleta.sorteados.indexOf(id) < 0; })
      : candidatos.slice();
    if (!pote.length) { return { ok: false, erro: 'Todos os candidatos já foram sorteados.' }; }
    var id = pote[Math.min(pote.length - 1, Math.floor(aleatorio() * pote.length))];
    return {
      ok: true,
      id: id,
      roleta: { semRepetir: roleta.semRepetir, sorteados: roleta.sorteados.concat([id]), ultimo: { id: id, em: agora } }
    };
  }

  function limpar(roleta) {
    return { semRepetir: roleta.semRepetir, sorteados: [], ultimo: null };
  }

  function anguloFinal(voltas, aleatorio) {
    return voltas * 360 + Math.floor(aleatorio() * 360);
  }

  var api = { sortear: sortear, limpar: limpar, anguloFinal: anguloFinal };

  raiz.PI = raiz.PI || {};
  raiz.PI.roleta = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
