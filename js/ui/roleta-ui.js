/* Roleta na tela: sorteia pelo estado e anima a roda na janela principal. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var DURACAO_MS = 3600;
  var VOLTAS = 6;
  var vistoEm = null;
  var anguloAtual = 0;

  function nomeDe(estado, id) {
    var j = estado.jogadores.filter(function (x) { return x.id === id; })[0];
    return j ? j.nome : '';
  }

  function sortearAgora() {
    var estado = PI.loja.obter();
    var candidatos = PI.placar.candidatosSorteio(estado).map(function (j) { return j.id; });
    var r = PI.roleta.sortear(candidatos, estado.roleta, Math.random, Date.now());
    if (!r.ok) {
      PI.loja.avisar(r.erro, 'erro');
      return;
    }
    PI.loja.atualizar(function (e) { return Object.assign({}, e, { roleta: r.roleta }); });
  }

  function reduzirMovimento() {
    return raiz.matchMedia && raiz.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function rodaNaTela(palco) {
    var roda = palco.querySelector('.roleta');
    if (roda) { return roda; }
    var nova = PI.modelosApoio.roleta();
    var camada = PI.pecas.el('div', 'roleta-sobreposta', [nova]);
    palco.firstChild.appendChild(camada);
    return nova;
  }

  function animar(palco, nome) {
    var roleta = rodaNaTela(palco);
    var roda = roleta.querySelector('.roleta__roda');
    var resultado = roleta.querySelector('.roleta__resultado');
    resultado.textContent = '';
    anguloAtual += PI.roleta.anguloFinal(VOLTAS, Math.random);
    var duracao = reduzirMovimento() ? 0 : DURACAO_MS;
    roda.style.transition = duracao ? 'transform ' + duracao + 'ms cubic-bezier(0.12, 0.6, 0.12, 1)' : 'none';
    roda.style.transform = 'rotate(' + anguloAtual + 'deg)';
    raiz.setTimeout(function () { resultado.textContent = nome; }, duracao);
  }

  // Chamado depois de cada desenho: anima só quando chega um sorteio novo.
  function aoMudar(estado, palco) {
    var ultimo = estado.roleta.ultimo;
    if (!ultimo || ultimo.em === vistoEm) { return; }
    var primeiraVez = vistoEm === null;
    vistoEm = ultimo.em;
    if (primeiraVez || !palco) { return; }
    animar(palco, nomeDe(estado, ultimo.id));
  }

  function iniciar() {
    var u = PI.loja.obter().roleta.ultimo;
    vistoEm = u ? u.em : 0;
  }

  PI.roletaUi = { iniciar: iniciar, sortearAgora: sortearAgora, aoMudar: aoMudar, nomeDe: nomeDe };
})(window);
