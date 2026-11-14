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
  var ENVELOPE = '<svg viewBox="0 0 460 340" aria-hidden="true"><g transform="rotate(-7 210 90)"><rect x="70" y="20" width="290" height="140" class="arte-nota"/><rect x="84" y="34" width="262" height="112" class="arte-linha"/></g><g transform="rotate(5 250 80)"><rect x="110" y="10" width="290" height="140" class="arte-nota"/><rect x="124" y="24" width="262" height="112" class="arte-linha"/></g><rect x="20" y="96" width="420" height="234" class="arte-envelope"/><path d="M20 96 L230 226 L440 96" class="arte-traco"/><rect x="140" y="244" width="180" height="62" class="arte-etiqueta"/></svg>';

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
    return el('div', 'slide__codigos', (slide.codigo || []).map(function (b) { return P.blocoCodigo(b, opcoes); }));
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
      var foto = m.foto ? el('img', 'ministrante__foto') : P.peao(m.cor);
      if (m.foto) { foto.src = m.foto; foto.alt = ''; }
      var c = el('div', 'ministrante__casa', [foto]);
      c.style.setProperty('--cor-peao', m.cor);
      return el('li', 'ministrante', [c, txt('strong', 'ministrante__nome', m.nome), m.secao ? txt('span', 'ministrante__secao', m.secao) : null]);
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

  M.conceito = function (slide) {
    var s = base(slide, 'conceito');
    s.appendChild(titulo(slide));
    var arte = null;
    if (slide.ilustracao === 'envelope') {
      arte = el('div', 'ilustracao', [P.svg(ENVELOPE, 'ilustracao__svg'), txt('span', 'ilustracao__etiqueta', 'saldo')]);
    } else if (slide.diagrama) {
      arte = raiz.PI.diagramas.criar(slide);
    } else if (slide.itens) {
      arte = el('dl', 'tabela-itens', slide.itens.map(function (it) { return el('div', '', [txt('dt', '', it.rotulo), txt('dd', '', it.texto)]); }));
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
