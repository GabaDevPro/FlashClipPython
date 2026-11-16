/* Animações da janela principal (F13): entrada do slide, cartas do top 3, dinheiro subindo no ranking
   e dados rolando ao iniciar o cronômetro. A roleta anima em roleta-ui.js. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var INTERVALO_CARTAS_MS = 260;
  var INTERVALO_LINHAS_MS = 70;
  var ATRASO_MAGNATA_MS = 300;
  var DINHEIRO_MS = 1200;
  var DADO_MS = 700;
  var FACE_MS = 90;
  // O slide é redesenhado a cada mudança de estado: compara com o desenho anterior e anima só o que mudou.
  var antes = { indice: null, rodando: null, nomes: [], valores: {} };

  function reduzir() {
    return !!(raiz.matchMedia && raiz.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function lista(no, seletor) { return Array.prototype.slice.call(no.querySelectorAll(seletor)); }

  function animar(el, classe, atrasoMs) {
    el.style.animationDelay = atrasoMs + 'ms';
    el.classList.add(classe);
  }

  // Revela do 3º para o 1º. No mesmo slide, vira só a carta cujo nome mudou.
  function virarCartas(no, slideNovo) {
    var cartas = lista(no, '.top3__carta');
    var nomes = cartas.map(function (c) { return c.querySelector('.top3__nome').textContent; });
    cartas.filter(function (c, i) {
      return !c.classList.contains('top3__carta--vazia') && (slideNovo || nomes[i] !== antes.nomes[i]);
    }).reverse().forEach(function (c, i) { animar(c, 'carta--virando', i * INTERVALO_CARTAS_MS); });
    antes.nomes = nomes;
    var magnata = no.querySelector('[data-magnata]');
    if (magnata && slideNovo) { animar(magnata, 'carta--virando', ATRASO_MAGNATA_MS); }
  }

  function contar(el, de, ate) {
    var inicio = null;
    function passo(agora) {
      if (!el.isConnected) { return; }
      if (inicio === null) { inicio = agora; }
      var t = Math.min(1, (agora - inicio) / DINHEIRO_MS);
      el.textContent = PI.dinheiro(Math.round(de + (ate - de) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) { raiz.requestAnimationFrame(passo); }
    }
    el.textContent = PI.dinheiro(de);
    raiz.requestAnimationFrame(passo);
  }

  // Ao entrar, as linhas sobem e o dinheiro conta do zero; no mesmo slide, conta do valor anterior.
  function subirDinheiro(no, slideNovo) {
    var valores = {};
    lista(no, '.ranking__linha').forEach(function (linha, i) {
      var v = linha.querySelector('[data-valor]');
      var id = v.getAttribute('data-id');
      var ate = Number(v.getAttribute('data-valor'));
      var de = slideNovo || antes.valores[id] === undefined ? 0 : antes.valores[id];
      valores[id] = ate;
      if (slideNovo) { animar(linha, 'ranking__linha--subindo', i * INTERVALO_LINHAS_MS); }
      if (de !== ate && !reduzir()) { contar(v, de, ate); }
    });
    antes.valores = valores;
  }

  function face() { return 1 + Math.floor(Math.random() * 6); }

  function trocarFace(dado, n) { dado.replaceChildren.apply(dado, lista(PI.pecas.dado(n), 'span')); }

  function rolarDados(no) {
    lista(no, '.enunciado__lado .dado').forEach(function (dado) {
      var final = face();
      if (reduzir()) { trocarFace(dado, final); return; }
      var fim = Date.now() + DADO_MS;
      dado.classList.add('dado--rolando');
      var relogio = raiz.setInterval(function () {
        var acabou = Date.now() >= fim;
        trocarFace(dado, acabou ? final : face());
        if (acabou) {
          raiz.clearInterval(relogio);
          dado.classList.remove('dado--rolando');
        }
      }, FACE_MS);
    });
  }

  // Chamado por app.js depois de pôr o slide novo no palco.
  function aplicar(no, indice, estado) {
    var slideNovo = indice !== antes.indice;
    var rodando = estado.cronometro.rodando;
    if (slideNovo) { no.classList.add('slide--entrando'); }
    virarCartas(no, slideNovo);
    subirDinheiro(no, slideNovo);
    if (!slideNovo && rodando && antes.rodando === false) { rolarDados(no); }
    antes.indice = indice;
    antes.rodando = rodando;
  }

  PI.efeitos = { aplicar: aplicar };
})(window);
