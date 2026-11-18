/* Editor de código do modo ao vivo: textarea transparente por cima do realce (PI.realce),
   com números de linha, Tab de 4 espaços, recuo automático depois de ':' e Ctrl+Enter para rodar. */
(function (raiz) {
  'use strict';

  var PI = raiz.PI;
  var P = PI.pecas;
  var RECUO = '    ';

  function inserir(area, texto) {
    area.focus();
    // execCommand mantém o Ctrl+Z do navegador; setRangeText é a reserva.
    if (!document.execCommand('insertText', false, texto)) {
      area.setRangeText(texto, area.selectionStart, area.selectionEnd, 'end');
      area.dispatchEvent(new Event('input'));
    }
  }

  function inicioDaLinha(texto, pos) { return texto.lastIndexOf('\n', pos - 1) + 1; }

  // Tab sem seleção de várias linhas insere 4 espaços; com seleção, recua cada linha.
  // Shift+Tab tira até 4 espaços do começo de cada linha tocada.
  function aoTab(area, voltar) {
    var texto = area.value;
    var variasLinhas = texto.slice(area.selectionStart, area.selectionEnd).indexOf('\n') >= 0;
    if (!voltar && !variasLinhas) { inserir(area, RECUO); return; }
    var ini = inicioDaLinha(texto, area.selectionStart);
    var fim = texto.indexOf('\n', area.selectionEnd);
    if (fim < 0) { fim = texto.length; }
    var bloco = texto.slice(ini, fim);
    var novo = bloco.split('\n').map(function (linha) { return voltar ? linha.replace(/^ {1,4}/, '') : RECUO + linha; }).join('\n');
    if (novo === bloco) { return; }
    area.setSelectionRange(ini, fim);
    inserir(area, novo);
    if (variasLinhas) { area.setSelectionRange(ini, ini + novo.length); }
  }

  function aoEnter(area) {
    var texto = area.value;
    var ini = inicioDaLinha(texto, area.selectionStart);
    var antes = texto.slice(ini, area.selectionStart);
    var recuo = /^ */.exec(antes)[0];
    // Comentário não conta: "# nota:" não abre bloco.
    if (/:\s*$/.test(antes.replace(/#.*$/, ''))) { recuo += RECUO; }
    inserir(area, '\n' + recuo);
  }

  // opcoes: { rotulo, aoMudar(codigo), aoRodar() }
  function criar(opcoes) {
    var linhas = P.el('ol', 'editor__linhas');
    linhas.setAttribute('aria-hidden', 'true');
    var codigo = P.el('code');
    var realce = P.el('pre', 'editor__realce', [codigo]);
    realce.setAttribute('aria-hidden', 'true');
    var faixa = P.el('div', 'editor__faixa-erro');
    faixa.hidden = true;
    var area = P.el('textarea', 'editor__entrada');
    area.spellcheck = false;
    area.setAttribute('autocapitalize', 'off');
    area.setAttribute('autocomplete', 'off');
    area.setAttribute('wrap', 'off');
    area.setAttribute('aria-label', opcoes.rotulo || 'Código Python');
    var caixa = P.el('div', 'editor__area', [faixa, realce, area]);
    var no = P.el('div', 'editor', [linhas, caixa]);
    var linhaErro = null;

    function desenhar() {
      // paraHtml escapa &, <, >, aspas e apóstrofo: o texto digitado nunca vira marcação.
      codigo.innerHTML = PI.realce.paraHtml(area.value) + '\n';
      var total = area.value.split('\n').length;
      if (linhas.childElementCount !== total) {
        var itens = [];
        for (var i = 1; i <= total; i++) { itens.push(P.txt('li', i === linhaErro ? 'editor__linha--erro' : '', i)); }
        linhas.replaceChildren.apply(linhas, itens);
      }
      sincronizarRolagem();
    }

    function sincronizarRolagem() {
      realce.scrollTop = area.scrollTop;
      realce.scrollLeft = area.scrollLeft;
      linhas.scrollTop = area.scrollTop;
      faixa.style.transform = 'translateY(' + (-area.scrollTop) + 'px)';
    }

    area.addEventListener('input', function () {
      desenhar();
      if (opcoes.aoMudar) { opcoes.aoMudar(area.value); }
    });
    area.addEventListener('scroll', sincronizarRolagem);
    area.addEventListener('keydown', function (e) {
      if (e.isComposing) { e.stopPropagation(); return; }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (opcoes.aoRodar) { opcoes.aoRodar(); }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        aoTab(area, e.shiftKey);
      } else if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        aoEnter(area);
      }
      if (e.key !== 'Escape') { e.stopPropagation(); }
    });

    function definir(texto) {
      if (area.value === texto) { return; }
      var focado = document.activeElement === area;
      var pos = area.selectionStart;
      area.value = texto;
      if (focado) { area.setSelectionRange(Math.min(pos, texto.length), Math.min(pos, texto.length)); }
      desenhar();
    }

    function marcarLinha(n) {
      linhaErro = n || null;
      faixa.hidden = !linhaErro;
      if (linhaErro) { faixa.style.setProperty('--linha', String(linhaErro)); }
      linhas.replaceChildren();
      desenhar();
    }

    desenhar();
    return {
      no: no,
      definir: definir,
      valor: function () { return area.value; },
      focar: function () { area.focus(); },
      marcarLinha: marcarLinha
    };
  }

  PI.editor = { criar: criar };
})(window);
