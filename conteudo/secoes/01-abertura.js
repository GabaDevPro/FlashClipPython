PI.secao({
  id: "01-abertura",
  titulo: "Abertura",
  bloco: 1,
  inicioMin: 0,
  fimMin: 7,
  slides: [
    {
      n: 1,
      layout: "capa",
      titulo: "Python Imobiliário",
      texto: ["Minicurso de Python, Liga Flash Clip"],
      fala: `Boas-vindas. "Hoje vocês não vão só assistir. Vão jogar, e quem programar melhor sai daqui milionário."`
    },
    {
      n: 2,
      layout: "ministrantes",
      titulo: "Ministrantes",
      fala: "15 segundos, só nomes."
    },
    {
      n: 3,
      layout: "regras",
      titulo: "Regras do jogo",
      itens: [
        { texto: "Cada um de vocês é um jogador." },
        { texto: "Acertar uma atividade rende dinheiro (R$ 300 para o 1º, R$ 200 para o 2º, R$ 100 para o 3º)." },
        { texto: "Quem terminar mais rico é o Magnata da Liga." }
      ],
      fala: "Avise que o 1º de cada atividade ganha prêmio na hora e que todo mundo que acertar entra nos sorteios."
    },
    {
      n: 4,
      layout: "qr",
      titulo: "Como enviar suas respostas",
      itens: [
        { rotulo: "1", texto: "Escreva e teste no compilador." },
        { rotulo: "2", texto: "Copie o código." },
        { rotulo: "3", texto: "Cole no sistema e envie." }
      ],
      qr: "envio",
      interacao: "Aquecimento sem pontos: todos entram no sistema com o próprio nome e enviam um teste. Assim os problemas de acesso aparecem antes da primeira atividade valendo."
    },
    {
      n: 5,
      layout: "algoritmo",
      titulo: "Um turno do jogo",
      texto: ["O que é um algoritmo?"],
      itens: [
        { rotulo: "1", texto: "Jogar os dados." },
        { rotulo: "2", texto: "Andar as casas." },
        { rotulo: "3", texto: "Ver de quem é a casa." },
        { rotulo: "4", texto: "Comprar ou pagar aluguel." }
      ],
      fala: "Algoritmo é uma sequência de passos exatos, na ordem certa. O computador é um banqueiro obediente, mas sem imaginação: faz exatamente o que a regra manda. Se pular um passo, o turno trava."
    },
    {
      n: 6,
      layout: "conceito",
      titulo: "Prazer, Python",
      texto: [
        "Criado por Guido van Rossum.",
        "Lançado em 1991.",
        "O nome vem do grupo de comédia Monty Python, não da cobra."
      ],
      fala: "A curiosidade do nome costuma arrancar risada. Use para quebrar o gelo."
    },
    {
      n: 7,
      layout: "cartas",
      titulo: "Onde o Python é usado",
      itens: [
        { titulo: "Inteligência artificial" },
        { titulo: "Ciência de dados" },
        { titulo: "Sites" },
        { titulo: "Automação de tarefas" }
      ],
      fala: `30 segundos. "É uma das linguagens mais usadas do mundo e uma das mais fáceis de começar."`
    }
  ]
});
