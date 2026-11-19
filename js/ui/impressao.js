/* PDF pelo Ctrl+P: antes de imprimir, monta todos os slides, um por página.
   Usa um placar vazio, então os rankings saem como "ranking ao vivo". */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var ID = 'impressao';

  function montar() {
    desmontar();
    var config = PI.config;
    var vazio = PI.estado.inicial(config.atividades);
    var ctx = { config: config };
    var caixa = PI.pecas.el('div', 'impressao');
    caixa.id = ID;
    PI.edicaoUi.slides({}).forEach(function (slide) {
      var no = PI.modelos[slide.layout](slide, ctx);
      PI.preencher(no, vazio, config);
      caixa.appendChild(PI.pecas.el('div', 'pagina', [no]));
    });
    document.body.appendChild(caixa);
  }

  function desmontar() {
    var antiga = document.getElementById(ID);
    if (antiga) { antiga.remove(); }
  }

  raiz.addEventListener('beforeprint', montar);
  raiz.addEventListener('afterprint', desmontar);
  PI.impressao = { montar: montar, desmontar: desmontar };
})(window);
