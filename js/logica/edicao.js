/* Modo edição puro: alterações, slides novos e slides ocultos aplicados sobre os slides achatados. */
(function (raiz) {
  'use strict';

  var CHAVE = 'pi:edicao:v1';
  var MAX_TEXTO = 300;
  var MAX_CODIGO = 4000;
  var MAX_LINHAS = 3;
  var MAX_NOVOS = 40;
  // Código com mais linhas que isso estoura o palco de 1920x1080.
  var MAX_LINHAS_CODIGO = 30;
  // Teto de slides alterados num estado: o roteiro tem 71; mais que isso é arquivo estranho.
  var MAX_ALTERADOS = 200;

  var PADRAO_CAMINHO = /^(?:titulo|texto\.[0-2]|itens\.(?:[0-9]|1[0-9])\.(?:titulo|texto|rotulo)|codigo\.[0-9]\.(?:texto|saida|rotulo))$/;
  var PADRAO_CHAVE = /^[0-9a-z]{1,4}(?:\+[0-9]{1,2})?$/;
  var PADRAO_NOVO = /^[0-9a-z]{1,4}\+[0-9]{1,2}$/;
  var SUFIXO_NOVO = /\+[0-9]{1,2}$/;
  var MODELOS = { texto: true, codigo: true };

  function ehObjeto(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function chaveDe(n) { return String(n).toLowerCase(); }
  function clonar(v) { return JSON.parse(JSON.stringify(v)); }

  function caminhoValido(caminho) {
    return typeof caminho === 'string' && PADRAO_CAMINHO.test(caminho);
  }

  function limite(caminho) {
    return /^codigo\.[0-9]\.(?:texto|saida)$/.test(caminho) ? MAX_CODIGO : MAX_TEXTO;
  }

  function ehCampoDeCodigo(caminho) { return /^codigo\.[0-9]\.(?:texto|saida)$/.test(caminho); }

  // Corta pelo limite de caracteres e, no código e na saída, também pelo de linhas.
  function cortar(caminho, texto) {
    var cortado = texto.slice(0, limite(caminho));
    return ehCampoDeCodigo(caminho) ? cortado.split('\n').slice(0, MAX_LINHAS_CODIGO).join('\n') : cortado;
  }

  function criar() { return { slides: {}, novos: [] }; }

  function normalizarCampos(campos) {
    var saida = {};
    var chaves = Object.keys(campos);
    for (var i = 0; i < chaves.length; i += 1) {
      var caminho = chaves[i];
      var valor = campos[caminho];
      if (!caminhoValido(caminho) || typeof valor !== 'string') { return null; }
      saida[caminho] = cortar(caminho, valor);
    }
    return saida;
  }

  function normalizarEntrada(entrada) {
    if (!ehObjeto(entrada)) { return null; }
    var campos = {};
    if (entrada.campos !== undefined) {
      if (!ehObjeto(entrada.campos)) { return null; }
      campos = normalizarCampos(entrada.campos);
      if (campos === null) { return null; }
    }
    if (entrada.oculto !== undefined && typeof entrada.oculto !== 'boolean') { return null; }
    return { campos: campos, oculto: entrada.oculto === true };
  }

  function normalizarSlides(slides) {
    var saida = {};
    var chaves = Object.keys(slides);
    if (chaves.length > MAX_ALTERADOS) { return null; }
    for (var i = 0; i < chaves.length; i += 1) {
      var chave = chaves[i].toLowerCase();
      if (!PADRAO_CHAVE.test(chave)) { return null; }
      var entrada = normalizarEntrada(slides[chaves[i]]);
      if (entrada === null) { return null; }
      if (Object.keys(entrada.campos).length > 0 || entrada.oculto) { saida[chave] = entrada; }
    }
    return saida;
  }

  function normalizarNovos(lista) {
    var saida = [];
    var vistos = {};
    for (var i = 0; i < lista.length; i += 1) {
      var novo = lista[i];
      if (!ehObjeto(novo)) { return null; }
      if (typeof novo.n !== 'string' || typeof novo.depoisDe !== 'string') { return null; }
      var n = novo.n.toLowerCase();
      var depoisDe = novo.depoisDe.toLowerCase();
      if (!PADRAO_NOVO.test(n) || !PADRAO_CHAVE.test(depoisDe) || !MODELOS[novo.modelo] || vistos[n]) { return null; }
      // Novo que vem depois de outro novo só vale se esse outro já apareceu antes na lista.
      if (PADRAO_NOVO.test(depoisDe) && !vistos[depoisDe]) { return null; }
      vistos[n] = true;
      saida.push({ n: n, depoisDe: depoisDe, modelo: novo.modelo });
    }
    return saida;
  }

  function normalizar(valor) {
    var alt = valor;
    if (typeof alt === 'string') {
      try { alt = JSON.parse(alt); } catch (erro) { return null; }
    }
    if (!ehObjeto(alt) || !ehObjeto(alt.slides) || !Array.isArray(alt.novos)) { return null; }
    if (alt.novos.length > MAX_NOVOS) { return null; }
    var slides = normalizarSlides(alt.slides);
    var novos = normalizarNovos(alt.novos);
    if (slides === null || novos === null) { return null; }
    return { slides: slides, novos: novos };
  }

  function comSlide(alt, chave, entrada) {
    var slides = {};
    Object.keys(alt.slides).forEach(function (k) { slides[k] = alt.slides[k]; });
    if (entrada) { slides[chave] = entrada; } else { delete slides[chave]; }
    return { slides: slides, novos: alt.novos };
  }

  function comCampo(alt, n, caminho, valor) {
    if (!caminhoValido(caminho)) { return alt; }
    var chave = chaveDe(n);
    var atual = alt.slides[chave] || { campos: {}, oculto: false };
    var campos = {};
    Object.keys(atual.campos).forEach(function (k) { campos[k] = atual.campos[k]; });
    var texto = valor === null || valor === undefined ? '' : String(valor);
    campos[caminho] = cortar(caminho, texto);
    return comSlide(alt, chave, { campos: campos, oculto: atual.oculto });
  }

  function comOculto(alt, n, oculto) {
    var chave = chaveDe(n);
    var atual = alt.slides[chave] || { campos: {}, oculto: false };
    var marcado = oculto === true;
    if (!marcado && Object.keys(atual.campos).length === 0) { return comSlide(alt, chave, null); }
    return comSlide(alt, chave, { campos: atual.campos, oculto: marcado });
  }

  // Num slide comum, tira só as mudanças dele. Num slide novo, tira o slide e, em cascata, os
  // novos criados a partir dele.
  function semAlteracoes(alt, n) {
    var removidos = {};
    var fila = [chaveDe(n)];
    var novos = alt.novos;
    var i;
    var ehNovo = novos.some(function (novo) { return novo.n === fila[0]; });
    if (!ehNovo) { return comSlide(alt, fila[0], null); }
    while (fila.length > 0) {
      var atual = fila.shift();
      removidos[atual] = true;
      for (i = 0; i < novos.length; i += 1) {
        if (novos[i].depoisDe === atual && !removidos[novos[i].n]) { fila.push(novos[i].n); }
      }
    }
    var slides = {};
    Object.keys(alt.slides).forEach(function (k) {
      if (!removidos[k]) { slides[k] = alt.slides[k]; }
    });
    return {
      slides: slides,
      novos: novos.filter(function (novo) { return !removidos[novo.n]; })
    };
  }

  function comNovo(alt, depoisDe, modelo) {
    if (!MODELOS[modelo] || alt.novos.length >= MAX_NOVOS) { return { alt: alt, n: null }; }
    var ancora = chaveDe(depoisDe);
    var base = ancora.replace(SUFIXO_NOVO, '');
    var k = 1;
    while (alt.novos.some(function (novo) { return novo.n === base + '+' + k; })) { k += 1; }
    var n = base + '+' + k;
    return {
      alt: { slides: alt.slides, novos: alt.novos.concat([{ n: n, depoisDe: ancora, modelo: modelo }]) },
      n: n
    };
  }

  function contar(alt) {
    var total = Object.keys(alt.slides).length;
    return total + alt.novos.filter(function (novo) { return !alt.slides[novo.n]; }).length;
  }

  function modeloNovo(modelo) {
    if (modelo === 'texto') {
      return { layout: 'conceito', titulo: 'Novo slide', texto: ['Escreva aqui.'] };
    }
    if (modelo === 'codigo') {
      return {
        layout: 'conceito', titulo: 'Novo slide',
        codigo: [{ rotulo: 'Exemplo', linguagem: 'python', texto: 'print("Olá")', saida: 'Olá' }]
      };
    }
    return null;
  }

  function inserirNovos(slides, novos) {
    var lista = slides.slice();
    novos.forEach(function (novo) {
      var modelo = modeloNovo(novo.modelo);
      if (!modelo) { return; }
      var pos = -1;
      for (var i = 0; i < lista.length; i += 1) {
        if (chaveDe(lista[i].n) === novo.depoisDe) { pos = i; break; }
      }
      if (pos < 0) { return; }
      var ancora = lista[pos];
      var slide = Object.assign({}, modelo, {
        n: novo.n, novo: true,
        secaoId: ancora.secaoId, secaoTitulo: ancora.secaoTitulo, bloco: ancora.bloco
      });
      lista.splice(pos + 1, 0, slide);
    });
    return lista;
  }

  function gravarCampo(slide, caminho, valor) {
    var partes = caminho.split('.');
    if (partes[0] === 'titulo') { slide.titulo = valor; return; }
    var indice = Number(partes[1]);
    if (partes[0] === 'texto') {
      var texto = Array.isArray(slide.texto) ? slide.texto : [];
      while (texto.length <= indice) { texto.push(''); }
      texto[indice] = valor;
      slide.texto = texto;
      return;
    }
    var lista = slide[partes[0]];
    if (Array.isArray(lista) && ehObjeto(lista[indice])) { lista[indice][partes[2]] = valor; }
  }

  function aplicarEntrada(slide, entrada) {
    var copia = clonar(slide);
    Object.keys(entrada.campos).forEach(function (caminho) {
      if (caminhoValido(caminho)) { gravarCampo(copia, caminho, entrada.campos[caminho]); }
    });
    if (entrada.oculto === true) { copia.oculto = true; }
    return copia;
  }

  // Nunca devolve a apresentação vazia: se tudo estiver escondido, o esconder é ignorado.
  function aplicar(slides, alt, opcoes) {
    var incluir = !!opcoes && opcoes.incluirOcultos === true;
    var todos = inserirNovos(slides, alt.novos).map(function (slide) {
      var entrada = alt.slides[chaveDe(slide.n)];
      return entrada ? aplicarEntrada(slide, entrada) : Object.assign({}, slide);
    });
    var visiveis = todos.filter(function (slide) { return incluir || slide.oculto !== true; });
    return (visiveis.length ? visiveis : todos).map(function (slide, i) { return Object.assign({}, slide, { indice: i }); });
  }

  function valorDe(slide, caminho) {
    if (!ehObjeto(slide) || !caminhoValido(caminho)) { return ''; }
    var atual = slide;
    var partes = caminho.split('.');
    for (var i = 0; i < partes.length; i += 1) {
      if (atual === null || typeof atual !== 'object') { return ''; }
      atual = atual[partes[i]];
    }
    return typeof atual === 'string' ? atual : '';
  }

  function exportar(alt) { return JSON.stringify(alt, null, 2); }

  function doisDigitos(n) { return (n < 10 ? '0' : '') + n; }

  function nomeArquivo(data) {
    return 'alteracoes-slides-' + data.getFullYear() + '-' + doisDigitos(data.getMonth() + 1) + '-' +
      doisDigitos(data.getDate()) + '-' + doisDigitos(data.getHours()) + doisDigitos(data.getMinutes()) + '.json';
  }

  var api = {
    CHAVE: CHAVE, MAX_TEXTO: MAX_TEXTO, MAX_CODIGO: MAX_CODIGO, MAX_LINHAS: MAX_LINHAS, MAX_NOVOS: MAX_NOVOS,
    MAX_LINHAS_CODIGO: MAX_LINHAS_CODIGO, MAX_ALTERADOS: MAX_ALTERADOS,
    criar: criar, caminhoValido: caminhoValido, limite: limite, normalizar: normalizar,
    comCampo: comCampo, comOculto: comOculto, semAlteracoes: semAlteracoes, comNovo: comNovo,
    contar: contar, modeloNovo: modeloNovo, aplicar: aplicar, valorDe: valorDe,
    exportar: exportar, nomeArquivo: nomeArquivo
  };

  raiz.PI = raiz.PI || {};
  raiz.PI.edicao = api;
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
