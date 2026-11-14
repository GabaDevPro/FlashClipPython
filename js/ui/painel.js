/* Painel do apresentador (apresentador.html): slide atual e próximo, roteiro, cronômetro,
   relógio da aula, roleta e placar. Conversa com a janela principal pelo estado no localStorage. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var P = PI.pecas;
  var el = P.el, txt = P.txt;
  var ESCALA_ATUAL = 0.36, ESCALA_PROXIMO = 0.16;
  var RELOGIO_MS = 1000;
  var slides = PI.conteudo.achatarSecoes(PI.secoes());
  var secoes = PI.secoes();
  var config = PI.config;
  var ctx = { config: config };
  var raizPainel, relogio, anuncio;
  var ultimoMinutoAnunciado = null;

  function indiceAtual() { return PI.navegacao.limitar(PI.loja.obter().slide, slides.length); }

  function ir(indice) {
    var novo = PI.navegacao.limitar(indice, slides.length);
    PI.loja.atualizar(function (e) {
      return PI.cronometroUi.aoEntrar(Object.assign({}, e, { slide: novo }), slides[novo], config);
    });
  }

  function mudarCronometro(transformar) {
    PI.loja.atualizar(function (e) { return Object.assign({}, e, { cronometro: transformar(e.cronometro, Date.now()) }); });
  }

  function botao(rotulo, aoClicar, classe) {
    var b = txt('button', 'placar-ui__botao' + (classe ? ' ' + classe : ''), rotulo);
    b.type = 'button';
    b.addEventListener('click', aoClicar);
    return b;
  }

  function miniatura(slide, escala, rotulo) {
    var interno = el('div', 'miniatura__palco');
    interno.style.transform = 'scale(' + escala + ')';
    if (slide) {
      var no = PI.modelos[slide.layout](slide, ctx);
      PI.preencher(no, PI.loja.obter(), config);
      interno.appendChild(no);
    } else {
      interno.appendChild(txt('p', 'miniatura__fim', 'Fim da apresentação'));
    }
    var caixa = el('figure', 'miniatura', [interno]);
    caixa.style.width = 1920 * escala + 'px';
    caixa.style.height = 1080 * escala + 'px';
    return el('div', 'painel__previa', [txt('span', 'rotulo', rotulo), caixa]);
  }

  function bloco(titulo, texto) {
    if (!texto) { return null; }
    return el('section', 'painel__roteiro-bloco', [txt('h3', '', titulo), txt('p', '', texto)]);
  }

  function roteiro(slide) {
    var partes = [bloco('Fala', slide.fala), bloco('Interação', slide.interacao), bloco('Resposta', slide.resposta)].filter(Boolean);
    return el('div', 'painel__roteiro', partes.length ? partes : [txt('p', 'placar-ui__nota', 'O roteiro não traz fala para este slide.')]);
  }

  function irPara() {
    var campo = el('input', 'placar-ui__campo');
    campo.placeholder = 'nº';
    campo.size = 4;
    campo.setAttribute('aria-label', 'Número do slide');
    var form = el('form', 'placar-ui__linha', [campo, txt('button', 'placar-ui__botao placar-ui__botao--leve', 'Ir')]);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var i = PI.conteudo.indicePorNumero(slides, campo.value);
      if (i < 0) { PI.loja.avisar('Não existe o slide ' + campo.value, 'erro'); return; }
      ir(i);
    });
    return form;
  }

  function cronometro(estado) {
    var c = estado.cronometro;
    var nome = config.atividades[c.alvo] ? config.atividades[c.alvo].nome : 'Intervalo';
    var mostrador = el('div', 'painel__cronometro', [txt('span', 'cronometro__tempo', PI.cronometro.formatar(PI.cronometro.restante(c, Date.now())))]);
    mostrador.setAttribute('data-cronometro', '');
    mostrador.setAttribute('data-alvo', c.alvo);
    mostrador.setAttribute('role', 'timer');
    return el('section', 'painel__caixa', [txt('h3', '', 'Cronômetro: ' + nome), mostrador, el('div', 'placar-ui__linha', [
      botao(c.rodando ? 'Pausar (C)' : 'Iniciar (C)', function () { mudarCronometro(PI.cronometro.alternar); }),
      botao('+1 min (M)', function () { mudarCronometro(PI.cronometro.mais1); }, 'placar-ui__botao--leve'),
      botao('Zerar (Z)', function () { mudarCronometro(PI.cronometro.zerar); }, 'placar-ui__botao--leve'),
      botao(estado.som ? 'Som ligado (S)' : 'Som desligado (S)', function () {
        PI.loja.atualizar(function (e) { return Object.assign({}, e, { som: !e.som }); });
      }, 'placar-ui__botao--leve')
    ])]);
  }

  function roleta(estado) {
    var semRepetir = el('input');
    semRepetir.type = 'checkbox';
    semRepetir.checked = estado.roleta.semRepetir;
    semRepetir.addEventListener('change', function () {
      PI.loja.atualizar(function (e) { return Object.assign({}, e, { roleta: Object.assign({}, e.roleta, { semRepetir: semRepetir.checked }) }); });
    });
    var candidatos = PI.placar.candidatosSorteio(estado).length;
    var ultimo = estado.roleta.ultimo ? PI.roletaUi.nomeDe(estado, estado.roleta.ultimo.id) : 'ninguém ainda';
    var opcoes = [['', '(a escolher)']].concat(estado.jogadores.map(function (j) { return [j.id, j.nome]; }));
    var melhor = el('select', 'placar-ui__campo');
    melhor.setAttribute('aria-label', 'Melhor jogada');
    opcoes.forEach(function (o) { var op = txt('option', '', o[1]); op.value = o[0]; op.selected = (estado.melhorJogada || '') === o[0]; melhor.appendChild(op); });
    melhor.addEventListener('change', function () {
      PI.loja.atualizar(function (e) { return Object.assign({}, e, { melhorJogada: melhor.value || null }); }, { desfazivel: true });
    });
    return el('section', 'painel__caixa', [txt('h3', '', 'Roleta e melhor jogada'),
      txt('p', 'placar-ui__nota', candidatos + ' no sorteio. Último sorteado: ' + ultimo + '.'),
      el('div', 'placar-ui__linha', [botao('Girar a roleta (R)', PI.roletaUi.sortearAgora),
        el('label', 'placar-ui__marca', [semRepetir, ' não repetir vencedor']),
        botao('Limpar sorteados', function () {
          PI.loja.atualizar(function (e) { return Object.assign({}, e, { roleta: PI.roleta.limpar(e.roleta) }); }, { desfazivel: true });
        }, 'placar-ui__botao--leve')]),
      el('label', 'placar-ui__linha', ['Melhor jogada (slide 51): ', melhor])]);
  }

  function desenhar() {
    var estado = PI.loja.obter();
    var i = indiceAtual();
    var slide = slides[i];
    raizPainel.replaceChildren(
      el('div', 'painel__grade', [
        el('div', 'painel__esquerda', [
          miniatura(slide, ESCALA_ATUAL, 'Agora: slide ' + slide.n + ' de ' + slides.length),
          el('div', 'painel__linha-proximo', [
            miniatura(slides[i + 1], ESCALA_PROXIMO, 'Próximo'),
            el('div', 'painel__nav', [
              el('div', 'placar-ui__linha', [botao('Anterior', function () { ir(i - 1); }), botao('Próximo', function () { ir(i + 1); })]),
              irPara(),
              botao('Placar (L)', function () { PI.placarUi.abrir(slide.atividade); }, 'placar-ui__botao--leve')
            ])
          ])
        ]),
        el('div', 'painel__direita', [roteiro(slide), cronometro(estado), roleta(estado)])
      ])
    );
    PI.cronometroUi.tick();
    atualizarRelogio();
  }

  function atualizarRelogio() {
    var agora = new Date();
    var minuto = PI.cronograma.minutosDesde(config.aula.inicio, agora);
    var linha = PI.cronograma.linhaDoTempo(config.cronograma);
    var slide = slides[indiceAtual()];
    var secao = secoes.filter(function (s) { return s.id === slide.secaoId; })[0];
    var ritmo = PI.cronograma.ritmo(PI.cronograma.janelaDaSecao(secao, config.cronograma), minuto);
    var textoRitmo = ritmo.estado === 'no tempo' ? 'no tempo' : ritmo.estado + ' ' + ritmo.minutos + ' min';
    relogio.replaceChildren(
      txt('strong', 'painel__hora', PI.cronograma.hora(agora)),
      txt('span', '', 'Previsto agora: ' + PI.cronograma.etapaEm(linha, minuto)),
      txt('span', 'painel__ritmo painel__ritmo--' + ritmo.estado.replace(' ', '-'), 'Esta seção: ' + textoRitmo)
    );
    anunciarCronometro();
  }

  function anunciarCronometro() {
    var c = PI.loja.obter().cronometro;
    var restante = PI.cronometro.restante(c, Date.now());
    var minutos = Math.ceil(restante / 60000);
    if (!c.rodando || minutos === ultimoMinutoAnunciado) { return; }
    ultimoMinutoAnunciado = minutos;
    anuncio.textContent = restante === 0 ? 'Tempo esgotado.' : 'Faltam ' + minutos + ' minutos no cronômetro.';
  }

  function aoTeclar(e) {
    if (PI.placarUi.aberto()) {
      if (e.key === 'Escape') { PI.placarUi.fechar(); }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) { return; }
    var r = PI.navegacao.interpretarTecla(e.key, null);
    var acoes = {
      proximo: function () { ir(indiceAtual() + 1); },
      anterior: function () { ir(indiceAtual() - 1); },
      inicio: function () { ir(0); },
      fim: function () { ir(slides.length - 1); },
      cronometro: function () { mudarCronometro(PI.cronometro.alternar); },
      mais1: function () { mudarCronometro(PI.cronometro.mais1); },
      zerar: function () { mudarCronometro(PI.cronometro.zerar); },
      placar: function () { PI.placarUi.abrir(slides[indiceAtual()].atividade); },
      roleta: PI.roletaUi.sortearAgora
    };
    if (!acoes[r.acao]) { return; }
    e.preventDefault();
    acoes[r.acao]();
  }

  function iniciar() {
    raizPainel = document.getElementById('painel');
    relogio = document.getElementById('relogio');
    anuncio = document.getElementById('anuncio-cronometro');
    PI.loja.iniciar(config);
    PI.placarUi.iniciar(config);
    PI.roletaUi.iniciar();
    PI.loja.ouvir(function () { if (!PI.placarUi.aberto()) { desenhar(); } });
    PI.cronometroUi.iniciar({ semSom: true });
    document.addEventListener('keydown', aoTeclar);
    raiz.setInterval(atualizarRelogio, RELOGIO_MS);
    desenhar();
  }

  PI.painel = { ir: ir, desenhar: desenhar };
  document.addEventListener('DOMContentLoaded', iniciar);
})(window);
