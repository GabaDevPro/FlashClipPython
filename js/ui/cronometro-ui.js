/* Cronômetro na tela: atualiza os mostradores, troca de atividade e toca o aviso no fim. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var TICK_MS = 200;
  var NOTAS = [0, 0.35, 0.7];
  var audio = null;
  var ultimo = { chave: null, restante: 0 };
  var comSom = true;

  function prepararAudio() {
    var Contexto = raiz.AudioContext || raiz.webkitAudioContext;
    if (!Contexto) { return; }
    if (!audio) { audio = new Contexto(); }
    if (audio.state === 'suspended') {
      audio.resume().catch(function (erro) { console.error('Áudio não liberado:', erro.message); });
    }
  }

  function tocarAviso() {
    if (!audio) { return; }
    var t = audio.currentTime;
    NOTAS.forEach(function (d) {
      var osc = audio.createOscillator();
      var ganho = audio.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      ganho.gain.setValueAtTime(0.0001, t + d);
      ganho.gain.exponentialRampToValueAtTime(0.3, t + d + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.28);
      osc.connect(ganho);
      ganho.connect(audio.destination);
      osc.start(t + d);
      osc.stop(t + d + 0.3);
    });
  }

  function alvoDoSlide(slide) {
    return slide.atividade || slide.cronometro || null;
  }

  function minutosDoAlvo(config, alvo) {
    if (config.atividades[alvo]) { return config.atividades[alvo].minutos; }
    return config.tempos[alvo] || 0;
  }

  // Ao entrar num slide de atividade, prepara o cronômetro dela se o atual estiver parado.
  function aoEntrar(estado, slide, config) {
    var alvo = alvoDoSlide(slide);
    if (!alvo || estado.cronometro.alvo === alvo || estado.cronometro.rodando) { return estado; }
    return Object.assign({}, estado, { cronometro: PI.cronometro.criar(alvo, minutosDoAlvo(config, alvo) * PI.cronometro.MINUTO_MS) });
  }

  function atualizarMostradores(c, agora) {
    var restante = PI.cronometro.restante(c, agora);
    var fase = PI.cronometro.fase(c, agora);
    var texto = PI.cronometro.formatar(restante);
    var mostradores = document.querySelectorAll('[data-cronometro]');
    for (var i = 0; i < mostradores.length; i++) {
      var m = mostradores[i];
      if (m.getAttribute('data-alvo') !== c.alvo) { continue; }
      var tempo = m.querySelector('.cronometro__tempo');
      if (tempo.textContent !== texto) { tempo.textContent = texto; }
      m.classList.toggle('cronometro--longo', texto.length > 4);
      m.classList.toggle('cronometro--em-alerta', fase !== 'normal');
      m.classList.toggle('cronometro--fim', fase === 'fim');
      m.classList.toggle('cronometro--rodando', c.rodando);
    }
    return restante;
  }

  function tick() {
    var estado = PI.loja.obter();
    var c = estado.cronometro;
    var restante = atualizarMostradores(c, Date.now());
    var chave = c.alvo + ':' + c.terminaEm;
    if (comSom && c.rodando && chave === ultimo.chave && ultimo.restante > 0 && restante === 0 && estado.som) { tocarAviso(); }
    ultimo = { chave: chave, restante: restante };
  }

  function iniciar(opcoes) {
    comSom = !(opcoes && opcoes.semSom);
    document.addEventListener('keydown', prepararAudio, true);
    document.addEventListener('pointerdown', prepararAudio, true);
    raiz.setInterval(tick, TICK_MS);
    tick();
  }

  PI.cronometroUi = { iniciar: iniciar, aoEntrar: aoEntrar, alvoDoSlide: alvoDoSlide, tick: tick };
})(window);
