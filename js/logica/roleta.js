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

  // Andamento do giro (0 a 1): rápido no começo e bem devagar no fim, para dar suspense.
  function desacelerar(t) {
    var x = Math.max(0, Math.min(1, t));
    return 1 - Math.pow(1 - x, 5);
  }

  // A fatia 0 começa no topo e as outras seguem no sentido horário; o ponteiro fica embaixo.
  // Depois de girar a roda `angulo` graus no sentido horário, devolve a fatia sob o ponteiro.
  function fatiaNoPonteiro(angulo, fatias) {
    var tamanho = 360 / fatias;
    var noPonteiro = ((180 - angulo) % 360 + 360) % 360;
    return Math.floor(noPonteiro / tamanho) % fatias;
  }

  // Fisher-Yates numa cópia: a ordem em que os nomes passam durante o giro.
  function embaralhar(lista, aleatorio) {
    var copia = lista.slice();
    for (var i = copia.length - 1; i > 0; i--) {
      var j = Math.floor(aleatorio() * (i + 1));
      var troca = copia[i];
      copia[i] = copia[j];
      copia[j] = troca;
    }
    return copia;
  }

  var api = { sortear: sortear, limpar: limpar, anguloFinal: anguloFinal, desacelerar: desacelerar, fatiaNoPonteiro: fatiaNoPonteiro, embaralhar: embaralhar };

  raiz.PI = raiz.PI || {};
  raiz.PI.roleta = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
