'use strict';

// Carrega conteudo/secoes/*.js num contexto isolado e imprime em JSON os
// blocos de código de cada slide. Usado por scripts/conferir-gabaritos.py.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const PASTA_SECOES = process.argv[2] || path.join(__dirname, '..', 'conteudo', 'secoes');

function carregarSecoes(pasta) {
  const secoes = [];
  const contexto = { PI: { secao: (s) => secoes.push(s) } };
  contexto.window = contexto;
  vm.createContext(contexto);

  const arquivos = fs.existsSync(pasta)
    ? fs.readdirSync(pasta).filter((a) => a.endsWith('.js')).sort()
    : [];
  for (const arquivo of arquivos) {
    const fonte = fs.readFileSync(path.join(pasta, arquivo), 'utf8');
    vm.runInContext(fonte, contexto, { filename: arquivo });
  }
  return secoes;
}

function extrairBlocos(secoes) {
  const blocos = [];
  for (const secao of secoes) {
    for (const slide of secao.slides || []) {
      for (const bloco of slide.codigo || []) {
        blocos.push({
          secao: secao.id,
          slide: slide.n,
          rotulo: bloco.rotulo || '',
          linguagem: bloco.linguagem || 'python',
          texto: bloco.texto || '',
          saida: bloco.saida === undefined ? null : bloco.saida,
          testes: bloco.testes || [],
        });
      }
    }
  }
  return blocos;
}

const secoes = carregarSecoes(PASTA_SECOES);
process.stdout.write(JSON.stringify({ secoes: secoes.length, blocos: extrairBlocos(secoes) }));
