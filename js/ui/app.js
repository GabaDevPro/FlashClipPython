/* Janela principal: palco escalado, slide atual, teclado, clique, cronômetro e placar. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var LARGURA = 1920, ALTURA = 1080;
  var ATALHOS = [
    ['Seta direita, Page Down, espaço', 'próximo slide'],
    ['Seta esquerda, Page Up', 'slide anterior'],
    ['Home e End', 'primeiro e último slide'],
    ['G, número, Enter', 'ir para um slide (ex.: G 1 8 B Enter)'],
    ['C ou clique no cronômetro', 'iniciar ou pausar o cronômetro'],
    ['M', 'mais 1 minuto'],
    ['Z', 'zerar o cronômetro'],
    ['S', 'ligar ou desligar o som do aviso'],
    ['L', 'abrir o placar'],
    ['F', 'tela cheia'],
    ['?', 'mostrar ou esconder esta ajuda'],
    ['Clique no slide', 'próximo slide']
  ];

  var slides = PI.conteudo.achatarSecoes(PI.secoes());
  var ctx = { config: PI.config };
  var modoIr = null;
  var palco, avisoIr, ajuda;

  function escalar() {
    var s = Math.min(raiz.innerWidth / LARGURA, raiz.innerHeight / ALTURA);
    var x = (raiz.innerWidth - LARGURA * s) / 2;
    var y = (raiz.innerHeight - ALTURA * s) / 2;
    palco.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + s + ')';
  }

  function indiceAtual() { return PI.navegacao.limitar(PI.loja.obter().slide, slides.length); }

  function desenhar() {
    var estado = PI.loja.obter();
    var slide = slides[indiceAtual()];
    var modelo = PI.modelos[slide.layout];
    if (!modelo) {
      console.error('Modelo inexistente para o slide', slide.n, slide.layout);
      palco.replaceChildren(PI.pecas.txt('p', 'slide', 'Slide ' + slide.n + ': modelo "' + slide.layout + '" não encontrado.'));
      return;
    }
    var no = modelo(slide, ctx);
    PI.preencher(no, estado, ctx.config);
    palco.replaceChildren(no);
    PI.cronometroUi.tick();
    document.title = 'Slide ' + slide.n + ' · ' + slide.titulo;
    raiz.history.replaceState(null, '', '#' + slide.n);
  }

  function ir(indice) {
    var novo = PI.navegacao.limitar(indice, slides.length);
    PI.loja.atualizar(function (e) {
      return PI.cronometroUi.aoEntrar(Object.assign({}, e, { slide: novo }), slides[novo], ctx.config);
    });
  }

  function mudarCronometro(transformar) {
    PI.loja.atualizar(function (e) { return Object.assign({}, e, { cronometro: transformar(e.cronometro, Date.now()) }); });
  }

  function mostrarAvisoIr(numero) {
    avisoIr.hidden = numero === null;
    avisoIr.textContent = 'Ir para o slide: ' + (numero || '') + '_';
  }

  function telaCheia() {
    var pedido = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    pedido.catch(function (erro) { console.error('Tela cheia recusada pelo navegador:', erro.message); });
  }

  function alternarSom() {
    PI.loja.atualizar(function (e) { return Object.assign({}, e, { som: !e.som }); });
    PI.loja.avisar(PI.loja.obter().som ? 'Som do aviso ligado.' : 'Som do aviso desligado.');
  }

  function irPorNumero(numero) {
    var i = PI.conteudo.indicePorNumero(slides, numero);
    if (i < 0) {
      avisoIr.hidden = false;
      avisoIr.textContent = 'Não existe o slide ' + numero;
      raiz.setTimeout(function () { avisoIr.hidden = true; }, 1500);
      return;
    }
    ir(i);
  }

  var ACOES = {
    proximo: function () { ir(PI.navegacao.proximo(indiceAtual(), slides.length)); },
    anterior: function () { ir(PI.navegacao.anterior(indiceAtual())); },
    inicio: function () { ir(0); },
    fim: function () { ir(slides.length - 1); },
    telaCheia: telaCheia,
    ajuda: function () { ajuda.hidden = !ajuda.hidden; },
    cronometro: function () { mudarCronometro(PI.cronometro.alternar); },
    mais1: function () { mudarCronometro(PI.cronometro.mais1); },
    zerar: function () { mudarCronometro(PI.cronometro.zerar); },
    som: alternarSom,
    placar: function () { PI.placarUi.abrir(slides[indiceAtual()].atividade); }
  };

  function executar(r) {
    modoIr = r.modoIr;
    mostrarAvisoIr(modoIr);
    if (r.acao === 'ir') { irPorNumero(r.numero); return; }
    if (ACOES[r.acao]) { ACOES[r.acao](); }
  }

  function aoTeclar(e) {
    if (PI.placarUi.aberto()) {
      if (e.key === 'Escape') { PI.placarUi.fechar(); }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) { return; }
    if (!ajuda.hidden && e.key === 'Escape') { ajuda.hidden = true; return; }
    var r = PI.navegacao.interpretarTecla(e.key, modoIr);
    if (r.acao === null && modoIr === null) { return; }
    e.preventDefault();
    executar(r);
  }

  function aoClicar(e) {
    if (e.target.closest('[data-cronometro]')) { ACOES.cronometro(); return; }
    ACOES.proximo();
  }

  function criarAjuda() {
    var lista = PI.pecas.el('dl', '');
    ATALHOS.forEach(function (a) { lista.appendChild(PI.pecas.txt('dt', '', a[0])); lista.appendChild(PI.pecas.txt('dd', '', a[1])); });
    var caixa = PI.pecas.el('div', 'ajuda', [PI.pecas.txt('h2', '', 'Atalhos'), lista]);
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-label', 'Atalhos de teclado');
    caixa.hidden = true;
    return caixa;
  }

  function iniciar() {
    palco = document.getElementById('palco');
    avisoIr = document.getElementById('aviso-ir');
    ajuda = criarAjuda();
    document.body.appendChild(ajuda);
    PI.loja.iniciar(ctx.config);
    PI.placarUi.iniciar(ctx.config);
    PI.loja.ouvir(desenhar);
    escalar();
    raiz.addEventListener('resize', escalar);
    document.addEventListener('keydown', aoTeclar);
    palco.addEventListener('click', aoClicar);
    var doEndereco = PI.conteudo.indicePorNumero(slides, decodeURIComponent(raiz.location.hash.slice(1)));
    PI.cronometroUi.iniciar();
    ir(doEndereco >= 0 ? doEndereco : PI.loja.obter().slide);
  }

  PI.app = { slides: function () { return slides.slice(); }, ir: ir, atual: indiceAtual };
  document.addEventListener('DOMContentLoaded', iniciar);
})(window);
