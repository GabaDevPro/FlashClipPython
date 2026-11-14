/* Estado salvo no navegador: valor inicial, validação, exportar e importar o placar. */
(function (raiz) {
  'use strict';

  var VERSAO = 1;
  var MAX_JOGADORES = 200;
  var MAX_NOME = 40;
  var LIMITE_BYTES = 200000;
  var MINUTO_MS = 60000;

  function inicial(atividades) {
    var primeira = Object.keys(atividades)[0];
    var duracao = (atividades[primeira] ? atividades[primeira].minutos : 0) * MINUTO_MS;
    return {
      versao: VERSAO,
      slide: 0,
      jogadores: [],
      resultados: {},
      cronometro: { alvo: primeira, duracaoMs: duracao, rodando: false, terminaEm: null, restanteMs: duracao },
      roleta: { semRepetir: true, sorteados: [] },
      melhorJogada: null,
      som: true
    };
  }

  function ehObjeto(x) { return x !== null && typeof x === 'object' && !Array.isArray(x); }
  function ehNumero(x) { return typeof x === 'number' && isFinite(x); }

  function erroJogadores(lista) {
    if (!Array.isArray(lista)) { return 'lista de jogadores inválida'; }
    if (lista.length > MAX_JOGADORES) { return 'mais de ' + MAX_JOGADORES + ' jogadores'; }
    var ids = {};
    for (var i = 0; i < lista.length; i++) {
      var j = lista[i];
      if (!ehObjeto(j) || typeof j.id !== 'string' || !/^j\d+$/.test(j.id)) { return 'jogador sem id válido'; }
      if (typeof j.nome !== 'string' || !j.nome.trim()) { return 'nome do jogador inválido'; }
      if (j.nome.length > MAX_NOME) { return 'nome com mais de ' + MAX_NOME + ' caracteres'; }
      if (typeof j.acertou !== 'boolean' || !ehNumero(j.ordem)) { return 'dados do jogador ' + j.nome + ' inválidos'; }
      if (ids[j.id]) { return 'jogador repetido (' + j.id + ')'; }
      ids[j.id] = true;
    }
    return null;
  }

  function erroResultados(resultados, jogadores, atividades) {
    if (!ehObjeto(resultados)) { return 'resultados inválidos'; }
    var ids = {};
    jogadores.forEach(function (j) { ids[j.id] = true; });
    var chaves = Object.keys(resultados);
    for (var i = 0; i < chaves.length; i++) {
      var lista = resultados[chaves[i]];
      if (!atividades[chaves[i]]) { return 'atividade desconhecida (' + chaves[i] + ')'; }
      if (!Array.isArray(lista) || lista.length > 3 || new Set(lista).size !== lista.length) { return 'top 3 inválido na atividade ' + chaves[i]; }
      for (var k = 0; k < lista.length; k++) {
        if (!ids[lista[k]]) { return 'jogador inexistente no resultado da atividade ' + chaves[i]; }
      }
    }
    return null;
  }

  function erroCronometro(c) {
    var ok = ehObjeto(c) && typeof c.alvo === 'string' && ehNumero(c.duracaoMs) && typeof c.rodando === 'boolean' &&
      (c.terminaEm === null || ehNumero(c.terminaEm)) && ehNumero(c.restanteMs) && c.restanteMs >= 0;
    return ok ? null : 'cronômetro inválido';
  }

  function erroRoleta(r) {
    var ultimoOk = !ehObjeto(r) || r.ultimo === undefined || r.ultimo === null ||
      (ehObjeto(r.ultimo) && typeof r.ultimo.id === 'string' && ehNumero(r.ultimo.em));
    var ok = ehObjeto(r) && typeof r.semRepetir === 'boolean' && Array.isArray(r.sorteados) &&
      r.sorteados.every(function (s) { return typeof s === 'string'; }) && ultimoOk;
    return ok ? null : 'roleta inválida';
  }

  function validar(e, atividades) {
    if (!ehObjeto(e)) { return { ok: false, erro: 'o arquivo não tem um objeto de placar' }; }
    if (e.versao !== VERSAO) { return { ok: false, erro: 'versão do placar não suportada' }; }
    var erro = erroJogadores(e.jogadores) ||
      erroResultados(e.resultados, e.jogadores, atividades) ||
      (Number.isInteger(e.slide) && e.slide >= 0 ? null : 'slide inválido') ||
      erroCronometro(e.cronometro) ||
      erroRoleta(e.roleta) ||
      (e.melhorJogada === null || e.melhorJogada === undefined || typeof e.melhorJogada === 'string' ? null : 'melhor jogada inválida') ||
      (typeof e.som === 'boolean' ? null : 'som inválido');
    return erro ? { ok: false, erro: erro } : { ok: true };
  }

  function exportar(e) { return JSON.stringify(e, null, 2); }

  function importar(texto, atividades) {
    if (typeof texto !== 'string') { return { ok: false, erro: 'Nada para importar.' }; }
    if (texto.length > LIMITE_BYTES) { return { ok: false, erro: 'Arquivo grande demais para ser um placar.' }; }
    var obj;
    try {
      obj = JSON.parse(texto);
    } catch (erro) {
      return { ok: false, erro: 'O arquivo não é um JSON válido.' };
    }
    var r = validar(obj, atividades);
    if (!r.ok) { return { ok: false, erro: 'Placar inválido: ' + r.erro + '.' }; }
    return { ok: true, estado: Object.assign({ melhorJogada: null }, obj) };
  }

  function carregar(texto, atividades) {
    if (texto === null || texto === undefined) { return { estado: inicial(atividades), aviso: null }; }
    var r = importar(texto, atividades);
    if (!r.ok) { return { estado: inicial(atividades), aviso: 'O placar salvo foi ignorado. ' + r.erro }; }
    return { estado: r.estado, aviso: null };
  }

  function nomeArquivo(data) {
    var dois = function (n) { return (n < 10 ? '0' : '') + n; };
    return 'placar-' + data.getFullYear() + '-' + dois(data.getMonth() + 1) + '-' + dois(data.getDate()) + '-' + dois(data.getHours()) + dois(data.getMinutes()) + '.json';
  }

  var api = { VERSAO: VERSAO, LIMITE_BYTES: LIMITE_BYTES, inicial: inicial, validar: validar, exportar: exportar, importar: importar, carregar: carregar, nomeArquivo: nomeArquivo };

  raiz.PI = raiz.PI || {};
  raiz.PI.estado = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
