/* Placar: jogadores, top 3 por atividade, ranking e candidatos ao sorteio. Funções puras. */
(function (raiz) {
  'use strict';

  var MAX_NOME = 40;
  var MAX_TOP = 3;
  // Mesma regra de js/logica/estado.js: controle, largura zero e direção de texto.
  var CARACTERE_PROIBIDO = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/;

  function premiosDe(atividades, a) {
    return Object.prototype.hasOwnProperty.call(atividades, a) ? atividades[a].premios : null;
  }

  function normalizar(nome) { return String(nome).trim().toLowerCase(); }

  function validarNome(e, nome, ignorarId) {
    var limpo = String(nome === undefined || nome === null ? '' : nome).trim();
    if (!limpo) { throw new Error('O nome está vazio.'); }
    if (limpo.length > MAX_NOME) { throw new Error('O nome passa de ' + MAX_NOME + ' caracteres.'); }
    if (CARACTERE_PROIBIDO.test(limpo)) { throw new Error('O nome tem caractere invisível ou de controle.'); }
    var repetido = e.jogadores.some(function (j) { return j.id !== ignorarId && normalizar(j.nome) === normalizar(limpo); });
    if (repetido) { throw new Error('Esse nome já existe no placar.'); }
    return limpo;
  }

  function proximoNumero(jogadores, campo) {
    return jogadores.reduce(function (max, j) {
      var n = campo === 'id' ? Number(j.id.slice(1)) : j.ordem;
      return Math.max(max, n);
    }, 0) + 1;
  }

  function adicionarJogador(e, nome) {
    var limpo = validarNome(e, nome, null);
    var novo = { id: 'j' + proximoNumero(e.jogadores, 'id'), nome: limpo, acertou: false, ordem: proximoNumero(e.jogadores, 'ordem') };
    return Object.assign({}, e, { jogadores: e.jogadores.concat([novo]) });
  }

  function alterarJogador(e, id, mudanca) {
    return Object.assign({}, e, {
      jogadores: e.jogadores.map(function (j) { return j.id === id ? Object.assign({}, j, mudanca) : j; })
    });
  }

  function renomearJogador(e, id, nome) {
    return alterarJogador(e, id, { nome: validarNome(e, nome, id) });
  }

  function marcarAcertou(e, id, acertou) {
    return alterarJogador(e, id, { acertou: !!acertou });
  }

  function removerJogador(e, id) {
    var resultados = {};
    Object.keys(e.resultados).forEach(function (a) {
      var lista = e.resultados[a].filter(function (x) { return x !== id; });
      if (lista.length) { resultados[a] = lista; }
    });
    return Object.assign({}, e, { jogadores: e.jogadores.filter(function (j) { return j.id !== id; }), resultados: resultados });
  }

  function registrarTop3(e, atividade, ids) {
    var lista = ids.filter(Boolean);
    if (lista.length > MAX_TOP) { throw new Error('O top 3 aceita no máximo ' + MAX_TOP + ' jogadores.'); }
    if (new Set(lista).size !== lista.length) { throw new Error('Jogador repetido no top 3.'); }
    lista.forEach(function (id) {
      if (!e.jogadores.some(function (j) { return j.id === id; })) { throw new Error('Esse jogador não existe no placar.'); }
    });
    var resultados = Object.assign({}, e.resultados);
    if (lista.length) { resultados[atividade] = lista; } else { delete resultados[atividade]; }
    return Object.assign({}, e, { resultados: resultados });
  }

  function ranking(e, atividades) {
    var contas = e.jogadores.map(function (j) { return { id: j.id, nome: j.nome, ordem: j.ordem, total: 0, primeiros: 0 }; });
    var porId = {};
    contas.forEach(function (c) { porId[c.id] = c; });
    Object.keys(e.resultados).forEach(function (a) {
      var premios = premiosDe(atividades, a);
      if (!premios) { return; }
      e.resultados[a].forEach(function (id, pos) {
        if (!porId[id]) { return; }
        porId[id].total += premios[pos] || 0;
        if (pos === 0) { porId[id].primeiros += 1; }
      });
    });
    contas.sort(function (a, b) { return b.total - a.total || b.primeiros - a.primeiros || a.ordem - b.ordem; });
    return contas.map(function (c, i) { return Object.assign({}, c, { posicao: i + 1 }); });
  }

  function top3(e, atividade, atividades) {
    var premios = premiosDe(atividades, atividade) || [];
    var lista = Object.prototype.hasOwnProperty.call(e.resultados, atividade) ? e.resultados[atividade] : [];
    return lista.map(function (id, i) {
      var j = e.jogadores.filter(function (x) { return x.id === id; })[0];
      return { posicao: i + 1, id: id, nome: j ? j.nome : '', valor: premios[i] || 0 };
    });
  }

  function candidatosSorteio(e) {
    var premiados = {};
    Object.keys(e.resultados).forEach(function (a) { e.resultados[a].forEach(function (id) { premiados[id] = true; }); });
    return e.jogadores
      .filter(function (j) { return j.acertou || premiados[j.id]; })
      .slice()
      .sort(function (a, b) { return a.ordem - b.ordem; });
  }

  function marcarPorLista(e, texto) {
    var desconhecidos = [];
    var estado = e;
    String(texto).split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).forEach(function (nome) {
      var j = estado.jogadores.filter(function (x) { return normalizar(x.nome) === normalizar(nome); })[0];
      if (j) { estado = marcarAcertou(estado, j.id, true); } else { desconhecidos.push(nome); }
    });
    return { estado: estado, desconhecidos: desconhecidos };
  }

  var api = {
    MAX_NOME: MAX_NOME, adicionarJogador: adicionarJogador, renomearJogador: renomearJogador, marcarAcertou: marcarAcertou,
    removerJogador: removerJogador, registrarTop3: registrarTop3, ranking: ranking, top3: top3,
    candidatosSorteio: candidatosSorteio, marcarPorLista: marcarPorLista
  };

  raiz.PI = raiz.PI || {};
  raiz.PI.placar = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
