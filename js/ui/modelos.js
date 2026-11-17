/* Os modelos (layouts) do contrato. Cada um devolve o <section> do slide no palco de 1920x1080. */
(function (raiz) {
  'use strict';

  var P = raiz.PI.pecas;
  var el = P.el, txt = P.txt;
  var COR_SECAO = {
    '01-abertura': 'vermelho', '02-print': 'celeste', '03-variaveis': 'celeste', '04-input': 'laranja',
    '05-condicionais': 'verde', '06-recap': 'amarelo', '07-intervalo': 'amarelo', '08-lacos': 'rosa',
    '09-boss': 'marrom', '10-premiacao': 'azul'
  };
  var FANTASMA = '<svg viewBox="0 0 120 140" aria-hidden="true"><path d="M10 62 C10 30 34 8 60 8 C86 8 110 30 110 62 L110 130 L96 118 L82 130 L68 118 L54 130 L40 118 L26 130 L10 118 Z" class="arte-fantasma"/><ellipse cx="44" cy="58" rx="8" ry="11" class="arte-olho"/><ellipse cx="76" cy="58" rx="8" ry="11" class="arte-olho"/><ellipse cx="60" cy="88" rx="7" ry="9" class="arte-olho"/></svg>';
  var ENVELOPE = '<svg viewBox="0 0 460 340" aria-hidden="true"><g transform="rotate(-7 210 90)"><rect x="70" y="20" width="290" height="140" class="arte-nota"/><rect x="84" y="34" width="262" height="112" class="arte-linha"/></g><g transform="rotate(5 250 80)"><rect x="110" y="10" width="290" height="140" class="arte-nota"/><rect x="124" y="24" width="262" height="112" class="arte-linha"/></g><rect x="20" y="96" width="420" height="234" class="arte-envelope"/><path d="M20 96 L230 226 L440 96" class="arte-traco"/><rect x="140" y="244" width="180" height="62" class="arte-etiqueta"/></svg>';

  // Ícones das cartas do slide 7 (item.imagem). Traço e cores do tabuleiro, classes em css/pecas.css.
  var ICONES = {
    ia: '<svg viewBox="0 0 200 200" aria-hidden="true"><line x1="100" y1="60" x2="100" y2="34" class="ic"/><circle cx="100" cy="28" r="10" class="ic ic-amarelo"/><rect x="24" y="92" width="18" height="38" rx="5" class="ic ic-laranja"/><rect x="158" y="92" width="18" height="38" rx="5" class="ic ic-laranja"/><rect x="40" y="60" width="120" height="104" rx="20" class="ic ic-celeste"/><circle cx="74" cy="102" r="14" class="ic ic-amarelo"/><circle cx="126" cy="102" r="14" class="ic ic-amarelo"/><rect x="70" y="134" width="60" height="14" rx="5" class="ic ic-papel"/></svg>',
    dados: '<svg viewBox="0 0 200 200" aria-hidden="true"><rect x="48" y="112" width="30" height="60" class="ic ic-celeste"/><rect x="90" y="80" width="30" height="92" class="ic ic-amarelo"/><rect x="132" y="48" width="30" height="124" class="ic ic-verde"/><polyline points="40,98 96,58 150,26" class="ic"/><path d="M26 22 V172 H184" class="ic"/></svg>',
    sites: '<svg viewBox="0 0 200 200" aria-hidden="true"><rect x="18" y="34" width="164" height="134" rx="10" class="ic ic-papel"/><path d="M18 66 V44 Q18 34 28 34 H172 Q182 34 182 44 V66 Z" class="ic ic-celeste"/><circle cx="38" cy="50" r="6" class="ic ic-vermelho"/><circle cx="56" cy="50" r="6" class="ic ic-amarelo"/><circle cx="74" cy="50" r="6" class="ic ic-verde"/><rect x="36" y="84" width="62" height="66" class="ic ic-laranja"/><path d="M114 90 H164 M114 112 H164 M114 134 H148" class="ic"/></svg>',
    automacao: '<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="62" class="ic-dentes"/><circle cx="100" cy="100" r="50" class="ic ic-amarelo"/><circle cx="100" cy="100" r="18" class="ic ic-papel"/></svg>'
  };

  function corDe(slide) { return COR_SECAO[slide.secaoId] || 'celeste'; }

  function base(slide, layout, opcoes) {
    var s = el('section', 'slide slide--' + layout);
    s.setAttribute('aria-label', 'Slide ' + slide.n + ': ' + slide.titulo);
    if (!opcoes || opcoes.cabecalho !== false) { s.appendChild(P.cabecalho(slide, corDe(slide))); }
    if (!opcoes || opcoes.faixa !== false) { s.appendChild(P.faixaCasas()); }
    return s;
  }

  function titulo(slide, classe) { return txt('h1', 'slide__titulo ' + (classe || ''), slide.titulo); }

  function textos(slide, classe) {
    if (!slide.texto || !slide.texto.length) { return null; }
    return el('div', 'slide__texto ' + (classe || ''), slide.texto.map(function (t) { return txt('p', '', t); }));
  }

  function codigos(slide, opcoes) {
    var no = el('div', 'slide__codigos', (slide.codigo || []).map(function (b) { return P.blocoCodigo(b, opcoes); }));
    // Na tela principal a saída espera um avanço para aparecer (app.js); painel e PDF mostram direto.
    if (slide.revelarSaida) { no.querySelectorAll('.codigo__saida').forEach(function (x) { x.setAttribute('data-revelar', ''); }); }
    return no;
  }

  function numerada(itens, corBase) {
    return el('ol', 'lista-numerada', itens.map(function (item, i) {
      return el('li', '', [txt('span', 'lista-numerada__casa casa__faixa--' + P.CASAS[(corBase + i * 3) % 8], item.rotulo || String(i + 1)),
        el('div', 'lista-numerada__textos', [item.titulo ? txt('strong', '', item.titulo) : null, item.texto ? txt('span', '', item.texto) : null])]);
    }));
  }

  function textoPremio(ctx, slide) {
    var a = ctx.config.atividades[slide.atividade];
    return a && a.premio ? a.premio : 'prêmio';
  }

  function minutosDe(ctx, slide) {
    var a = ctx.config.atividades[slide.atividade];
    var m = a ? a.minutos : ctx.config.tempos[slide.cronometro];
    return (m || 0) + ':00';
  }

  // ---------- modelos ----------
  var M = {};

  M.capa = function (slide) {
    var s = base(slide, 'capa', { cabecalho: false, faixa: false });
    s.appendChild(P.bordaTabuleiro());
    s.appendChild(el('div', 'capa__miolo', [txt('p', 'rotulo rotulo--destaque', 'LIGA FLASH CLIP'), titulo(slide, 'titulo-capa'), textos(slide)]));
    s.appendChild(el('div', 'capa__arte', [P.dado(3), P.dado(4, true), P.nota('1500')]));
    return s;
  };

  M.ministrantes = function (slide, ctx) {
    var s = base(slide, 'ministrantes');
    s.appendChild(titulo(slide));
    s.appendChild(el('ul', 'ministrantes', ctx.config.ministrantes.map(function (m) {
      // Com foto, o peão fica em pé em cima do card; sem foto, continua dentro dele.
      var foto = m.foto ? el('img', 'ministrante__foto') : P.peao(m.cor);
      if (m.foto) { foto.src = m.foto; foto.alt = ''; }
      var c = el('div', 'ministrante__casa', [foto]);
      c.style.setProperty('--cor-peao', m.cor);
      var peao = m.foto ? P.peao(m.cor) : null;
      if (peao) { peao.classList.add('ministrante__peao'); }
      // assets/fotos/ fica fora do git: sem o arquivo, volta o peão dentro do card.
      if (m.foto) { foto.onerror = function () { c.replaceChildren(P.peao(m.cor)); peao.style.visibility = 'hidden'; }; }
      return el('li', 'ministrante', [peao, c, txt('strong', 'ministrante__nome', m.nome), m.secao ? txt('span', 'ministrante__secao', m.secao) : null]);
    })));
    return s;
  };

  M.regras = function (slide) {
    var s = base(slide, 'regras');
    s.appendChild(titulo(slide));
    var cores = ['azul', 'verde', 'amarelo'];
    s.appendChild(el('div', 'linha-cartas', slide.itens.map(function (item, i) {
      return P.carta({ cor: cores[i % 3], rotulo: 'REGRA ' + (i + 1), texto: item.texto });
    })));
    return s;
  };

  M.instrucoes = function (slide, ctx) {
    var s = base(slide, 'instrucoes');
    s.appendChild(titulo(slide));
    if (slide.link) {
      var link = ctx.config.links[slide.link] || '';
      var caixa = el('div', 'link' + (link ? '' : ' link--pendente'), [txt('span', 'rotulo', 'ACESSE'), txt('strong', 'link__texto', link || 'link pendente')]);
      s.appendChild(el('div', 'instrucoes__link', [textos(slide, 'slide__texto--grande'), caixa]));
      if (slide.itens) { s.appendChild(numerada(slide.itens, 1)); }
      return s;
    }
    if (slide.texto) { s.appendChild(textos(slide)); }
    if (slide.itens) { s.appendChild(numerada(slide.itens, 1)); }
    s.appendChild(el('div', 'instrucoes__arte', [P.peao('var(--cor-casa-laranja)'), P.dado(5)]));
    return s;
  };

  M.algoritmo = function (slide) {
    var s = base(slide, 'algoritmo');
    s.appendChild(textos(slide, 'sobretitulo'));
    s.appendChild(titulo(slide));
    var cores = ['celeste', 'laranja', 'verde', 'azul'];
    s.appendChild(el('div', 'linha-cartas linha-cartas--caminho', slide.itens.map(function (item, i) {
      return P.carta({ cor: cores[i % 4], rotulo: 'PASSO ' + (item.rotulo || i + 1), texto: item.texto });
    })));
    return s;
  };

  M.atualizacao = function (slide) {
    var s = base(slide, 'atualizacao');
    s.appendChild(titulo(slide, 'titulo-atividade'));
    s.appendChild(el('blockquote', 'mensagem', [txt('span', 'rotulo rotulo--destaque', 'MENSAGEM DO DONO DO JOGO'), txt('p', 'mensagem__texto', '“' + (slide.texto || [''])[0] + '”')]));
    s.appendChild(P.nota('R$ 300'));
    return s;
  };

  // Camada decorativa por cima do slide: não mexe na grade do código.
  function fantasmas() {
    var camada = el('div', 'fantasmas', [1, 2, 3].map(function (i) { return el('div', 'fantasma fantasma--' + i, [P.svg(FANTASMA, '')]); }));
    camada.setAttribute('aria-hidden', 'true');
    return camada;
  }

  M.conceito = function (slide) {
    var s = base(slide, 'conceito');
    s.appendChild(titulo(slide));
    if (slide.ilustracao === 'fantasmas') { s.appendChild(fantasmas()); }
    var arte = null;
    if (slide.ilustracao === 'envelope') {
      arte = el('div', 'ilustracao', [P.svg(ENVELOPE, 'ilustracao__svg'), txt('span', 'ilustracao__etiqueta', 'saldo')]);
    } else if (slide.diagrama) {
      arte = raiz.PI.diagramas.criar(slide);
    } else if (slide.itens) {
      arte = el('dl', 'tabela-itens', slide.itens.map(function (it) { return el('div', '', [txt('dt', '', it.rotulo), txt('dd', '', it.texto)]); }));
    }
    if (slide.imagem) {
      var img = el('img', 'foto__img');
      img.src = slide.imagem;
      img.alt = slide.credito || '';
      var foto = el('figure', 'foto', [img, slide.credito ? txt('figcaption', 'foto__credito', slide.credito) : null]);
      s.appendChild(el('div', 'conceito__grade conceito__grade--foto', [textos(slide), foto]));
      return s;
    }
    var temCodigo = slide.codigo && slide.codigo.length;
    var col = el('div', 'conceito__col', [arte ? textos(slide) : null, arte]);
    if (!temCodigo) { s.appendChild(textos(slide, 'slide__texto--grande')); return s; }
    s.appendChild(el('div', 'conceito__grade' + (arte || slide.texto ? '' : ' conceito__grade--so-codigo'), [arte ? col : textos(slide), codigos(slide)]));
    return s;
  };

  M.cartas = function (slide) {
    var s = base(slide, 'cartas');
    s.appendChild(titulo(slide));
    var cores = ['rosa', 'azul', 'laranja', 'verde'];
    var cartas = el('div', 'grade-cartas' + (slide.codigo ? ' grade-cartas--2x2' : ''), slide.itens.map(function (item, i) {
      if (item.imagem) { return P.carta({ cor: cores[i % 4], titulo: item.titulo, arte: P.svg(ICONES[item.imagem], 'carta__arte') }); }
      if (!item.texto) { return P.carta({ cor: cores[i % 4], texto: item.titulo }); }
      return P.carta({ cor: cores[i % 4], rotulo: item.rotulo ? item.rotulo.toUpperCase() : null, titulo: item.titulo, texto: item.texto });
    }));
    s.appendChild(slide.codigo ? el('div', 'cartas__grade', [cartas, codigos(slide)]) : cartas);
    return s;
  };

  M.erro = function (slide) {
    var s = base(slide, 'erro');
    s.appendChild(titulo(slide, 'titulo-atividade'));
    s.appendChild(el('div', 'erro__codigo', [codigos(slide)]));
    return s;
  };

  M.enunciado = function (slide, ctx) {
    var denso = !slide.apoio && slide.itens && slide.codigo;
    var s = base(slide, 'enunciado' + (slide.apoio ? ' slide--apoio' : '') + (denso ? ' slide--denso' : ''));
    s.appendChild(titulo(slide, 'titulo-atividade'));
    var esquerda = el('div', 'enunciado__texto', [textos(slide), slide.itens ? numerada(slide.itens, 4) : null, denso ? null : codigos(slide)]);
    if (slide.apoio) {
      s.appendChild(P.cronometro(minutosDe(ctx, slide), 'canto', slide.atividade));
      s.appendChild(esquerda);
      return s;
    }
    var extra = denso ? codigos(slide) : el('div', 'enunciado__premio', [P.dado(3), P.dado(4), el('div', '', [P.chocolate(), txt('span', 'rotulo', textoPremio(ctx, slide) + ' para o 1º lugar')])]);
    s.appendChild(el('div', 'enunciado__grade', [esquerda, el('div', 'enunciado__lado', [P.cronometro(minutosDe(ctx, slide), 'normal', slide.atividade), extra])]));
    return s;
  };

  M.resposta = function (slide, ctx) {
    var linhas = (slide.codigo || []).reduce(function (n, b) { return n + b.texto.split('\n').length; }, 0);
    var longa = linhas > 4;
    var s = base(slide, 'resposta' + (longa ? ' slide--resposta-longa' : ''));
    s.appendChild(titulo(slide));
    var premio = el('div', 'resposta__premio', [P.chocolate(), txt('span', 'rotulo', 'prêmio do 1º lugar: ' + textoPremio(ctx, slide))]);
    var top3 = el('ol', 'top3');
    top3.setAttribute('data-top3', slide.atividade);
    ['1º', '2º', '3º'].forEach(function (pos, i) {
      top3.appendChild(el('li', 'top3__carta top3__carta--' + (i + 1), [txt('span', 'top3__posicao', pos + ' LUGAR'), txt('strong', 'top3__nome', 'aguardando'), txt('span', 'top3__valor', 'R$ ' + ctx.config.atividades[slide.atividade].premios[i])]));
    });
    s.appendChild(el('div', 'resposta__grade', [codigos(slide, { semSaida: true }), el('div', 'resposta__lado', [premio, longa ? top3 : null])]));
    if (!longa) { s.appendChild(top3); }
    if (slide.atividade === 'boss') {
      var mj = el('p', 'melhor-jogada', [txt('span', 'rotulo', 'MELHOR JOGADA'), txt('strong', 'melhor-jogada__nome', 'a escolher')]);
      mj.setAttribute('data-melhor-jogada', '');
      s.querySelector('.resposta__lado').appendChild(mj);
    }
    return s;
  };

  raiz.PI = raiz.PI || {};
  raiz.PI.modelos = M;
  raiz.PI.modelosApoio = { base: base, titulo: titulo, textos: textos, numerada: numerada, minutosDe: minutosDe, corDe: corDe };
})(window);
