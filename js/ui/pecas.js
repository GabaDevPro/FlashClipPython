/* Peças visuais da Direção A: DOM puro, texto sempre por textContent. */
(function (raiz) {
  'use strict';

  var CASAS = ['marrom', 'celeste', 'rosa', 'laranja', 'vermelho', 'amarelo', 'verde', 'azul'];
  var PONTOS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  var SVG_NS = 'http://www.w3.org/2000/svg';

  function el(tag, classe, filhos) {
    var e = document.createElement(tag);
    if (classe) { e.className = classe; }
    (filhos || []).forEach(function (f) {
      if (f === null || f === undefined) { return; }
      e.appendChild(typeof f === 'string' ? document.createTextNode(f) : f);
    });
    return e;
  }

  function txt(tag, classe, conteudo) {
    var e = el(tag, classe);
    e.textContent = conteudo === null || conteudo === undefined ? '' : String(conteudo);
    return e;
  }

  function svg(marcacao, classe) {
    // Só para arte fixa deste arquivo, nunca para texto vindo de fora.
    var caixa = document.createElement('div');
    caixa.innerHTML = marcacao;
    var s = caixa.firstElementChild;
    if (classe) { s.setAttribute('class', classe); }
    return s;
  }

  function casa(cor, lado) {
    return el('div', 'casa casa--' + lado, [el('div', 'casa__faixa casa__faixa--' + cor)]);
  }

  function dado(face, destaque) {
    var d = el('div', 'dado' + (destaque ? ' dado--destaque' : ''));
    d.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 9; i++) {
      d.appendChild(el('span', PONTOS[face].indexOf(i) >= 0 ? 'dado__ponto' : 'dado__vazio'));
    }
    return d;
  }

  function nota(valor) {
    var n = el('div', 'nota', [txt('span', 'nota__canto', valor), el('span', 'nota__roseta'), txt('span', 'nota__valor', valor)]);
    n.setAttribute('aria-hidden', 'true');
    return n;
  }

  function peao(cor) {
    var s = svg('<svg viewBox="0 0 120 170" aria-hidden="true"><circle cx="60" cy="38" r="30"/><path d="M40 70 Q60 62 80 70 L92 138 L28 138 Z"/><rect x="14" y="134" width="92" height="28" rx="6"/></svg>', 'peao');
    s.style.fill = cor;
    return s;
  }

  function carta(opcoes) {
    var c = el('div', 'carta');
    var faixa = el('div', 'carta__faixa carta__faixa--' + (opcoes.cor || 'celeste'));
    if (opcoes.rotulo) { faixa.appendChild(txt('span', 'carta__rotulo', opcoes.rotulo)); }
    if (opcoes.titulo) { faixa.appendChild(txt('span', 'carta__titulo', opcoes.titulo)); }
    c.appendChild(faixa);
    var corpo = el('div', 'carta__corpo');
    if (opcoes.texto) { corpo.appendChild(txt('p', 'carta__texto', opcoes.texto)); }
    c.appendChild(corpo);
    return c;
  }

  function cronometro(tempo, estado) {
    var c = el('div', 'cronometro cronometro--' + (estado || 'normal') + (tempo.length > 4 ? ' cronometro--longo' : ''),
      [txt('span', 'cronometro__rotulo', 'TEMPO'), txt('span', 'cronometro__tempo', tempo)]);
    c.setAttribute('data-cronometro', '');
    return c;
  }

  var LINHAS_LADO_A_LADO = 8;
  var COLUNAS_G = 40, COLUNAS_M = 44;

  function tamanhoCodigo(linhas, colunas) {
    if (linhas <= 8 && colunas <= COLUNAS_G) { return 'codigo--g'; }
    if (linhas <= 11 && colunas <= COLUNAS_M) { return 'codigo--m'; }
    return 'codigo--p';
  }

  function medidas(texto) {
    var linhas = texto.split('\n');
    return { linhas: linhas.length, colunas: Math.max.apply(null, linhas.map(function (l) { return l.length; })) };
  }

  function blocoCodigo(bloco, opcoes) {
    var mostrarSaida = bloco.saida !== undefined && bloco.saida !== null && !(opcoes && opcoes.semSaida);
    var cod = medidas(bloco.texto);
    var sai = mostrarSaida ? medidas(bloco.saida) : { linhas: 0, colunas: 0 };
    var ladoALado = mostrarSaida && cod.linhas + sai.linhas > LINHAS_LADO_A_LADO;
    var linhas = ladoALado ? Math.max(cod.linhas, sai.linhas) : cod.linhas + sai.linhas;
    var b = el('figure', 'codigo ' + tamanhoCodigo(linhas, cod.colunas) + (ladoALado ? ' codigo--lado' : ''));
    var pre = el('pre', 'codigo__texto');
    var code = el('code');
    if (bloco.linguagem === 'python') {
      code.innerHTML = raiz.PI.realce.paraHtml(bloco.texto);
    } else {
      code.textContent = bloco.texto;
    }
    pre.appendChild(code);
    b.appendChild(el('div', 'codigo__editor', [txt('figcaption', 'codigo__rotulo', bloco.rotulo || ''), pre]));
    if (mostrarSaida) {
      b.appendChild(el('div', 'codigo__saida', [txt('span', 'codigo__rotulo', 'Saída'), txt('pre', 'codigo__texto', bloco.saida)]));
    }
    return b;
  }

  function cabecalho(slide, cor) {
    return el('header', 'cabecalho', [el('span', 'cabecalho__cor cabecalho__cor--' + cor), txt('span', 'cabecalho__secao', slide.secaoTitulo), txt('span', 'cabecalho__numero', slide.n)]);
  }

  function faixaCasas() {
    var f = el('div', 'faixa-casas');
    f.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 16; i++) { f.appendChild(el('span', 'casa__faixa--' + CASAS[i % 8])); }
    return f;
  }

  function bordaTabuleiro() {
    var b = el('div', 'borda-tabuleiro');
    b.setAttribute('aria-hidden', 'true');
    var k = 0;
    function cor() { return CASAS[Math.floor(k++ / 2) % 8]; }
    for (var c = 1; c <= 14; c++) { b.appendChild(posicionar(casa(cor(), 'topo'), c * 120, 0)); }
    for (var r = 1; r <= 7; r++) { b.appendChild(posicionar(casa(cor(), 'direita'), 1800, r * 120)); }
    for (c = 14; c >= 1; c--) { b.appendChild(posicionar(casa(cor(), 'base'), c * 120, 960)); }
    for (r = 7; r >= 1; r--) { b.appendChild(posicionar(casa(cor(), 'esquerda'), 0, r * 120)); }
    [[0, 0], [1800, 0], [0, 960], [1800, 960]].forEach(function (p) { b.appendChild(posicionar(el('div', 'casa casa--canto'), p[0], p[1])); });
    return b;
  }

  function posicionar(no, x, y) {
    no.style.left = x + 'px';
    no.style.top = y + 'px';
    return no;
  }

  raiz.PI = raiz.PI || {};
  raiz.PI.pecas = {
    CASAS: CASAS, el: el, txt: txt, svg: svg, casa: casa, dado: dado, nota: nota, peao: peao, carta: carta,
    cronometro: cronometro, blocoCodigo: blocoCodigo, cabecalho: cabecalho, faixaCasas: faixaCasas,
    bordaTabuleiro: bordaTabuleiro, posicionar: posicionar
  };
})(window);
