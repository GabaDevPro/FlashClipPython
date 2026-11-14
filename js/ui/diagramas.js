/* Diagramas de decisão (slides 29 e 33), montados a partir do código do slide. */
(function (raiz) {
  'use strict';

  var P = raiz.PI.pecas;

  // Formas fixas: losango(s), caixas e setas. O texto entra por cima em HTML.
  var FORMAS = {
    'if-else': '<svg viewBox="0 0 720 520" aria-hidden="true"><polygon points="100,110 360,10 620,110 360,210" class="arte-losango"/><path d="M360 210 L360 260 L150 260 L150 336 M360 260 L570 260 L570 336" class="arte-traco"/><path d="M134 318 L150 340 L166 318 M554 318 L570 340 L586 318" class="arte-traco"/><rect x="20" y="345" width="260" height="170" class="arte-caixa"/><rect x="440" y="345" width="260" height="170" class="arte-caixa"/></svg>',
    'elif': '<svg viewBox="0 0 760 540" aria-hidden="true"><polygon points="210,80 380,10 550,80 380,150" class="arte-losango"/><polygon points="210,320 380,250 550,320 380,390" class="arte-losango"/><path d="M210 80 L110 80 L110 168 M380 150 L380 246 M210 320 L110 320 L110 412 M550 320 L650 320 L650 412" class="arte-traco"/><path d="M94 152 L110 172 L126 152 M364 230 L380 250 L396 230 M94 396 L110 416 L126 396 M634 396 L650 416 L666 396" class="arte-traco"/><rect x="0" y="175" width="220" height="110" class="arte-caixa"/><rect x="0" y="420" width="220" height="110" class="arte-caixa"/><rect x="540" y="420" width="220" height="110" class="arte-caixa"/></svg>'
  };

  // Posições (px no diagrama) de cada texto: [x, y, largura, classe].
  var TEXTOS = {
    'if-else': { cond: [[120, 80, 480]], saidas: [[30, 395, 240], [450, 395, 240]], rotulos: [['VERDADE', 165, 222, 'verdade'], ['FALSO', 470, 222, 'falso']] },
    'elif': { cond: [[230, 58, 300], [230, 298, 300]], saidas: [[10, 200, 200], [10, 445, 200], [550, 445, 200]], rotulos: [['SIM', 120, 96, 'verdade'], ['NÃO', 392, 186, 'falso'], ['SIM', 120, 336, 'verdade'], ['NÃO', 560, 336, 'falso']] }
  };

  function condicoes(codigo) {
    var achadas = [];
    var re = /^\s*(?:if|elif)\s+(.+):\s*$/gm;
    var m;
    while ((m = re.exec(codigo))) { achadas.push(m[1].trim()); }
    return achadas;
  }

  function impressos(codigo) {
    var achados = [];
    var re = /print\("([^"]*)"\)/g;
    var m;
    while ((m = re.exec(codigo))) { achados.push(m[1]); }
    return achados;
  }

  function posicionado(no, x, y, largura) {
    no.style.left = x + 'px';
    no.style.top = y + 'px';
    if (largura) { no.style.width = largura + 'px'; }
    return no;
  }

  function criar(slide) {
    var tipo = slide.diagrama === 'elif' ? 'elif' : 'if-else';
    var codigo = (slide.codigo && slide.codigo[0] && slide.codigo[0].texto) || '';
    var conds = condicoes(codigo);
    var saidas = slide.itens ? slide.itens.map(function (i) { return i.texto || i.titulo; }) : impressos(codigo);
    var d = P.el('div', 'diagrama diagrama--' + tipo);
    d.setAttribute('role', 'img');
    d.setAttribute('aria-label', 'Diagrama: ' + conds.join(', ') + ' leva a ' + saidas.join(', '));
    d.appendChild(P.svg(FORMAS[tipo], 'diagrama__formas'));
    var pos = TEXTOS[tipo];
    pos.cond.forEach(function (p, i) { d.appendChild(posicionado(P.txt('span', 'diagrama__condicao', conds[i] || ''), p[0], p[1], p[2])); });
    pos.saidas.forEach(function (p, i) { d.appendChild(posicionado(P.txt('span', 'diagrama__saida', saidas[i] || ''), p[0], p[1], p[2])); });
    pos.rotulos.forEach(function (r) { d.appendChild(posicionado(P.txt('span', 'diagrama__rotulo diagrama__rotulo--' + r[3], r[0]), r[1], r[2])); });
    return d;
  }

  raiz.PI = raiz.PI || {};
  raiz.PI.diagramas = { criar: criar, condicoes: condicoes, impressos: impressos };
})(window);
