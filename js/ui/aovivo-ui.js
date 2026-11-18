/* Modo ao vivo: tecla E abre o editor offline (Skulpt), tecla O abre o OneCompiler oficial embutido.
   Sincronia: a janela principal grava pi:aovivo:v1 e é a única que roda código e escreve a saída;
   o painel grava pi:aovivo:v1:painel com o código e os pedidos (rodar, parar, responder).
   Cada janela só adota o código da outra quando não está sendo digitada (o foco decide quem manda). */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var P = PI.pecas;
  var GRAVAR_SAIDA_MS = 120;
  var REENVIO_CODIGO_MS = 900;
  var JANELA_DIGITACAO_MS = 1500;
  var MAX_TENTATIVAS_ONECOMPILER = 15;
  var FONTE_ONECOMPILER = { principal: 28, painel: 18 };
  var NOMES = { offline: 'Editor offline', onecompiler: 'OneCompiler' };
  var INTERROMPIDO = 'KeyboardInterrupt';

  var papel = 'principal';
  var obterSlide = function () { return null; };
  var atual = null;
  var vistoDoPainel = { versao: -1, codigo: '' };
  var ultimoPedido = 0;
  var slideDoCodigo = null;
  var resolverEntrada = null;
  var rodada = 0;
  var gravacaoPendente = null;
  var desenhoAgendado = false;
  var ultimaDigitacao = 0;
  var ui = null;

  function chaveMinha() { return papel === 'principal' ? PI.aoVivo.CHAVE : PI.aoVivo.CHAVE + ':painel'; }
  function chaveDaOutra() { return papel === 'principal' ? PI.aoVivo.CHAVE + ':painel' : PI.aoVivo.CHAVE; }

  function ler(chave) {
    try {
      return PI.aoVivo.normalizar(raiz.localStorage.getItem(chave));
    } catch (erro) {
      console.error('localStorage indisponível para o modo ao vivo:', erro.message);
      return null;
    }
  }

  function gravarAgora() {
    gravacaoPendente = null;
    try {
      raiz.localStorage.setItem(chaveMinha(), JSON.stringify(atual));
    } catch (erro) {
      console.error('Não deu para salvar o modo ao vivo:', erro.message);
    }
  }

  // A saída de um print em laço chega em rajadas: junta e grava no máximo a cada GRAVAR_SAIDA_MS.
  function gravar(juntar) {
    if (juntar) {
      if (!gravacaoPendente) { gravacaoPendente = raiz.setTimeout(gravarAgora, GRAVAR_SAIDA_MS); }
      return;
    }
    if (gravacaoPendente) { raiz.clearTimeout(gravacaoPendente); }
    gravarAgora();
  }

  // Com juntar (saída de print), o redesenho também espera o próximo quadro, como a gravação.
  function mudar(novo, juntar) {
    atual = novo;
    gravar(juntar);
    if (juntar) { agendarDesenho(); } else { desenhar(); }
  }

  function agendarDesenho() {
    if (desenhoAgendado) { return; }
    desenhoAgendado = true;
    raiz.requestAnimationFrame(function () {
      desenhoAgendado = false;
      desenhar();
    });
  }

  // Quem digitou por último manda: por JANELA_DIGITACAO_MS, o código que chega da outra janela não
  // sobrescreve o que está sendo digitado aqui. (O foco não serve: com as duas janelas abertas,
  // alguns navegadores dizem que as duas têm foco.)
  function editandoAqui() { return Date.now() - ultimaDigitacao < JANELA_DIGITACAO_MS; }

  // ---------- ações ----------

  function abrir(motor) {
    var slide = obterSlide();
    var doSlide = slide ? PI.aoVivo.codigoDoSlide(slide) : '';
    var codigo = atual.codigo;
    if (slide && doSlide && slide.n !== slideDoCodigo) {
      codigo = doSlide;
      slideDoCodigo = slide.n;
    }
    mudar(PI.aoVivo.abrir(atual, motor, codigo, papel));
    if (ui.editor && motor === 'offline') { ui.editor.focar(); }
  }

  function alternar(motor) {
    if (atual.aberto && atual.motor === motor) { fechar(); return; }
    if (atual.aberto) { mudar(PI.aoVivo.abrir(atual, motor, atual.codigo, papel)); return; }
    abrir(motor);
  }

  function fechar() {
    if (papel === 'principal') { PI.motorSkulpt.parar(); }
    mudar(PI.aoVivo.fechar(atual, papel));
  }

  function aoDigitar(codigo) {
    if (codigo === atual.codigo) { return; }
    ultimaDigitacao = Date.now();
    mudar(PI.aoVivo.comCodigo(atual, codigo, papel));
  }

  function pedir(acao, valor) { mudar(PI.aoVivo.pedir(atual, acao, valor, papel)); }

  function rodar() {
    if (papel !== 'principal') { pedir(atual.motor === 'onecompiler' ? 'rodarOneCompiler' : 'rodar', ''); return; }
    if (atual.motor === 'onecompiler') { enviarAoIframe(PI.aoVivo.mensagemRodar()); return; }
    var codigo = atual.codigo;
    var minha = ++rodada;
    resolverEntrada = null;
    mudar(PI.aoVivo.comExecucao(atual, { estado: 'rodando', saida: '', pergunta: '', erroLinha: null }, papel));
    PI.motorSkulpt.rodar(codigo, {
      aoEscrever: function (texto) {
        if (minha !== rodada) { return; }
        mudar(PI.aoVivo.anexarSaida(atual, texto, papel), true);
      },
      aoPedirEntrada: function (pergunta) {
        return new Promise(function (resolver) {
          resolverEntrada = resolver;
          var comPergunta = PI.aoVivo.anexarSaida(atual, pergunta, papel);
          mudar(PI.aoVivo.comExecucao(comPergunta, { estado: 'esperando', pergunta: pergunta }, papel));
          if (ui.entrada && document.hasFocus()) { ui.entrada.focus(); }
        });
      }
    }).then(function (resultado) {
      if (minha === rodada) { terminar(resultado, codigo); }
    }).catch(function (erro) {
      console.error('Modo ao vivo: falha ao rodar o código:', erro);
      if (minha !== rodada) { return; }
      resolverEntrada = null;
      var comAviso = PI.aoVivo.anexarSaida(atual, '\nSystemError: o editor offline falhou. Aperte Rodar de novo.', papel);
      mudar(PI.aoVivo.comExecucao(comAviso, { estado: 'parado', pergunta: '' }, papel));
    });
  }

  function terminar(resultado, codigo) {
    resolverEntrada = null;
    var saida = atual.execucao.saida;
    var separar = saida && saida.slice(-1) !== '\n' ? '\n' : '';
    var mudancas = { estado: 'parado', pergunta: '' };
    var novo = atual;
    if (resultado.parado) {
      novo = PI.aoVivo.anexarSaida(novo, separar + INTERROMPIDO, papel);
    } else if (resultado.erro) {
      var erro = PI.aoVivo.traduzirErro(resultado.erro, codigo);
      novo = PI.aoVivo.anexarSaida(novo, separar + erro.texto, papel);
      mudancas.erroLinha = erro.linha;
    }
    mudar(PI.aoVivo.comExecucao(novo, mudancas, papel));
  }

  function responder(valor) {
    if (papel !== 'principal') {
      // Esconde o campo até a principal pedir o próximo input: dois Enter não mandam duas respostas.
      mudar(PI.aoVivo.comExecucao(PI.aoVivo.pedir(atual, 'responder', valor, papel), { estado: 'rodando', pergunta: '' }, papel));
      return;
    }
    if (!resolverEntrada) { return; }
    var resolver = resolverEntrada;
    resolverEntrada = null;
    var comValor = PI.aoVivo.anexarSaida(atual, valor + '\n', papel);
    mudar(PI.aoVivo.comExecucao(comValor, { estado: 'rodando', pergunta: '' }, papel));
    resolver(valor);
  }

  function parar() {
    if (papel !== 'principal') { pedir('parar', ''); return; }
    PI.motorSkulpt.parar();
  }

  function tratarPedido(pedido) {
    if (!pedido || pedido.id <= ultimoPedido) { return; }
    ultimoPedido = pedido.id;
    if (!atual.aberto && pedido.acao !== 'parar') { return; }
    if (pedido.acao === 'rodar' && atual.motor === 'offline') { rodar(); }
    else if (pedido.acao === 'parar') { parar(); }
    else if (pedido.acao === 'responder') { responder(pedido.valor); }
    else if (pedido.acao === 'rodarOneCompiler') { enviarAoIframe(PI.aoVivo.mensagemRodar()); }
  }

  // ---------- sincronia entre janelas ----------

  // O painel só grava quando alguém age nele, e antes adota o estado da principal. Então cada
  // gravação nova dele (versão diferente) traz a intenção atual: aberto ou fechado, e qual motor.
  function aoMudarPainel(remoto) {
    if (remoto.versao === vistoDoPainel.versao) { return; }
    var novo = atual;
    if (remoto.aberto !== atual.aberto || (remoto.aberto && remoto.motor !== atual.motor)) {
      if (remoto.aberto && !atual.aberto) { lembrarSlideDoCodigo(); }
      novo = remoto.aberto ? PI.aoVivo.abrir(novo, remoto.motor, novo.codigo, 'painel') : PI.aoVivo.fechar(novo, 'painel');
      if (!remoto.aberto) { PI.motorSkulpt.parar(); }
    }
    // Quem pede para rodar roda o código que tem na tela dele. Fora isso, o código do painel só
    // entra se mudou e ninguém digitou aqui agora; se não entrou, fica para a próxima gravação dele.
    var pedido = remoto.pedido;
    var vaiRodar = !!pedido && pedido.id > ultimoPedido && (pedido.acao === 'rodar' || pedido.acao === 'rodarOneCompiler');
    var adotar = vaiRodar ? remoto.codigo !== novo.codigo : remoto.codigo !== vistoDoPainel.codigo && !editandoAqui();
    if (adotar) { novo = PI.aoVivo.comCodigo(novo, remoto.codigo, 'painel'); }
    vistoDoPainel = { versao: remoto.versao, codigo: adotar || remoto.codigo === novo.codigo ? remoto.codigo : vistoDoPainel.codigo };
    // A versão nunca volta: depois de recarregar, o painel parte dela, e o id do pedido dele é versao + 1.
    mudar(Object.assign({}, novo, { versao: Math.max(novo.versao, remoto.versao) }));
    tratarPedido(pedido);
  }

  function lembrarSlideDoCodigo() {
    var slide = obterSlide();
    slideDoCodigo = slide ? slide.n : null;
  }

  function aoMudarPrincipal(remoto) {
    if (remoto.aberto && !atual.aberto) { lembrarSlideDoCodigo(); }
    var codigo = editandoAqui() ? atual.codigo : remoto.codigo;
    // A versão nunca volta: o número do próximo pedido (versao + 1) precisa ser maior que o anterior.
    atual = Object.assign({}, remoto, { codigo: codigo, pedido: atual.pedido, versao: Math.max(atual.versao, remoto.versao) });
    desenhar();
  }

  function aoArmazenar(evento) {
    if (evento.key !== chaveDaOutra() || evento.newValue === null) { return; }
    var remoto = PI.aoVivo.normalizar(evento.newValue);
    if (!remoto) {
      console.error('Modo ao vivo: estado da outra janela fora do formato, ignorado.');
      return;
    }
    if (papel === 'principal') { aoMudarPainel(remoto); } else { aoMudarPrincipal(remoto); }
  }

  // ---------- OneCompiler ----------

  function enviarAoIframe(mensagem) {
    if (ui.iframe && ui.iframe.contentWindow) {
      ui.iframe.contentWindow.postMessage(mensagem, PI.aoVivo.ORIGEM_ONECOMPILER);
    }
  }

  function enviarCodigo() {
    ui.codigoNoIframe = atual.codigo;
    enviarAoIframe(PI.aoVivo.mensagemCodigo(atual.codigo));
  }

  // O editor do OneCompiler só aceita o código depois de terminar de carregar, e ao iniciar manda
  // eventos próprios (vazio ou o exemplo dele). Até ele devolver o nosso código, reenvia e ignora o resto.
  function aoMensagem(evento) {
    if (!ui || !ui.iframe) { return; }
    var codigo = PI.aoVivo.codigoDaMensagem(evento, ui.iframe.contentWindow);
    if (codigo === null) { return; }
    var eco = PI.aoVivo.mesmoCodigo(codigo, ui.codigoNoIframe);
    if (!ui.iframePronto) {
      if (eco) { ui.iframePronto = true; }
      return;
    }
    if (eco) { return; }
    ui.codigoNoIframe = codigo;
    aoDigitar(codigo);
  }

  function confirmarIframe(iframe) {
    var tentativas = 0;
    function tentar() {
      if (ui.iframe !== iframe || ui.iframePronto || tentativas++ >= MAX_TENTATIVAS_ONECOMPILER) { return; }
      enviarCodigo();
      raiz.setTimeout(tentar, REENVIO_CODIGO_MS);
    }
    tentar();
  }

  function montarOneCompiler() {
    if (raiz.navigator.onLine === false) {
      return P.el('div', 'aovivo__sem-rede', [
        P.txt('strong', '', 'Sem internet: o OneCompiler não abre.'),
        P.txt('span', '', 'Aperte E para usar o editor offline com o mesmo código.')
      ]);
    }
    var iframe = document.createElement('iframe');
    iframe.className = 'aovivo__oc';
    iframe.title = 'OneCompiler: editor de Python';
    // Sandbox: o embed roda scripts na origem dele e abre o console, mas não navega a apresentação.
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox');
    iframe.referrerPolicy = 'no-referrer';
    iframe.src = PI.aoVivo.urlOneCompiler({ fontSize: FONTE_ONECOMPILER[papel], codeChangeEvent: true });
    iframe.addEventListener('load', function () {
      if (ui.iframe !== iframe) { return; }
      ui.iframePronto = false;
      confirmarIframe(iframe);
    });
    ui.iframe = iframe;
    ui.iframePronto = false;
    return P.el('div', 'aovivo__oc-caixa', [
      iframe,
      P.txt('p', 'aovivo__dica', 'Não carregou ou caiu a internet? Aperte E: o editor offline abre com o mesmo código.')
    ]);
  }

  // ---------- desenho ----------

  function botao(rotulo, aoClicar, classe) {
    var b = P.txt('button', 'aovivo__botao' + (classe ? ' ' + classe : ''), rotulo);
    b.type = 'button';
    b.addEventListener('click', function (e) { e.stopPropagation(); aoClicar(); });
    return b;
  }

  function montarOffline() {
    ui.editor = PI.editor.criar({ rotulo: 'Código Python ao vivo', aoMudar: aoDigitar, aoRodar: rodar });
    ui.texto = P.el('span', 'console__texto');
    ui.erro = P.el('span', 'console__erro');
    ui.entrada = P.el('input', 'console__entrada');
    ui.entrada.type = 'text';
    ui.entrada.setAttribute('aria-label', 'Resposta para o input');
    ui.entrada.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') { e.stopPropagation(); }
      if (e.key !== 'Enter') { return; }
      e.preventDefault();
      var valor = ui.entrada.value;
      ui.entrada.value = '';
      responder(valor);
    });
    ui.saida = P.el('pre', 'console__saida', [ui.texto, ui.erro, ui.entrada]);
    var painelSaida = P.el('section', 'console', [P.txt('span', 'console__rotulo', 'SAÍDA'), ui.saida]);
    var painelCodigo = P.el('section', 'aovivo__codigo', [P.txt('span', 'console__rotulo', 'MAIN.PY'), ui.editor.no]);
    return P.el('div', 'aovivo__offline', [painelCodigo, painelSaida]);
  }

  // A parte do erro (traceback ou KeyboardInterrupt) sai em vermelho.
  function separarErro(execucao) {
    var saida = execucao.saida;
    if (execucao.estado !== 'parado') { return [saida, '']; }
    var inicio = -1;
    if (execucao.erroLinha !== null) {
      inicio = saida.lastIndexOf('Traceback (most recent call last):');
      if (inicio < 0) { inicio = saida.lastIndexOf('  File "main.py", line'); }
    } else if (saida.slice(-INTERROMPIDO.length) === INTERROMPIDO) {
      inicio = saida.length - INTERROMPIDO.length;
    }
    return inicio < 0 ? [saida, ''] : [saida.slice(0, inicio), saida.slice(inicio)];
  }

  function desenharConsole() {
    if (!ui.saida) { return; }
    var ex = atual.execucao;
    var partes = separarErro(ex);
    if (ui.texto.textContent !== partes[0]) { ui.texto.textContent = partes[0]; }
    if (ui.erro.textContent !== partes[1]) { ui.erro.textContent = partes[1]; }
    ui.entrada.hidden = ex.estado !== 'esperando';
    ui.saida.scrollTop = ui.saida.scrollHeight;
    if (ui.linhaMarcada !== ex.erroLinha) {
      ui.linhaMarcada = ex.erroLinha;
      ui.editor.marcarLinha(ex.erroLinha);
    }
  }

  function limparCorpo() {
    ui.corpo.replaceChildren();
    ui.editor = null;
    ui.iframe = null;
    ui.saida = null;
    ui.linhaMarcada = null;
    ui.codigoNoIframe = null;
    ui.motor = null;
  }

  function montarCorpo() {
    limparCorpo();
    ui.motor = atual.motor;
    ui.corpo.appendChild(atual.motor === 'onecompiler' ? montarOneCompiler() : montarOffline());
    // O editor recém-criado sempre começa com o código atual, mesmo se houve digitação agora há pouco.
    if (ui.editor) { ui.editor.definir(atual.codigo); }
  }

  function situacao() {
    if (atual.motor !== 'offline') { return ''; }
    var estado = atual.execucao.estado;
    if (estado === 'esperando') { return 'esperando o input'; }
    return estado === 'rodando' ? 'rodando' : '';
  }

  // Só refaz o topo quando o motor ou a situação mudam: com a saída chegando várias vezes por
  // segundo, recriar os botões faria o clique em Parar se perder.
  function desenharTopo() {
    var assinatura = atual.motor + '|' + situacao();
    if (ui.assinaturaTopo === assinatura) { return; }
    ui.assinaturaTopo = assinatura;
    var outro = atual.motor === 'offline' ? 'onecompiler' : 'offline';
    var tecla = outro === 'offline' ? 'E' : 'O';
    var rodarRotulo = 'Rodar (Ctrl+Enter)';
    if (atual.motor === 'onecompiler') { rodarRotulo = papel === 'principal' ? 'Rodar' : 'Rodar no projetor'; }
    var acoes = [botao(rodarRotulo, rodar, 'aovivo__botao--rodar')];
    if (atual.motor === 'offline') { acoes.push(botao('Parar', parar)); }
    acoes.push(botao('Trocar para ' + NOMES[outro] + ' (' + tecla + ')', function () { alternar(outro); }));
    acoes.push(botao('Fechar (Esc)', fechar, 'aovivo__botao--leve'));
    ui.topo.replaceChildren(
      P.el('div', 'aovivo__marca', [P.txt('span', 'aovivo__selo', 'AO VIVO'), P.txt('strong', '', NOMES[atual.motor]), P.txt('span', 'aovivo__situacao', situacao())]),
      P.el('div', 'aovivo__acoes', acoes)
    );
  }

  function desenhar() {
    if (!ui) { return; }
    ui.caixa.hidden = !atual.aberto;
    document.documentElement.classList.toggle('com-aovivo', atual.aberto);
    if (!atual.aberto) {
      if (ui.motor !== null) { limparCorpo(); }
      return;
    }
    if (ui.motor !== atual.motor) { montarCorpo(); }
    desenharTopo();
    if (ui.editor) {
      if (!editandoAqui()) { ui.editor.definir(atual.codigo); }
      desenharConsole();
    }
    if (ui.iframe && ui.iframePronto && !PI.aoVivo.mesmoCodigo(atual.codigo, ui.codigoNoIframe) && !editandoAqui()) { enviarCodigo(); }
  }

  function montar() {
    var topo = P.el('header', 'aovivo__topo');
    var corpo = P.el('div', 'aovivo__corpo');
    var caixa = P.el('section', 'aovivo aovivo--' + papel, [topo, corpo]);
    caixa.setAttribute('aria-label', 'Código ao vivo');
    caixa.hidden = true;
    caixa.addEventListener('click', function (e) { e.stopPropagation(); });
    document.body.appendChild(caixa);
    ui = { caixa: caixa, topo: topo, corpo: corpo, motor: null, editor: null, iframe: null, saida: null, codigoNoIframe: null, linhaMarcada: null, assinaturaTopo: null };
  }

  // opcoes: { papel: 'principal' | 'painel', obterSlide: function () { return o slide atual } }
  function iniciar(opcoes) {
    papel = opcoes.papel === 'painel' ? 'painel' : 'principal';
    obterSlide = opcoes.obterSlide;
    var meu = ler(chaveMinha());
    var daOutra = ler(chaveDaOutra());
    if (papel === 'principal') {
      // Recarregar a principal encerra qualquer execução da sessão anterior, e a versão parte da
      // maior das duas janelas para os pedidos do painel continuarem valendo.
      var base = meu || PI.aoVivo.criar();
      atual = Object.assign({}, base, {
        aberto: false,
        versao: Math.max(base.versao, daOutra ? daOutra.versao : 0),
        execucao: Object.assign({}, base.execucao, { estado: 'parado', pergunta: '' })
      });
      if (daOutra) {
        vistoDoPainel = { versao: daOutra.versao, codigo: daOutra.codigo };
        ultimoPedido = daOutra.pedido ? daOutra.pedido.id : 0;
      }
    } else {
      var daPrincipal = daOutra || PI.aoVivo.criar();
      atual = Object.assign({}, daPrincipal, {
        pedido: meu ? meu.pedido : null,
        versao: Math.max(daPrincipal.versao, meu ? meu.versao : 0)
      });
    }
    montar();
    raiz.addEventListener('storage', aoArmazenar);
    raiz.addEventListener('message', aoMensagem);
    if (papel === 'principal') { gravar(); }
    desenhar();
  }

  function ajustar(transformacao) { if (ui) { ui.caixa.style.transform = transformacao; } }

  PI.aoVivoUi = {
    iniciar: iniciar,
    alternar: alternar,
    fechar: fechar,
    ajustar: ajustar,
    aberto: function () { return !!(atual && atual.aberto); }
  };
})(window);
