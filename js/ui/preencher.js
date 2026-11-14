/* Liga os slides de resposta e de ranking ao placar. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var P = PI.pecas;
  var TOP_PARCIAL = 5;

  function dinheiro(valor) {
    return 'R$ ' + Number(valor).toLocaleString('pt-BR');
  }

  function preencherTop3(no, estado, config) {
    var lista = no.querySelector('[data-top3]');
    if (!lista) { return; }
    var top = PI.placar.top3(estado, lista.getAttribute('data-top3'), config.atividades);
    var cartas = lista.querySelectorAll('.top3__carta');
    for (var i = 0; i < cartas.length; i++) {
      var item = top[i];
      cartas[i].querySelector('.top3__nome').textContent = item ? item.nome : 'aguardando';
      cartas[i].classList.toggle('top3__carta--vazia', !item);
    }
  }

  function linha(r) {
    return P.el('li', 'ranking__linha', [
      P.txt('span', 'ranking__posicao', r.posicao),
      P.txt('span', 'ranking__nome', r.nome),
      P.txt('span', 'ranking__valor', dinheiro(r.total))
    ]);
  }

  function preencherRanking(no, estado, config) {
    var lista = no.querySelector('[data-ranking]');
    if (!lista) { return; }
    var ranking = PI.placar.ranking(estado, config.atividades);
    if (!ranking.length) { return; }
    var final = lista.getAttribute('data-ranking') === 'final';
    var corpo = no.querySelector('[data-magnata] .carta__corpo');
    if (final && corpo) { corpo.replaceChildren(P.txt('p', 'carta__texto', ranking[0].nome + '\n' + dinheiro(ranking[0].total))); }
    var mostrar = final ? ranking.slice(1, 1 + TOP_PARCIAL) : ranking.slice(0, TOP_PARCIAL);
    lista.replaceChildren.apply(lista, mostrar.map(linha));
  }

  function preencher(no, estado, config) {
    preencherTop3(no, estado, config);
    preencherRanking(no, estado, config);
  }

  PI.preencher = preencher;
  PI.dinheiro = dinheiro;
})(window);
