/* Relógio da aula: linha do tempo do cronograma, etapa prevista e adiantado ou atrasado. */
(function (raiz) {
  'use strict';

  function deslocamentoBloco2(cronograma) {
    return cronograma.filter(function (c) { return c.bloco === 1; })
      .reduce(function (max, c) { return Math.max(max, c.fimMin); }, 0);
  }

  function absoluto(bloco, minuto, deslocamento) {
    return bloco === 2 ? deslocamento + minuto : minuto;
  }

  function linhaDoTempo(cronograma) {
    var d = deslocamentoBloco2(cronograma);
    return cronograma.map(function (c) {
      return { etapa: c.etapa, inicio: absoluto(c.bloco, c.inicioMin, d), fim: absoluto(c.bloco, c.fimMin, d) };
    });
  }

  function minutosDesde(inicio, agora) {
    var partes = inicio.split(':').map(Number);
    var base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), partes[0], partes[1]);
    return (agora - base) / 60000;
  }

  function etapaEm(linha, minuto) {
    if (!linha.length || minuto < linha[0].inicio) { return 'antes do início'; }
    if (minuto >= linha[linha.length - 1].fim) { return 'fim do cronograma'; }
    for (var i = 0; i < linha.length; i++) {
      if (minuto >= linha[i].inicio && minuto < linha[i].fim) { return linha[i].etapa; }
    }
    return 'fora do cronograma';
  }

  function janelaDaSecao(secao, cronograma) {
    var d = deslocamentoBloco2(cronograma);
    return { inicio: absoluto(secao.bloco, secao.inicioMin, d), fim: absoluto(secao.bloco, secao.fimMin, d) };
  }

  function ritmo(janela, minuto) {
    if (minuto < janela.inicio) { return { estado: 'adiantado', minutos: Math.round(janela.inicio - minuto) }; }
    if (minuto > janela.fim) { return { estado: 'atrasado', minutos: Math.round(minuto - janela.fim) }; }
    return { estado: 'no tempo', minutos: 0 };
  }

  function hora(data) {
    var dois = function (n) { return (n < 10 ? '0' : '') + n; };
    return dois(data.getHours()) + ':' + dois(data.getMinutes());
  }

  var api = { linhaDoTempo: linhaDoTempo, minutosDesde: minutosDesde, etapaEm: etapaEm, janelaDaSecao: janelaDaSecao, ritmo: ritmo, hora: hora };

  raiz.PI = raiz.PI || {};
  raiz.PI.cronograma = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
