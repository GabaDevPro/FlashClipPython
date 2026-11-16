/* Painel do placar (tecla L): jogadores, top 3, ranking, backup e zerar a partida. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var P = PI.pecas;
  var el = P.el, txt = P.txt;
  var caixa = null;
  var config = null;
  var atividadeSel = null;
  var statusTexto = '';

  function aberto() { return !!caixa && !caixa.hidden; }

  function status(texto, erro) {
    statusTexto = texto;
    var s = caixa && caixa.querySelector('.placar-ui__status');
    if (!s) { return; }
    s.textContent = texto;
    s.classList.toggle('placar-ui__status--erro', !!erro);
  }

  function tentar(transformar, sucesso) {
    try {
      PI.loja.atualizar(transformar, { desfazivel: true });
      if (sucesso) { status(sucesso); }
    } catch (erro) {
      status(erro.message, true);
    }
  }

  function botao(rotulo, aoClicar, classe) {
    var b = txt('button', 'placar-ui__botao' + (classe ? ' ' + classe : ''), rotulo);
    b.type = 'button';
    b.addEventListener('click', aoClicar);
    return b;
  }

  function secaoJogadores(estado) {
    var entrada = el('input', 'placar-ui__campo');
    entrada.maxLength = PI.placar.MAX_NOME;
    entrada.placeholder = 'Nome do jogador';
    entrada.setAttribute('aria-label', 'Nome do jogador');
    entrada.setAttribute('data-chave', 'novo-jogador');
    var form = el('form', 'placar-ui__linha', [entrada, txt('button', 'placar-ui__botao', 'Adicionar')]);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = entrada.value;
      tentar(function (s) { return PI.placar.adicionarJogador(s, nome); }, 'Jogador adicionado.');
    });
    var lista = el('ul', 'placar-ui__jogadores', estado.jogadores.map(function (j) {
      var nome = el('input', 'placar-ui__campo');
      nome.value = j.nome;
      nome.maxLength = PI.placar.MAX_NOME;
      nome.setAttribute('aria-label', 'Nome de ' + j.nome);
      nome.setAttribute('data-chave', 'nome-' + j.id);
      nome.addEventListener('change', function () {
        tentar(function (s) { return PI.placar.renomearJogador(s, j.id, nome.value); }, 'Nome corrigido.');
      });
      var marca = el('input');
      marca.type = 'checkbox';
      marca.checked = j.acertou;
      marca.setAttribute('data-chave', 'acertou-' + j.id);
      marca.addEventListener('change', function () {
        tentar(function (s) { return PI.placar.marcarAcertou(s, j.id, marca.checked); });
      });
      return el('li', 'placar-ui__linha', [nome, el('label', 'placar-ui__marca', [marca, ' acertou']),
        botao('Remover', function () { tentar(function (s) { return PI.placar.removerJogador(s, j.id); }, 'Jogador removido.'); }, 'placar-ui__botao--leve')]);
    }));
    var colar = el('textarea', 'placar-ui__campo');
    colar.rows = 3;
    colar.placeholder = 'Um nome por linha';
    colar.setAttribute('aria-label', 'Lista de quem acertou');
    var marcarLista = botao('Marcar quem acertou', function () {
      var r = PI.placar.marcarPorLista(PI.loja.obter(), colar.value);
      PI.loja.definir(r.estado, { desfazivel: true });
      status(r.desconhecidos.length ? 'Não achei: ' + r.desconhecidos.join(', ') : 'Lista marcada.', r.desconhecidos.length > 0);
    });
    return el('section', 'placar-ui__secao', [txt('h3', '', 'Jogadores (' + estado.jogadores.length + ')'), form, lista,
      el('details', '', [txt('summary', '', 'Colar lista de quem acertou alguma atividade'), colar, marcarLista])]);
  }

  function seletor(chave, rotulo, opcoes, valor) {
    var s = el('select', 'placar-ui__campo');
    s.setAttribute('aria-label', rotulo);
    s.setAttribute('data-chave', chave);
    opcoes.forEach(function (o) {
      var op = txt('option', '', o[1]);
      op.value = o[0];
      op.selected = o[0] === valor;
      s.appendChild(op);
    });
    return s;
  }

  function secaoTop3(estado) {
    var ids = Object.keys(config.atividades);
    var atividade = seletor('atividade', 'Atividade', ids.map(function (id) { return [id, config.atividades[id].nome]; }), atividadeSel);
    atividade.addEventListener('change', function () { atividadeSel = atividade.value; desenhar(); });
    var atuais = estado.resultados[atividadeSel] || [];
    var jogadores = [['', '(ninguém)']].concat(estado.jogadores.map(function (j) { return [j.id, j.nome]; }));
    var posicoes = ['1º', '2º', '3º'].map(function (p, i) { return seletor('top-' + i, p + ' lugar', jogadores, atuais[i] || ''); });
    var salvar = botao('Salvar top 3', function () {
      var escolhidos = posicoes.map(function (s) { return s.value; });
      tentar(function (s) { return PI.placar.registrarTop3(s, atividadeSel, escolhidos); }, 'Top 3 salvo.');
    });
    var premios = config.atividades[atividadeSel].premios.map(PI.dinheiro).join(', ');
    return el('section', 'placar-ui__secao', [txt('h3', '', 'Top 3 da atividade'), el('div', 'placar-ui__linha', [atividade]),
      el('div', 'placar-ui__linha', posicoes), txt('p', 'placar-ui__nota', 'Prêmios: ' + premios), el('div', 'placar-ui__linha', [salvar])]);
  }

  function secaoRanking(estado) {
    var r = PI.placar.ranking(estado, config.atividades);
    return el('section', 'placar-ui__secao', [txt('h3', '', 'Ranking'), r.length ? el('ol', 'placar-ui__ranking', r.map(function (x) {
      return txt('li', '', x.nome + ': ' + PI.dinheiro(x.total) + (x.primeiros ? ' (' + x.primeiros + ' em 1º)' : ''));
    })) : txt('p', 'placar-ui__nota', 'Ninguém pontuou ainda.')]);
  }

  function exportar() {
    var blob = new Blob([PI.estado.exportar(PI.loja.obter())], { type: 'application/json' });
    var a = el('a');
    a.href = URL.createObjectURL(blob);
    a.download = PI.estado.nomeArquivo(new Date());
    document.body.appendChild(a);
    a.click();
    a.remove();
    raiz.setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    status('Placar exportado: ' + a.download);
  }

  function importar(arquivo) {
    arquivo.text().then(function (texto) {
      var r = PI.estado.importar(texto, config.atividades, config.tempos);
      if (!r.ok) { status(r.erro, true); return; }
      if (!raiz.confirm('Trocar o placar atual pelo do arquivo ' + arquivo.name + '?')) { return; }
      PI.loja.definir(Object.assign({}, r.estado, { slide: PI.loja.obter().slide }), { desfazivel: true });
      status('Placar importado.');
    }).catch(function (erro) {
      console.error('Falha ao ler o arquivo:', erro);
      status('Não deu para ler esse arquivo.', true);
    });
  }

  function secaoPartida() {
    var arquivo = el('input', 'placar-ui__arquivo');
    arquivo.type = 'file';
    arquivo.accept = 'application/json,.json';
    arquivo.setAttribute('aria-label', 'Arquivo de placar');
    arquivo.addEventListener('change', function () { if (arquivo.files[0]) { importar(arquivo.files[0]); } });
    return el('section', 'placar-ui__secao', [txt('h3', '', 'Partida'), el('div', 'placar-ui__linha', [
      botao('Desfazer', function () { status(PI.loja.desfazer() ? 'Desfeito.' : 'Nada para desfazer.'); }),
      botao('Exportar placar', exportar),
      el('label', 'placar-ui__botao', ['Importar placar', arquivo]),
      botao('Zerar partida', function () {
        if (!raiz.confirm('Zerar a partida? Os jogadores e os resultados serão apagados deste navegador.')) { return; }
        var atual = PI.loja.obter();
        PI.loja.definir(Object.assign(PI.estado.inicial(config.atividades), { slide: atual.slide, cronometro: atual.cronometro }), { desfazivel: true });
        status('Partida zerada.');
      }, 'placar-ui__botao--perigo')
    ])]);
  }

  function desenhar() {
    if (!aberto()) { return; }
    var foco = document.activeElement && document.activeElement.getAttribute('data-chave');
    var estado = PI.loja.obter();
    var fechar = botao('Fechar (Esc)', fechar_, 'placar-ui__botao--leve');
    caixa.replaceChildren(
      el('header', 'placar-ui__topo', [txt('h2', '', 'Placar'), fechar]),
      txt('p', 'placar-ui__status', statusTexto),
      el('div', 'placar-ui__grade', [secaoJogadores(estado), el('div', '', [secaoTop3(estado), secaoRanking(estado), secaoPartida()])])
    );
    caixa.querySelector('.placar-ui__status').setAttribute('role', 'status');
    var alvo = foco && caixa.querySelector('[data-chave="' + foco + '"]');
    (alvo || caixa.querySelector('[data-chave="novo-jogador"]')).focus();
  }

  function abrir(atividadeAtual) {
    atividadeSel = atividadeAtual && config.atividades[atividadeAtual] ? atividadeAtual : (atividadeSel || Object.keys(config.atividades)[0]);
    statusTexto = '';
    caixa.hidden = false;
    desenhar();
  }

  function fechar_() {
    caixa.hidden = true;
    document.body.focus();
  }

  function iniciar(cfg) {
    config = cfg;
    caixa = el('div', 'placar-ui');
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-modal', 'true');
    caixa.setAttribute('aria-label', 'Placar');
    caixa.hidden = true;
    document.body.appendChild(caixa);
    PI.loja.ouvir(function () { desenhar(); });
  }

  PI.placarUi = { iniciar: iniciar, abrir: abrir, fechar: fechar_, aberto: aberto };
})(window);
