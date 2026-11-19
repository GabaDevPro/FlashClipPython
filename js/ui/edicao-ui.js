/* Modo edição (tecla E): muda textos e código dos slides, cria e esconde slides no dia da aula,
   sem mexer nos arquivos de conteudo/. As alterações ficam no localStorage (pi:edicao:v1, lógica em
   js/logica/edicao.js), valem também no painel e no PDF, e vão para outro computador por um .json.
   Mudar um texto redesenha na hora; criar, esconder, desfazer e importar recarregam a página. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var MARCA_EDITANDO = 'pi:editando';
  var RESERVA = PI.edicao.CHAVE + ':anterior';
  var CAMPO_DE_CODIGO = /^codigo\.\d+\.(texto|saida)$/;
  var LAYOUTS_COM_LINHAS = ['conceito', 'enunciado', 'instrucoes'];
  var RECUO = '    ';
  var MAX_ARQUIVO = 1000000;
  var LIBERAR_URL_MS = 1000;

  var lista = [];
  var indiceAtual = function () { return 0; };
  var redesenhar = function () {};
  var barra = null;
  var caixa = null;
  var emEdicao = null;

  // ---------- armazenamento ----------

  function avisar(texto, tipo) { if (PI.loja) { PI.loja.avisar(texto, tipo); } }

  function lerAlteracoes() {
    var bruto;
    try {
      bruto = raiz.localStorage.getItem(PI.edicao.CHAVE);
    } catch (erro) {
      console.error('localStorage indisponível para as alterações dos slides:', erro.message);
      return PI.edicao.criar();
    }
    if (bruto === null) { return PI.edicao.criar(); }
    var alt = PI.edicao.normalizar(bruto);
    if (!alt) {
      console.error('Alterações dos slides no navegador estão fora do formato; foram ignoradas e guardadas em ' + RESERVA + ':invalido.');
      gravar(RESERVA + ':invalido', bruto);
      return PI.edicao.criar();
    }
    return alt;
  }

  function gravar(chave, texto) {
    try {
      raiz.localStorage.setItem(chave, texto);
      return true;
    } catch (erro) {
      console.error('Não deu para salvar as alterações dos slides:', erro.message);
      avisar('Não deu para salvar a alteração no navegador.', 'erro');
      return false;
    }
  }

  function salvar(alt) { return gravar(PI.edicao.CHAVE, PI.edicao.exportar(alt)); }

  // Antes de desfazer ou importar, guarda a versão anterior: nada some de vez.
  function guardarReserva() { return gravar(RESERVA, PI.edicao.exportar(lerAlteracoes())); }

  function ativo() {
    try {
      return raiz.sessionStorage.getItem(MARCA_EDITANDO) === '1';
    } catch (erro) {
      return false;
    }
  }

  // Lista de slides com as alterações aplicadas. Fora do modo edição, os escondidos saem.
  function slides(opcoes) {
    return PI.edicao.aplicar(PI.conteudo.achatarSecoes(PI.secoes()), lerAlteracoes(), { incluirOcultos: !!(opcoes && opcoes.incluirOcultos) });
  }

  function recarregarEm(n) {
    raiz.history.replaceState(null, '', '#' + encodeURIComponent(String(n)));
    raiz.location.reload();
  }

  function slideAtual() { return lista[indiceAtual()]; }

  function alternar() {
    try {
      if (ativo()) { raiz.sessionStorage.removeItem(MARCA_EDITANDO); } else { raiz.sessionStorage.setItem(MARCA_EDITANDO, '1'); }
    } catch (erro) {
      console.error('sessionStorage indisponível para o modo edição:', erro.message);
      avisar('O navegador bloqueou o modo edição.', 'erro');
      return;
    }
    var slide = slideAtual();
    recarregarEm(slide ? slide.n : '');
  }

  // ---------- mudar um campo ----------

  // A lista é a mesma usada por app.js e pelo modo ao vivo (mesma referência): troca o conteúdo
  // no lugar para todos verem a mudança sem recarregar.
  function atualizarLista() {
    var nova = slides({});
    lista.splice.apply(lista, [0, lista.length].concat(nova));
  }

  function gravarCampo(n, caminho, valor) {
    if (salvar(PI.edicao.comCampo(lerAlteracoes(), n, caminho, valor))) { atualizarLista(); }
    redesenhar();
    desenharBarra();
  }

  // Título e partes de item não ficam vazios: o elemento sumiria do slide e não daria para clicar de novo.
  var OBRIGATORIO = /^(titulo|itens\.)/;

  function limparEspacos(texto) { return texto.replace(/\s+/g, ' ').trim(); }

  function editarNoLugar(no, caminho) {
    var slide = slideAtual();
    var original = PI.edicao.valorDe(slide, caminho);
    var acabou = false;
    emEdicao = no;
    no.textContent = original;
    try { no.contentEditable = 'plaintext-only'; } catch (erro) { no.contentEditable = 'true'; }
    no.classList.add('em-edicao');
    no.focus();
    raiz.getSelection().selectAllChildren(no);

    function acabar(manter) {
      if (acabou) { return; }
      acabou = true;
      emEdicao = null;
      no.removeEventListener('keydown', aoTeclar);
      no.removeEventListener('blur', aoSair);
      var valor = limparEspacos(no.textContent);
      if (manter && !valor && OBRIGATORIO.test(caminho)) {
        avisar('Esse campo não pode ficar vazio. Para voltar ao original, use Desfazer este slide.', 'erro');
        manter = false;
      }
      if (manter && valor !== limparEspacos(original)) { gravarCampo(slide.n, caminho, valor); } else { redesenhar(); }
    }
    function aoTeclar(e) {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); acabar(true); }
      if (e.key === 'Escape') { e.preventDefault(); acabar(false); }
    }
    function aoSair() { acabar(true); }
    no.addEventListener('keydown', aoTeclar);
    no.addEventListener('blur', aoSair);
  }

  function aoClicarNoPalco(e) {
    if (!ativo()) { return; }
    // Em modo edição o clique não avança o slide: vira edição do campo clicado.
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (editando()) { return; }
    var no = e.target.closest('[data-campo]');
    if (!no) { return; }
    var caminho = no.getAttribute('data-campo');
    if (!PI.edicao.caminhoValido(caminho)) { avisar('Essa parte do slide não dá para editar aqui.', 'erro'); return; }
    e.preventDefault();
    if (CAMPO_DE_CODIGO.test(caminho)) { abrirCaixa(caminho); } else { editarNoLugar(no, caminho); }
  }

  // ---------- caixa para código e saída ----------

  function montarCaixa() {
    var P = PI.pecas;
    var titulo = P.txt('h2', 'caixa-codigo__titulo', '');
    var area = P.el('textarea', 'caixa-codigo__texto');
    area.spellcheck = false;
    area.setAttribute('wrap', 'off');
    area.setAttribute('aria-label', 'Código do slide');
    var cancelar = P.txt('button', 'barra-edicao__botao', 'Cancelar (Esc)');
    var salvarBotao = P.txt('button', 'barra-edicao__botao barra-edicao__botao--sair', 'Salvar (Ctrl+Enter)');
    cancelar.type = 'button';
    salvarBotao.type = 'button';
    var janela = P.el('div', 'caixa-codigo__janela', [titulo, P.txt('p', 'caixa-codigo__dica', 'Tab recua 4 espaços. O slide muda assim que salvar.'), area, P.el('div', 'caixa-codigo__acoes', [cancelar, salvarBotao])]);
    var no = P.el('div', 'caixa-codigo', [janela]);
    no.setAttribute('role', 'dialog');
    no.setAttribute('aria-modal', 'true');
    no.hidden = true;
    cancelar.addEventListener('click', function () { fecharCaixa(false); });
    salvarBotao.addEventListener('click', function () { fecharCaixa(true); });
    area.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); fecharCaixa(false); return; }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); fecharCaixa(true); return; }
      if (e.key === 'Tab') {
        e.preventDefault();
        if (!document.execCommand('insertText', false, RECUO)) { area.setRangeText(RECUO, area.selectionStart, area.selectionEnd, 'end'); }
      }
    });
    document.body.appendChild(no);
    caixa = { no: no, titulo: titulo, area: area, caminho: null, n: null, original: '' };
  }

  function abrirCaixa(caminho) {
    var slide = slideAtual();
    caixa.caminho = caminho;
    caixa.n = slide.n;
    caixa.original = PI.edicao.valorDe(slide, caminho);
    caixa.titulo.textContent = (/saida$/.test(caminho) ? 'Saída' : 'Código') + ' do slide ' + slide.n;
    caixa.area.value = caixa.original;
    caixa.no.hidden = false;
    emEdicao = caixa.no;
    caixa.area.focus();
  }

  function fecharCaixa(manter) {
    caixa.no.hidden = true;
    emEdicao = null;
    var valor = caixa.area.value.replace(/\r\n?/g, '\n');
    if (manter && valor !== caixa.original) { gravarCampo(caixa.n, caixa.caminho, valor); }
  }

  // ---------- ações da barra ----------

  function criarSlide(modelo) {
    var r = PI.edicao.comNovo(lerAlteracoes(), slideAtual().n, modelo);
    if (!r.n) { avisar('Chegou ao limite de ' + PI.edicao.MAX_NOVOS + ' slides novos.', 'erro'); return; }
    if (salvar(r.alt)) { recarregarEm(r.n); }
  }

  function maisUmaLinha() {
    var slide = slideAtual();
    gravarCampo(slide.n, 'texto.' + (slide.texto ? slide.texto.length : 0), 'Nova linha');
  }

  // O slide escondido sai da lista (também no modo edição); a barra mostra os escondidos para voltar.
  function esconder() {
    var i = indiceAtual();
    if (lista.length <= 1) { avisar('Não dá para esconder o único slide.', 'erro'); return; }
    var vizinho = lista[i + 1] || lista[i - 1];
    if (salvar(PI.edicao.comOculto(lerAlteracoes(), lista[i].n, true))) { recarregarEm(vizinho.n); }
  }

  function mostrar(n) {
    if (salvar(PI.edicao.comOculto(lerAlteracoes(), n, false))) { recarregarEm(n); }
  }

  function lerReserva() {
    try {
      return PI.edicao.normalizar(raiz.localStorage.getItem(RESERVA));
    } catch (erro) {
      console.error('Não deu para ler a cópia das alterações:', erro.message);
      return null;
    }
  }

  // Troca as alterações atuais pela cópia guardada (e guarda as atuais como cópia): dá para voltar atrás.
  function restaurarCopia() {
    var copia = lerReserva();
    if (!copia) { avisar('Não há cópia guardada.', 'erro'); return; }
    if (!raiz.confirm('Voltar para a cópia guardada antes do último desfazer ou importar? As alterações de agora viram a cópia.')) { return; }
    if (guardarReserva() && salvar(copia)) { recarregarEm(slideAtual().n); }
  }

  function desfazerSlide() {
    var slide = slideAtual();
    var alt = lerAlteracoes();
    var chave = String(slide.n).toLowerCase();
    var destino = slide.n;
    if (slide.novo) {
      if (!raiz.confirm('Apagar o slide novo ' + slide.n + '? Os slides novos criados a partir dele também saem. Uma cópia fica guardada.')) { return; }
      var registro = alt.novos.filter(function (x) { return x.n === chave; })[0];
      destino = registro ? registro.depoisDe : slide.n;
    }
    if (guardarReserva() && salvar(PI.edicao.semAlteracoes(alt, slide.n))) { recarregarEm(destino); }
  }

  function exportar() {
    var url = raiz.URL.createObjectURL(new raiz.Blob([PI.edicao.exportar(lerAlteracoes())], { type: 'application/json' }));
    var link = PI.pecas.el('a');
    link.href = url;
    link.download = PI.edicao.nomeArquivo(new Date());
    document.body.appendChild(link);
    link.click();
    link.remove();
    raiz.setTimeout(function () { raiz.URL.revokeObjectURL(url); }, LIBERAR_URL_MS);
  }

  function importar(arquivo) {
    if (!arquivo) { return; }
    if (arquivo.size > MAX_ARQUIVO) { avisar('Arquivo grande demais para ser de alterações dos slides.', 'erro'); return; }
    var leitor = new raiz.FileReader();
    leitor.onerror = function () {
      console.error('Falha ao ler o arquivo de alterações:', leitor.error);
      avisar('Não deu para ler o arquivo.', 'erro');
    };
    leitor.onload = function () {
      var alt = PI.edicao.normalizar(String(leitor.result));
      if (!alt) { avisar('Esse arquivo não é de alterações dos slides.', 'erro'); return; }
      if (!raiz.confirm('Trocar as alterações atuais pelas do arquivo? As atuais ficam guardadas no navegador.')) { return; }
      if (guardarReserva() && salvar(alt)) { recarregarEm(slideAtual().n); }
    };
    leitor.readAsText(arquivo);
  }

  function desfazerTudo() {
    if (!raiz.confirm('Desfazer todas as alterações? Os slides voltam a ser os dos arquivos. Uma cópia fica guardada no navegador.')) { return; }
    if (!guardarReserva()) { return; }
    try {
      raiz.localStorage.removeItem(PI.edicao.CHAVE);
    } catch (erro) {
      console.error('Não deu para desfazer as alterações:', erro.message);
      avisar('Não deu para desfazer as alterações.', 'erro');
      return;
    }
    recarregarEm(slideAtual().n);
  }

  // ---------- barra ----------

  function botao(rotulo, aoClicar, opcoes) {
    var b = PI.pecas.txt('button', 'barra-edicao__botao' + (opcoes && opcoes.sair ? ' barra-edicao__botao--sair' : ''), rotulo);
    b.type = 'button';
    b.disabled = !!(opcoes && opcoes.desligado);
    b.addEventListener('click', aoClicar);
    return b;
  }

  function desenharBarra() {
    var slide = slideAtual();
    if (!barra || !slide) { return; }
    var P = PI.pecas;
    var alt = lerAlteracoes();
    var alterado = !!alt.slides[String(slide.n).toLowerCase()];
    var total = PI.edicao.contar(alt);
    var linhas = slide.texto ? slide.texto.length : 0;
    var podeLinha = linhas < PI.edicao.MAX_LINHAS && LAYOUTS_COM_LINHAS.indexOf(slide.layout) >= 0;
    var info = P.el('span', 'barra-edicao__info', [
      'Slide ', P.txt('strong', '', slide.n), ': clique num texto ou código para mudar (Enter salva, Esc cancela). ',
      slide.novo ? P.txt('span', 'barra-edicao__aviso', 'Slide novo. ') : null,
      total === 1 ? '1 slide alterado.' : total + ' slides alterados.'
    ]);
    var escondidos = Object.keys(alt.slides).filter(function (k) { return alt.slides[k].oculto; });
    var acoes = P.el('div', 'barra-edicao__acoes', [
      botao('Novo slide de texto', function () { criarSlide('texto'); }),
      botao('Novo slide de código', function () { criarSlide('codigo'); }),
      botao('Mais uma linha', maisUmaLinha, { desligado: !podeLinha }),
      botao('Esconder slide', esconder, { desligado: lista.length <= 1 }),
      botao(slide.novo ? 'Apagar slide novo' : 'Desfazer este slide', desfazerSlide, { desligado: !slide.novo && !alterado }),
      botao('Exportar', exportar),
      botao('Importar', function () { barra.arquivo.click(); }),
      botao('Desfazer tudo', desfazerTudo, { desligado: total === 0 }),
      botao('Restaurar cópia', restaurarCopia, { desligado: !lerReserva() }),
      botao('Sair (E)', alternar, { sair: true })
    ]);
    var mostrarBotoes = escondidos.length ? P.el('div', 'barra-edicao__acoes', [P.txt('span', 'barra-edicao__aviso', 'Escondidos:')].concat(
      escondidos.map(function (k) { return botao('Mostrar ' + k, function () { mostrar(k); }); }))) : null;
    barra.no.replaceChildren(P.txt('span', 'barra-edicao__selo', 'MODO EDIÇÃO'), info, acoes, mostrarBotoes || '', barra.arquivo);
  }

  function montarBarra() {
    var arquivo = PI.pecas.el('input');
    arquivo.type = 'file';
    arquivo.accept = '.json,application/json';
    arquivo.hidden = true;
    arquivo.addEventListener('change', function () {
      importar(arquivo.files && arquivo.files[0]);
      arquivo.value = '';
    });
    var no = PI.pecas.el('div', 'barra-edicao');
    no.setAttribute('role', 'toolbar');
    no.setAttribute('aria-label', 'Modo edição');
    document.body.appendChild(no);
    barra = { no: no, arquivo: arquivo };
  }

  // Se o nó em edição saiu da página sem passar pelo fim da edição, a edição acabou.
  function editando() {
    if (emEdicao && !emEdicao.isConnected) { emEdicao = null; }
    return emEdicao !== null;
  }

  // ---------- início ----------

  // Janela principal. opcoes: { slides (a mesma lista de app.js), indiceAtual(), redesenhar(), palco }
  function iniciar(opcoes) {
    lista = opcoes.slides;
    indiceAtual = opcoes.indiceAtual;
    redesenhar = opcoes.redesenhar;
    if (!ativo()) { return; }
    document.documentElement.classList.add('modo-edicao');
    montarBarra();
    montarCaixa();
    opcoes.palco.addEventListener('click', aoClicarNoPalco, true);
    PI.loja.ouvir(desenharBarra);
    desenharBarra();
  }

  // Painel: quando a principal muda os slides, recarrega (menos com o OneCompiler aberto).
  function iniciarPainel() {
    raiz.addEventListener('storage', function (e) {
      if (e.key !== PI.edicao.CHAVE) { return; }
      if (PI.aoVivoUi && PI.aoVivoUi.aberto()) { return; }
      raiz.location.reload();
    });
  }

  PI.edicaoUi = {
    slides: slides,
    ativo: ativo,
    editando: editando,
    editandoNoPalco: function () { return editando() && emEdicao !== (caixa && caixa.no); },
    alternar: alternar,
    iniciar: iniciar,
    iniciarPainel: iniciarPainel
  };
})(window);
