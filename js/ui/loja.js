/* Loja do estado: guarda no localStorage, avisa quem desenha e permite desfazer mudanças do placar. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var CHAVE = 'pi:estado:v1';
  var MAX_PILHA = 30;
  var TEMPO_AVISO_MS = 4000;
  var atual = null;
  var atividades = {};
  var tempos = {};
  var ouvintes = [];
  var pilha = [];
  var caixaAvisos = null;
  var temporizador = null;

  function avisar(texto, tipo) {
    if (!caixaAvisos) { caixaAvisos = document.getElementById('avisos'); }
    if (!caixaAvisos) { return; }
    caixaAvisos.textContent = texto;
    caixaAvisos.className = 'avisos' + (tipo === 'erro' ? ' avisos--erro' : '');
    caixaAvisos.hidden = false;
    raiz.clearTimeout(temporizador);
    temporizador = raiz.setTimeout(function () { caixaAvisos.hidden = true; }, TEMPO_AVISO_MS);
  }

  function ler() {
    try {
      return raiz.localStorage.getItem(CHAVE);
    } catch (erro) {
      console.error('localStorage indisponível:', erro.message);
      avisar('O navegador bloqueou o armazenamento. O placar não vai ficar salvo.', 'erro');
      return null;
    }
  }

  function gravar(estado) {
    try {
      raiz.localStorage.setItem(CHAVE, PI.estado.exportar(estado));
    } catch (erro) {
      console.error('Falha ao salvar o estado:', erro.message);
      avisar('Não deu para salvar no navegador. Exporte o placar para não perder.', 'erro');
    }
  }

  function iniciar(config) {
    atividades = config.atividades;
    tempos = config.tempos;
    var r = PI.estado.carregar(ler(), atividades, tempos);
    atual = r.estado;
    if (r.aviso) {
      console.error(r.aviso);
      avisar(r.aviso, 'erro');
    }
    return atual;
  }

  function notificar(opcoes) {
    ouvintes.forEach(function (f) { f(atual, opcoes); });
  }

  function definir(novo, opcoes) {
    var op = opcoes || {};
    if (op.desfazivel) {
      pilha.push(atual);
      if (pilha.length > MAX_PILHA) { pilha.shift(); }
    }
    atual = novo;
    gravar(atual);
    notificar(op);
  }

  function atualizar(transformar, opcoes) {
    definir(transformar(atual), opcoes);
  }

  function desfazer() {
    if (!pilha.length) { return false; }
    var anterior = pilha.pop();
    atual = Object.assign({}, anterior, { slide: atual.slide, cronometro: atual.cronometro });
    gravar(atual);
    notificar({ desfeito: true });
    return true;
  }

  function substituirDeFora(texto) {
    var r = PI.estado.importar(texto, atividades, tempos);
    if (!r.ok) { return; }
    atual = r.estado;
    notificar({ deFora: true });
  }

  raiz.addEventListener('storage', function (e) {
    if (e.key === CHAVE && e.newValue) { substituirDeFora(e.newValue); }
  });

  PI.loja = {
    CHAVE: CHAVE,
    iniciar: iniciar,
    obter: function () { return atual; },
    definir: definir,
    atualizar: atualizar,
    desfazer: desfazer,
    podeDesfazer: function () { return pilha.length > 0; },
    ouvir: function (f) { ouvintes.push(f); },
    avisar: avisar
  };
})(window);
