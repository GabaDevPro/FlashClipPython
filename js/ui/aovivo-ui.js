/* Modo ao vivo (tecla O): o OneCompiler oficial embutido. No projetor, tema claro; no painel do
   apresentador, tema escuro e, ao lado, a cola com o código do slide para digitar ao vivo.
   Sincronia: a janela principal grava pi:aovivo:v2 e é quem roda (manda triggerRun ao iframe dela);
   o painel grava pi:aovivo:v2:painel com o código e o pedido de rodar. Cada janela só adota o
   código da outra quando ninguém digitou nela nos últimos JANELA_DIGITACAO_MS. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var P = PI.pecas;
  var REENVIO_CODIGO_MS = 900;
  var JANELA_DIGITACAO_MS = 1500;
  var MAX_TENTATIVAS_ONECOMPILER = 15;
  var ONECOMPILER = {
    principal: { fontSize: 28, tema: 'claro', codeChangeEvent: true },
    painel: { fontSize: 18, tema: 'escuro', codeChangeEvent: true }
  };

  var papel = 'principal';
  var slides = [];
  var indiceAtual = function () { return 0; };
  var irPara = function () {};
  var atual = null;
  var vistoDoPainel = { versao: -1, codigo: '' };
  var ultimoPedido = 0;
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

  function gravar() {
    try {
      raiz.localStorage.setItem(chaveMinha(), JSON.stringify(atual));
    } catch (erro) {
      console.error('Não deu para salvar o modo ao vivo:', erro.message);
    }
  }

  function mudar(novo) {
    atual = novo;
    gravar();
    desenhar();
  }

  // Quem digitou por último manda (o foco não serve: com as duas janelas abertas, alguns
  // navegadores dizem que as duas têm foco).
  function editandoAqui() { return Date.now() - ultimaDigitacao < JANELA_DIGITACAO_MS; }

  // ---------- ações ----------

  function alternar() { if (atual.aberto) { fechar(); } else { mudar(PI.aoVivo.abrir(atual, atual.codigo, papel)); } }
  function fechar() { mudar(PI.aoVivo.fechar(atual, papel)); }

  function aoDigitar(codigo) {
    if (codigo === atual.codigo) { return; }
    ultimaDigitacao = Date.now();
    mudar(PI.aoVivo.comCodigo(atual, codigo, papel));
  }

  // Limpar e Código do slide trocam o código de propósito: vale aqui na hora e na outra janela.
  function trocarCodigo(codigo) {
    ultimaDigitacao = 0;
    mudar(PI.aoVivo.comCodigo(atual, codigo, papel));
  }

  function slideComCodigo() {
    var j = PI.aoVivo.proximoComCodigo(slides, indiceAtual());
    return j < 0 ? null : slides[j];
  }

  function usarCodigoDoSlide() {
    var slide = slideComCodigo();
    trocarCodigo(slide ? PI.aoVivo.codigoDoSlide(slide) : '');
  }

  function rodar() {
    if (papel === 'principal') { enviarAoIframe(PI.aoVivo.mensagemRodar()); return; }
    mudar(PI.aoVivo.pedir(atual, 'rodar', papel));
  }

  function tratarPedido(pedido) {
    if (!pedido || pedido.id <= ultimoPedido) { return; }
    ultimoPedido = pedido.id;
    if (atual.aberto && pedido.acao === 'rodar') { enviarAoIframe(PI.aoVivo.mensagemRodar()); }
  }

  // ---------- sincronia entre janelas ----------

  // O painel só grava quando alguém age nele, e antes adota o estado da principal: cada gravação
  // nova dele (versão diferente) traz a intenção atual de abrir ou fechar.
  function aoMudarPainel(remoto) {
    if (remoto.versao === vistoDoPainel.versao) { return; }
    var novo = atual;
    if (remoto.aberto !== atual.aberto) {
      novo = remoto.aberto ? PI.aoVivo.abrir(novo, novo.codigo, 'painel') : PI.aoVivo.fechar(novo, 'painel');
    }
    // Quem pede para rodar roda o código que tem na tela. Fora isso, o código do painel só entra
    // se mudou e ninguém digitou aqui agora; se não entrou, fica para a próxima gravação dele.
    var pedido = remoto.pedido;
    var vaiRodar = !!pedido && pedido.id > ultimoPedido && pedido.acao === 'rodar';
    var adotar = vaiRodar ? remoto.codigo !== novo.codigo : remoto.codigo !== vistoDoPainel.codigo && !editandoAqui();
    if (adotar) { novo = PI.aoVivo.comCodigo(novo, remoto.codigo, 'painel'); }
    vistoDoPainel = { versao: remoto.versao, codigo: adotar || remoto.codigo === novo.codigo ? remoto.codigo : vistoDoPainel.codigo };
    // A versão nunca volta: depois de recarregar, o painel parte dela, e o id do pedido dele é versao + 1.
    mudar(Object.assign({}, novo, { versao: Math.max(novo.versao, remoto.versao) }));
    tratarPedido(pedido);
  }

  function aoMudarPrincipal(remoto) {
    var codigo = editandoAqui() ? atual.codigo : remoto.codigo;
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
  // eventos próprios. Até ele devolver o nosso código (eco), reenvia e ignora o resto.
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
        P.txt('span', '', 'Feche com Esc e siga com o código que está nos slides.')
      ]);
    }
    var iframe = document.createElement('iframe');
    iframe.className = 'aovivo__oc';
    iframe.title = 'OneCompiler: editor de Python';
    // Sandbox: o embed roda scripts na origem dele e abre o console, mas não navega a apresentação.
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox');
    iframe.referrerPolicy = 'no-referrer';
    iframe.src = PI.aoVivo.urlOneCompiler(ONECOMPILER[papel]);
    iframe.addEventListener('load', function () {
      if (ui.iframe !== iframe) { return; }
      ui.iframePronto = false;
      confirmarIframe(iframe);
    });
    ui.iframe = iframe;
    ui.iframePronto = false;
    return P.el('div', 'aovivo__oc-caixa', [iframe]);
  }

  // ---------- cola (só no painel) ----------

  function blocoDaCola(bloco) {
    var partes = [P.txt('span', 'cola__rotulo', bloco.rotulo || 'Código')];
    var pre = P.el('pre', 'cola__codigo');
    // paraHtml escapa &, <, >, aspas e apóstrofo: o código do slide nunca vira marcação.
    pre.innerHTML = PI.realce.paraHtml(bloco.texto);
    partes.push(pre);
    if (bloco.entradas.length) {
      var entradas = P.el('p', 'cola__entradas', ['No input, digite: ']);
      bloco.entradas.forEach(function (valor, i) {
        if (i > 0) { entradas.appendChild(document.createTextNode(', ')); }
        entradas.appendChild(P.txt('code', '', valor));
      });
      partes.push(entradas);
    }
    if (bloco.saida !== null) {
      partes.push(P.txt('span', 'cola__rotulo', 'Saída esperada'));
      partes.push(P.txt('pre', 'cola__saida', bloco.saida));
    }
    return partes;
  }

  function desenharCola() {
    var i = indiceAtual();
    if (!ui.cola || ui.slideDaCola === i) { return; }
    ui.slideDaCola = i;
    var slide = slides[i];
    var j = PI.aoVivo.proximoComCodigo(slides, i);
    var nav = P.el('div', 'cola__nav', [
      botao('Slide anterior', function () { irPara(i - 1); }),
      botao('Próximo slide', function () { irPara(i + 1); })
    ]);
    nav.children[0].disabled = i === 0;
    nav.children[1].disabled = i === slides.length - 1;
    var conteudo = [
      P.el('div', 'cola__topo', [P.txt('span', 'cola__selo', 'COLA: SÓ NA SUA TELA'), nav]),
      P.txt('h2', 'cola__titulo', 'Slide ' + slide.n + ': ' + slide.titulo)
    ];
    if (j < 0) {
      conteudo.push(P.txt('p', 'cola__aviso', 'Daqui em diante, nenhum slide tem código.'));
    } else {
      if (j !== i) {
        conteudo.push(P.txt('p', 'cola__aviso', 'Este slide não tem código. O próximo é o do slide ' + slides[j].n + ': ' + slides[j].titulo + '.'));
      }
      PI.aoVivo.codigosDoSlide(slides[j]).forEach(function (bloco) { conteudo = conteudo.concat(blocoDaCola(bloco)); });
      var k = PI.aoVivo.proximoComCodigo(slides, j + 1);
      if (k >= 0) { conteudo.push(P.txt('p', 'cola__aviso', 'Depois: slide ' + slides[k].n + ', ' + slides[k].titulo + '.')); }
    }
    ui.cola.replaceChildren.apply(ui.cola, conteudo);
    ui.cola.scrollTop = 0;
  }

  // ---------- desenho ----------

  function botao(rotulo, aoClicar, classe) {
    var b = P.txt('button', 'aovivo__botao' + (classe ? ' ' + classe : ''), rotulo);
    b.type = 'button';
    b.addEventListener('click', function (e) { e.stopPropagation(); aoClicar(); });
    return b;
  }

  function limparCorpo() {
    ui.corpo.replaceChildren();
    ui.iframe = null;
    ui.iframePronto = false;
    ui.codigoNoIframe = null;
    ui.cola = null;
    ui.slideDaCola = -1;
    ui.montado = false;
  }

  function montarCorpo() {
    limparCorpo();
    if (papel === 'painel') {
      ui.cola = P.el('section', 'cola');
      ui.cola.setAttribute('aria-label', 'Cola do código do slide');
      ui.corpo.appendChild(ui.cola);
    }
    ui.corpo.appendChild(montarOneCompiler());
    ui.montado = true;
  }

  function desenhar() {
    if (!ui) { return; }
    ui.caixa.hidden = !atual.aberto;
    document.documentElement.classList.toggle('com-aovivo', atual.aberto);
    if (!atual.aberto) {
      if (ui.montado) { limparCorpo(); }
      return;
    }
    if (!ui.montado) { montarCorpo(); }
    desenharCola();
    if (ui.iframe && ui.iframePronto && !PI.aoVivo.mesmoCodigo(atual.codigo, ui.codigoNoIframe) && !editandoAqui()) { enviarCodigo(); }
  }

  function montar() {
    var acoes = P.el('div', 'aovivo__acoes', [
      botao(papel === 'principal' ? 'Rodar' : 'Rodar no projetor', rodar, 'aovivo__botao--rodar'),
      botao('Limpar', function () { trocarCodigo(''); }),
      botao('Código do slide', usarCodigoDoSlide),
      botao('Fechar (Esc)', fechar, 'aovivo__botao--leve')
    ]);
    var marca = P.el('div', 'aovivo__marca', [P.txt('span', 'aovivo__selo', 'AO VIVO'), P.txt('strong', '', 'OneCompiler')]);
    var topo = P.el('header', 'aovivo__topo', [marca, acoes]);
    var corpo = P.el('div', 'aovivo__corpo');
    var caixa = P.el('section', 'aovivo aovivo--' + papel, [topo, corpo]);
    caixa.setAttribute('aria-label', 'Código ao vivo no OneCompiler');
    caixa.hidden = true;
    caixa.addEventListener('click', function (e) { e.stopPropagation(); });
    document.body.appendChild(caixa);
    ui = { caixa: caixa, corpo: corpo, iframe: null, iframePronto: false, codigoNoIframe: null, cola: null, slideDaCola: -1, montado: false };
  }

  // opcoes: { papel: 'principal' | 'painel', slides, indiceAtual(), ir(indice) }
  function iniciar(opcoes) {
    papel = opcoes.papel === 'painel' ? 'painel' : 'principal';
    slides = opcoes.slides;
    indiceAtual = opcoes.indiceAtual;
    irPara = opcoes.ir;
    var meu = ler(chaveMinha());
    var daOutra = ler(chaveDaOutra());
    if (papel === 'principal') {
      var base = meu || PI.aoVivo.criar();
      atual = Object.assign({}, base, { aberto: false, versao: Math.max(base.versao, daOutra ? daOutra.versao : 0) });
      if (daOutra) {
        vistoDoPainel = { versao: daOutra.versao, codigo: daOutra.codigo };
        ultimoPedido = daOutra.pedido ? daOutra.pedido.id : 0;
      }
    } else {
      var daPrincipal = daOutra || PI.aoVivo.criar();
      atual = Object.assign({}, daPrincipal, { pedido: meu ? meu.pedido : null, versao: Math.max(daPrincipal.versao, meu ? meu.versao : 0) });
    }
    montar();
    raiz.addEventListener('storage', aoArmazenar);
    raiz.addEventListener('message', aoMensagem);
    if (papel === 'painel') { PI.loja.ouvir(function () { if (atual.aberto) { desenharCola(); } }); }
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
