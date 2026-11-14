/* Janela principal: palco escalado, slide atual, teclado e clique. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var LARGURA = 1920, ALTURA = 1080;
  var ATALHOS = [
    ['Seta direita, Page Down, espaço', 'próximo slide'],
    ['Seta esquerda, Page Up', 'slide anterior'],
    ['Home e End', 'primeiro e último slide'],
    ['G, número, Enter', 'ir para um slide (ex.: G 1 8 B Enter)'],
    ['F', 'tela cheia'],
    ['?', 'mostrar ou esconder esta ajuda'],
    ['Clique', 'próximo slide']
  ];

  var slides = PI.conteudo.achatarSecoes(PI.secoes());
  var ctx = { config: PI.config };
  var estado = { indice: 0, modoIr: null };
  var palco, avisoIr, ajuda;

  function escalar() {
    var s = Math.min(raiz.innerWidth / LARGURA, raiz.innerHeight / ALTURA);
    var x = (raiz.innerWidth - LARGURA * s) / 2;
    var y = (raiz.innerHeight - ALTURA * s) / 2;
    palco.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + s + ')';
  }

  function desenhar() {
    var slide = slides[estado.indice];
    var modelo = PI.modelos[slide.layout];
    if (!modelo) {
      console.error('Modelo inexistente para o slide', slide.n, slide.layout);
      palco.replaceChildren(PI.pecas.txt('p', 'slide', 'Slide ' + slide.n + ': modelo "' + slide.layout + '" não encontrado.'));
      return;
    }
    palco.replaceChildren(modelo(slide, ctx));
    document.title = 'Slide ' + slide.n + ' · ' + slide.titulo;
    raiz.history.replaceState(null, '', '#' + slide.n);
  }

  function ir(indice) {
    var novo = PI.navegacao.limitar(indice, slides.length);
    if (novo === estado.indice && palco.firstChild) { return; }
    estado = Object.assign({}, estado, { indice: novo });
    desenhar();
  }

  function mostrarAvisoIr(numero) {
    avisoIr.hidden = numero === null;
    avisoIr.textContent = 'Ir para o slide: ' + (numero || '') + '_';
  }

  function telaCheia() {
    var pedido = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    pedido.catch(function (erro) { console.error('Tela cheia recusada pelo navegador:', erro.message); });
  }

  function executar(r) {
    estado = Object.assign({}, estado, { modoIr: r.modoIr });
    mostrarAvisoIr(r.modoIr);
    switch (r.acao) {
      case 'proximo': ir(PI.navegacao.proximo(estado.indice, slides.length)); break;
      case 'anterior': ir(PI.navegacao.anterior(estado.indice)); break;
      case 'inicio': ir(0); break;
      case 'fim': ir(slides.length - 1); break;
      case 'telaCheia': telaCheia(); break;
      case 'ajuda': ajuda.hidden = !ajuda.hidden; break;
      case 'ir': irPorNumero(r.numero); break;
      default: break;
    }
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

  function aoTeclar(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) { return; }
    if (!ajuda.hidden && e.key === 'Escape') { ajuda.hidden = true; return; }
    var r = PI.navegacao.interpretarTecla(e.key, estado.modoIr);
    if (r.acao === null && estado.modoIr === null) { return; }
    e.preventDefault();
    executar(r);
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
    escalar();
    raiz.addEventListener('resize', escalar);
    document.addEventListener('keydown', aoTeclar);
    palco.addEventListener('click', function () { executar({ acao: 'proximo', modoIr: null }); });
    var inicial = PI.conteudo.indicePorNumero(slides, decodeURIComponent(raiz.location.hash.slice(1)));
    estado = Object.assign({}, estado, { indice: inicial < 0 ? 0 : inicial });
    desenhar();
  }

  PI.app = { slides: function () { return slides.slice(); }, ir: ir, atual: function () { return estado.indice; } };
  document.addEventListener('DOMContentLoaded', iniciar);
})(window);
