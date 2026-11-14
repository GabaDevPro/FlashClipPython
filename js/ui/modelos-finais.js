/* Modelos do recap, ranking, intervalo, boss e premiação. */
(function (raiz) {
  'use strict';

  var P = raiz.PI.pecas;
  var A = raiz.PI.modelosApoio;
  var M = raiz.PI.modelos;
  var el = P.el, txt = P.txt;
  var RODA = '<svg viewBox="0 0 520 560" aria-hidden="true"><g class="roleta__fatias">' +
    ['marrom', 'celeste', 'rosa', 'laranja', 'vermelho', 'amarelo', 'verde', 'azul'].map(function (c, i) {
      var r = 230, a0 = (i / 8) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / 8) * 2 * Math.PI - Math.PI / 2;
      return '<path class="fatia--' + c + '" d="M260 260 L' + (260 + r * Math.cos(a0)).toFixed(1) + ' ' + (260 + r * Math.sin(a0)).toFixed(1) +
        ' A230 230 0 0 1 ' + (260 + r * Math.cos(a1)).toFixed(1) + ' ' + (260 + r * Math.sin(a1)).toFixed(1) + ' Z"/>';
    }).join('') + '</g><circle cx="260" cy="260" r="230" class="arte-aro"/><circle cx="260" cy="260" r="62" class="arte-miolo"/><polygon points="260,500 236,548 284,548" class="arte-ponteiro"/></svg>';

  M.recap = function (slide) {
    var s = A.base(slide, 'recap');
    s.appendChild(A.titulo(slide));
    var cores = ['celeste', 'rosa', 'laranja', 'vermelho', 'verde'];
    s.appendChild(el('div', 'linha-cartas linha-cartas--5', slide.itens.map(function (item, i) {
      var c = P.carta({ cor: cores[i % 5], rotulo: 'ATUALIZAÇÃO ' + (i + 1), titulo: String(i + 1), texto: item.texto });
      c.appendChild(txt('span', 'selo', 'COMPRADA'));
      return c;
    })));
    return s;
  };

  function roleta() {
    return el('div', 'roleta', [P.svg(RODA, 'roleta__roda'), txt('span', 'roleta__miolo', 'SORTEIO'), txt('p', 'roleta__resultado', '')]);
  }

  M.ranking = function (slide) {
    var final = slide.ranking === 'final';
    var s = A.base(slide, 'ranking' + (final ? ' slide--ranking-final' : ''));
    s.appendChild(A.titulo(slide));
    var lista = el('ol', 'ranking');
    lista.setAttribute('data-ranking', final ? 'final' : 'parcial');
    lista.appendChild(txt('li', 'ranking__vazio', 'ranking ao vivo'));
    var magnata = final ? P.carta({ cor: 'amarelo', rotulo: '1º LUGAR', titulo: 'Magnata da Liga', texto: '' }) : null;
    if (magnata) { magnata.classList.add('magnata'); magnata.setAttribute('data-magnata', ''); }
    s.appendChild(el('div', 'ranking__grade', [magnata, lista, slide.roleta ? roleta() : null]));
    return s;
  };

  M.intervalo = function (slide, ctx) {
    var s = A.base(slide, 'intervalo');
    s.appendChild(A.titulo(slide, 'titulo-capa'));
    s.appendChild(P.cronometro(A.minutosDe(ctx, slide), 'normal', slide.cronometro));
    s.appendChild(A.textos(slide, 'slide__texto--grande'));
    s.appendChild(el('div', 'intervalo__arte', [P.nota('R$ 100'), P.dado(2)]));
    return s;
  };

  M.impacto = function (slide) {
    var s = A.base(slide, 'impacto', { cabecalho: false, faixa: false });
    s.appendChild(P.bordaTabuleiro());
    s.appendChild(el('div', 'impacto__miolo', [txt('p', 'rotulo rotulo--amarelo', slide.secaoTitulo.toUpperCase()), A.titulo(slide, 'titulo-capa')]));
    s.appendChild(el('div', 'impacto__dados', [P.dado(6), P.dado(6)]));
    return s;
  };

  M.premios = function (slide) {
    var s = A.base(slide, 'premios');
    s.appendChild(A.titulo(slide));
    var cores = ['amarelo', 'azul', 'verde'];
    s.appendChild(el('div', 'linha-cartas', slide.itens.map(function (item, i) {
      return P.carta({ cor: cores[i % 3], rotulo: 'MOMENTO ' + (i + 1), titulo: item.titulo, texto: item.texto });
    })));
    return s;
  };

  M.proximos = function (slide) {
    var s = A.base(slide, 'proximos');
    s.appendChild(A.titulo(slide));
    s.appendChild(A.numerada(slide.itens, 1));
    return s;
  };

  M.encerramento = function (slide, ctx) {
    var s = A.base(slide, 'encerramento');
    s.appendChild(A.titulo(slide, 'titulo-capa'));
    s.appendChild(el('ul', 'integrantes', ctx.config.ministrantes.map(function (m) { return txt('li', '', m.nome); })));
    s.appendChild(el('div', 'encerramento__peoes', ctx.config.ministrantes.map(function (m) { return P.peao(m.cor); })));
    s.appendChild(P.nota('1500'));
    return s;
  };
})(window);
