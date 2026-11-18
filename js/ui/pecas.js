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

  function chocolate() {
    var c = el('div', 'chocolate', [
      svg('<svg viewBox="0 0 360 170" aria-hidden="true"><rect x="10" y="20" width="250" height="130" rx="8" class="arte-chocolate"/>' +
        '<g class="arte-gomos"><rect x="24" y="34" width="68" height="46" rx="4"/><rect x="100" y="34" width="68" height="46" rx="4"/>' +
        '<rect x="176" y="34" width="68" height="46" rx="4"/><rect x="24" y="90" width="68" height="46" rx="4"/>' +
        '<rect x="100" y="90" width="68" height="46" rx="4"/><rect x="176" y="90" width="68" height="46" rx="4"/></g>' +
        '<path d="M200 12 L350 12 L350 158 L200 158 L214 140 L200 122 L214 104 L200 86 L214 68 L200 50 L214 32 Z" class="arte-embalagem"/></svg>', 'chocolate__svg'),
      txt('span', 'chocolate__rotulo', 'CHOCOLATE')
    ]);
    c.setAttribute('aria-hidden', 'true');
    return c;
  }

  function peao(cor) {
    var s = svg('<svg viewBox="0 0 120 170" aria-hidden="true"><circle cx="60" cy="38" r="30"/><path d="M40 70 Q60 62 80 70 L92 138 L28 138 Z"/><rect x="14" y="134" width="92" height="28" rx="6"/></svg>', 'peao');
    s.style.fill = cor;
    return s;
  }

  // data-campo diz ao modo edição (js/ui/edicao-ui.js) qual campo do slide o elemento mostra.
  function campo(no, caminho) {
    if (no && caminho) { no.setAttribute('data-campo', caminho); }
    return no;
  }

  // opcoes.campos: { rotulo, titulo, texto } com o caminho de cada parte no slide (modo edição).
  function carta(opcoes) {
    var campos = opcoes.campos || {};
    var c = el('div', 'carta');
    var faixa = el('div', 'carta__faixa carta__faixa--' + (opcoes.cor || 'celeste'));
    if (opcoes.rotulo) { faixa.appendChild(campo(txt('span', 'carta__rotulo', opcoes.rotulo), campos.rotulo)); }
    if (opcoes.titulo) { faixa.appendChild(campo(txt('span', 'carta__titulo', opcoes.titulo), campos.titulo)); }
    c.appendChild(faixa);
    var corpo = el('div', 'carta__corpo');
    if (opcoes.texto) { corpo.appendChild(campo(txt('p', 'carta__texto', opcoes.texto), campos.texto)); }
    if (opcoes.arte) { corpo.appendChild(opcoes.arte); }
    c.appendChild(corpo);
    return c;
  }

  function cronometro(tempo, estado, alvo) {
    var c = el('div', 'cronometro cronometro--' + (estado || 'normal') + (tempo.length > 4 ? ' cronometro--longo' : ''),
      [txt('span', 'cronometro__rotulo', 'TEMPO'), txt('span', 'cronometro__tempo', tempo)]);
    c.setAttribute('data-cronometro', '');
    c.setAttribute('data-alvo', alvo || '');
    c.setAttribute('role', 'timer');
    return c;
  }

  var LINHAS_LADO_A_LADO = 8;
  // Saída larga (ex.: mensagem de erro do Python) não cabe na coluna da direita: vai embaixo do código.
  var COLUNAS_SAIDA_LADO = 24;
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
    var ladoALado = mostrarSaida && cod.linhas + sai.linhas > LINHAS_LADO_A_LADO && sai.colunas <= COLUNAS_SAIDA_LADO;
    var linhas = ladoALado ? Math.max(cod.linhas, sai.linhas) : cod.linhas + sai.linhas;
    var colunas = ladoALado ? cod.colunas : Math.max(cod.colunas, sai.colunas);
    var b = el('figure', 'codigo ' + tamanhoCodigo(linhas, colunas) + (ladoALado ? ' codigo--lado' : ''));
    var pre = el('pre', 'codigo__texto');
    var code = el('code');
    if (bloco.linguagem === 'python') {
      code.innerHTML = raiz.PI.realce.paraHtml(bloco.texto);
    } else {
      code.textContent = bloco.texto;
    }
    pre.appendChild(code);
    // opcoes.indice: posição do bloco em slide.codigo, para o modo edição.
    var prefixo = opcoes && typeof opcoes.indice === 'number' ? 'codigo.' + opcoes.indice + '.' : null;
    campo(pre, prefixo && prefixo + 'texto');
    b.appendChild(el('div', 'codigo__editor', [campo(txt('figcaption', 'codigo__rotulo', bloco.rotulo || ''), prefixo && prefixo + 'rotulo'), pre]));
    if (mostrarSaida) {
      b.appendChild(el('div', 'codigo__saida', [txt('span', 'codigo__rotulo', 'Saída'), campo(txt('pre', 'codigo__texto', bloco.saida), prefixo && prefixo + 'saida')]));
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

  var QR_MARGEM = 2;

  // QR code gerado aqui mesmo (vendor/qrcode-generator), sem rede. O desenho sai só de isDark(),
  // então o link nunca vira marcação. Sem link no config, mostra o aviso no lugar do código.
  function qr(link) {
    if (!link) { return txt('figure', 'qr qr--pendente', 'O QR code aparece quando o link estiver em conteudo/config.js'); }
    if (typeof raiz.qrcode !== 'function') {
      console.error('vendor/qrcode-generator/qrcode.js não carregou: QR code indisponível.');
      return txt('figure', 'qr qr--pendente', 'QR code indisponível');
    }
    var codigo = raiz.qrcode(0, 'M');
    try {
      codigo.addData(link);
      codigo.make();
    } catch (erro) {
      console.error('Não deu para gerar o QR code (link grande demais?):', erro && erro.message ? erro.message : erro);
      return txt('figure', 'qr qr--pendente', 'QR code indisponível');
    }
    var n = codigo.getModuleCount();
    var lado = n + QR_MARGEM * 2;
    var d = [];
    for (var lin = 0; lin < n; lin++) {
      for (var col = 0; col < n; col++) {
        if (codigo.isDark(lin, col)) { d.push('M' + (col + QR_MARGEM) + ' ' + (lin + QR_MARGEM) + 'h1v1h-1z'); }
      }
    }
    var desenho = document.createElementNS(SVG_NS, 'svg');
    desenho.setAttribute('viewBox', '0 0 ' + lado + ' ' + lado);
    desenho.setAttribute('shape-rendering', 'crispEdges');
    desenho.setAttribute('role', 'img');
    desenho.setAttribute('aria-label', 'QR code para ' + link);
    var caminho = document.createElementNS(SVG_NS, 'path');
    caminho.setAttribute('d', d.join(''));
    desenho.appendChild(caminho);
    return el('figure', 'qr', [desenho]);
  }

  raiz.PI = raiz.PI || {};
  raiz.PI.pecas = {
    CASAS: CASAS, el: el, txt: txt, svg: svg, casa: casa, dado: dado, nota: nota, chocolate: chocolate, peao: peao, carta: carta,
    cronometro: cronometro, blocoCodigo: blocoCodigo, cabecalho: cabecalho, faixaCasas: faixaCasas,
    bordaTabuleiro: bordaTabuleiro, posicionar: posicionar, qr: qr, campo: campo
  };
})(window);
