/* Roleta na tela: sorteia pelo estado e anima na janela principal.
   Esperando, a roda balança devagar. No sorteio, só a roda gira (o ponteiro fica parado) e vai
   desacelerando; a cada fatia que passa pelo ponteiro, ele dá um tranco, o nome de um candidato
   aparece e toca um tique. No fim, a fatia sorteada acende, o nome do vencedor entra com um salto,
   sai confete e toca um plim. Só transform e opacity; com movimento reduzido, vai direto ao fim. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var DURACAO_MS = 5200;
  var VOLTAS = 7;
  var FATIAS = 8;
  var CONFETES = 28;
  var CONFETE_MS = 1900;
  var DISTANCIA_MIN = 180;
  var DISTANCIA_MAX = 420;
  var CORES_CONFETE = ['vermelho', 'amarelo', 'verde', 'azul', 'laranja', 'rosa', 'celeste'];
  var vistoEm = null;
  var anguloAtual = 0;
  var quadroPendente = null;
  var audio = null;

  function nomeDe(estado, id) {
    var j = estado.jogadores.filter(function (x) { return x.id === id; })[0];
    return j ? j.nome : '';
  }

  function sortearAgora() {
    prepararAudio();
    var estado = PI.loja.obter();
    var candidatos = PI.placar.candidatosSorteio(estado).map(function (j) { return j.id; });
    var r = PI.roleta.sortear(candidatos, estado.roleta, Math.random, Date.now());
    if (!r.ok) {
      PI.loja.avisar(r.erro, 'erro');
      return;
    }
    PI.loja.atualizar(function (e) { return Object.assign({}, e, { roleta: r.roleta }); });
  }

  function reduzirMovimento() {
    return raiz.matchMedia && raiz.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---------- som (respeita a tecla S) ----------

  // Só toca depois de um gesto nesta janela (regra dos navegadores); sorteio vindo do painel fica mudo.
  function prepararAudio() {
    var Contexto = raiz.AudioContext || raiz.webkitAudioContext;
    if (!Contexto) { return; }
    if (!audio) { audio = new Contexto(); }
    if (audio.state === 'suspended') {
      audio.resume().catch(function (erro) { console.error('Áudio da roleta não liberado:', erro.message); });
    }
  }

  function bip(frequencia, atraso, duracao, volume) {
    if (!audio || audio.state !== 'running' || !PI.loja.obter().som) { return; }
    var t = audio.currentTime + atraso;
    var osc = audio.createOscillator();
    var ganho = audio.createGain();
    osc.type = 'triangle';
    osc.frequency.value = frequencia;
    ganho.gain.setValueAtTime(0.0001, t);
    ganho.gain.exponentialRampToValueAtTime(volume, t + 0.005);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
    osc.connect(ganho);
    ganho.connect(audio.destination);
    osc.start(t);
    osc.stop(t + duracao + 0.02);
  }

  function tique() { bip(1500, 0, 0.04, 0.08); }
  function plim() { bip(880, 0, 0.45, 0.22); bip(1320, 0.12, 0.6, 0.18); }

  // ---------- peças da roda ----------

  function rodaNaTela(palco) {
    var roda = palco.querySelector('.roleta');
    if (roda) { return roda; }
    var nova = PI.modelosApoio.roleta();
    var camada = PI.pecas.el('div', 'roleta-sobreposta', [nova]);
    palco.firstChild.appendChild(camada);
    return nova;
  }

  function pecasDaRoda(palco) {
    var roleta = rodaNaTela(palco);
    return {
      roleta: roleta,
      giro: roleta.querySelector('.roleta__giro'),
      ponteiro: roleta.querySelector('.roleta__ponteiro'),
      resultado: roleta.querySelector('.roleta__resultado'),
      fatias: roleta.querySelectorAll('.roleta__fatias path')
    };
  }

  // Ângulo em que a roda está agora, contando o balanço da espera (lido da matriz calculada).
  function anguloDe(giro) {
    var t = raiz.getComputedStyle(giro).transform;
    if (!t || t === 'none' || !raiz.DOMMatrixReadOnly) { return anguloAtual % 360; }
    var m = new raiz.DOMMatrixReadOnly(t);
    return Math.atan2(m.b, m.a) * 180 / Math.PI;
  }

  function prepararGiro(pecas, angulo) {
    pecas.roleta.classList.remove('roleta--ociosa', 'roleta--revelada');
    pecas.roleta.classList.add('roleta--girando');
    Array.prototype.forEach.call(pecas.fatias, function (f) { f.classList.remove('fatia--vencedora'); });
    // Os nomes passando não são lidos um por um pelo leitor de tela; só o vencedor.
    pecas.resultado.setAttribute('aria-hidden', 'true');
    pecas.resultado.textContent = '';
    pecas.giro.style.transform = 'rotate(' + angulo + 'deg)';
  }

  function darTranco(ponteiro) {
    ponteiro.classList.remove('roleta__ponteiro--tranco');
    // Força o navegador a notar a retirada para a animação recomeçar a cada fatia.
    void ponteiro.getBoundingClientRect();
    ponteiro.classList.add('roleta__ponteiro--tranco');
  }

  function soltarConfete(roleta) {
    var camada = PI.pecas.el('div', 'roleta__confete');
    camada.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < CONFETES; i++) {
      var direcao = Math.random() * 2 * Math.PI;
      var distancia = DISTANCIA_MIN + Math.random() * (DISTANCIA_MAX - DISTANCIA_MIN);
      var peca = PI.pecas.el('span', 'confete confete--' + CORES_CONFETE[i % CORES_CONFETE.length]);
      peca.style.setProperty('--dx', Math.round(Math.cos(direcao) * distancia) + 'px');
      peca.style.setProperty('--dy', Math.round(Math.sin(direcao) * distancia) + 'px');
      peca.style.setProperty('--giro', Math.round(Math.random() * 720 - 360) + 'deg');
      peca.style.setProperty('--atraso', Math.round(Math.random() * 150) + 'ms');
      camada.appendChild(peca);
    }
    roleta.appendChild(camada);
    raiz.setTimeout(function () { camada.remove(); }, CONFETE_MS);
  }

  function revelar(pecas, angulo, vencedor, comFesta) {
    anguloAtual = angulo;
    pecas.giro.style.transform = 'rotate(' + angulo + 'deg)';
    var fatia = pecas.fatias[PI.roleta.fatiaNoPonteiro(angulo, FATIAS)];
    if (fatia) { fatia.classList.add('fatia--vencedora'); }
    pecas.resultado.removeAttribute('aria-hidden');
    pecas.resultado.textContent = vencedor;
    pecas.roleta.classList.remove('roleta--girando');
    pecas.roleta.classList.add('roleta--revelada');
    if (comFesta) {
      soltarConfete(pecas.roleta);
      plim();
    }
  }

  // ---------- giro ----------

  function animar(palco, estado, vencedor) {
    if (quadroPendente) { raiz.cancelAnimationFrame(quadroPendente); quadroPendente = null; }
    var pecas = pecasDaRoda(palco);
    var nomes = PI.roleta.embaralhar(PI.placar.candidatosSorteio(estado).map(function (j) { return j.nome; }), Math.random);
    if (!nomes.length) { nomes = [vencedor]; }
    var inicio = anguloDe(pecas.giro);
    var fim = inicio + PI.roleta.anguloFinal(VOLTAS, Math.random);
    prepararGiro(pecas, inicio);
    if (reduzirMovimento()) { revelar(pecas, fim, vencedor, false); return; }

    var comeco = null;
    var fatia = PI.roleta.fatiaNoPonteiro(inicio, FATIAS);
    var proximoNome = 0;
    function quadro(agora) {
      if (comeco === null) { comeco = agora; }
      // Se o slide foi redesenhado no meio do giro, continua na roda nova.
      if (!pecas.roleta.isConnected) {
        pecas = pecasDaRoda(palco);
        prepararGiro(pecas, inicio);
      }
      var t = (agora - comeco) / DURACAO_MS;
      var angulo = inicio + (fim - inicio) * PI.roleta.desacelerar(t);
      pecas.giro.style.transform = 'rotate(' + angulo + 'deg)';
      var agoraNa = PI.roleta.fatiaNoPonteiro(angulo, FATIAS);
      if (agoraNa !== fatia) {
        fatia = agoraNa;
        darTranco(pecas.ponteiro);
        pecas.resultado.textContent = nomes[proximoNome++ % nomes.length];
        tique();
      }
      if (t < 1) {
        quadroPendente = raiz.requestAnimationFrame(quadro);
        return;
      }
      quadroPendente = null;
      revelar(pecas, fim, vencedor, true);
    }
    quadroPendente = raiz.requestAnimationFrame(quadro);
  }

  // Chamado depois de cada desenho: anima só quando chega um sorteio novo.
  function aoMudar(estado, palco) {
    var ultimo = estado.roleta.ultimo;
    if (!ultimo || ultimo.em === vistoEm) { return; }
    var primeiraVez = vistoEm === null;
    vistoEm = ultimo.em;
    if (primeiraVez || !palco) { return; }
    animar(palco, estado, nomeDe(estado, ultimo.id));
  }

  function iniciar() {
    var u = PI.loja.obter().roleta.ultimo;
    vistoEm = u ? u.em : 0;
  }

  PI.roletaUi = { iniciar: iniciar, sortearAgora: sortearAgora, aoMudar: aoMudar, nomeDe: nomeDe };
})(window);
