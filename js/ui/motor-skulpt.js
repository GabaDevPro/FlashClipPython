/* Motor offline do editor ao vivo: roda Python no próprio navegador com o Skulpt (vendor/skulpt).
   Sem rede: os módulos vêm de skulpt-stdlib.js, e só os da lista branca (PI.aoVivo.moduloPermitido)
   podem ser importados. Limite: operação nativa longa (sum(range(10**10))) não para no botão Parar. */
(function (raiz) {
  'use strict';

  // De quanto em quanto tempo (ms) o programa devolve a vez ao navegador: mantém a página
  // respondendo e deixa o botão Parar cortar um laço infinito.
  var DEVOLVER_A_VEZ_MS = 50;
  var PARADO = { parado: true };
  var atual = null;
  var fimDaAnterior = Promise.resolve({});

  function disponivel() {
    return !!(raiz.Sk && raiz.Sk.misceval && raiz.Sk.builtinFiles);
  }

  function lerModulo(nome) {
    var arquivos = raiz.Sk.builtinFiles.files;
    if (!raiz.PI.aoVivo.moduloPermitido(nome) || !Object.prototype.hasOwnProperty.call(arquivos, nome)) {
      // Formato que o Skulpt transforma em "ImportError: No module named ...".
      throw "File not found: '" + nome + "'";
    }
    return arquivos[nome];
  }

  function textoDoErro(erro) {
    if (erro && typeof erro.toString === 'function') { return String(erro.toString()); }
    return String(erro);
  }

  // ganchos.aoEscrever(texto) recebe o que o print escreve.
  // ganchos.aoPedirEntrada(pergunta) devolve uma Promise com o texto digitado.
  // Resolve sempre (nunca rejeita) com {} (terminou), { erro: 'Tipo: msg on line N' } ou { parado: true }.
  // O Skulpt é um só para a página: a rodada nova espera a anterior parar de vez antes de
  // reconfigurá-lo, senão a anterior ainda roda uma fatia e escreve na saída da nova.
  function rodar(codigo, ganchos) {
    if (!disponivel()) {
      console.error('vendor/skulpt não carregou: o editor offline não roda código.');
      return Promise.resolve({ erro: 'SystemError: o motor offline (vendor/skulpt) não carregou' });
    }
    parar();
    var esta = { parar: false, rejeitarEntrada: null };
    atual = esta;
    var fim = fimDaAnterior.then(function () {
      return esta.parar ? { parado: true } : executar(esta, codigo, ganchos);
    }).then(function (resultado) {
      if (atual === esta) { atual = null; }
      return resultado;
    });
    fimDaAnterior = fim;
    return fim;
  }

  function executar(esta, codigo, ganchos) {
    var Sk = raiz.Sk;
    try {
      configurar(Sk, esta, ganchos);
    } catch (erro) {
      console.error('Falha ao configurar o Skulpt:', erro);
      return Promise.resolve({ erro: 'SystemError: ' + textoDoErro(erro) });
    }
    var verificarParada = { '*': function () { if (esta.parar) { throw PARADO; } } };
    return Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody('<stdin>', false, codigo, true);
    }, verificarParada).then(function () {
      return esta.parar ? { parado: true } : {};
    }, function (erro) {
      if (esta.parar || erro === PARADO) { return { parado: true }; }
      return { erro: textoDoErro(erro) };
    });
  }

  function configurar(Sk, esta, ganchos) {
    Sk.configure({
      output: function (texto) { if (atual === esta) { ganchos.aoEscrever(String(texto)); } },
      read: lerModulo,
      __future__: Sk.python3,
      inputfunTakesPrompt: true,
      inputfun: function (pergunta) {
        return new Promise(function (resolver, rejeitar) {
          esta.rejeitarEntrada = rejeitar;
          ganchos.aoPedirEntrada(pergunta === undefined ? '' : String(pergunta)).then(resolver, rejeitar);
        });
      },
      yieldLimit: DEVOLVER_A_VEZ_MS,
      killableWhile: true,
      killableFor: true
    });
  }

  function parar() {
    if (!atual) { return; }
    atual.parar = true;
    if (atual.rejeitarEntrada) { atual.rejeitarEntrada(PARADO); }
  }

  function rodando() { return atual !== null; }

  raiz.PI = raiz.PI || {};
  raiz.PI.motorSkulpt = { disponivel: disponivel, rodar: rodar, parar: parar, rodando: rodando };
})(window);
