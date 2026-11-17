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
      n: "3b",
      layout: "instrucoes",
      titulo: "Nosso compilador",
      texto: ["Grátis e sem cadastro.", "Proibido usar o botão AI."],
      link: "compilador",
      itens: [
        { rotulo: "1", texto: "Escreva o código no main.py." },
        { rotulo: "2", texto: "Clique em Run." },
        { rotulo: "3", texto: "A saída aparece no Console. Pediu algo? Digite ali e aperte Enter." }
      ],
      fala: "Abra o link no projetor e mostre ao vivo: apague o exemplo, escreva um print, clique em Run. Não precisa fazer Login. Enquanto o programa espera um input, o botão Run vira Stop.",
      interacao: "Todos abrem o link agora. Quem não conseguir levanta a mão antes da primeira atividade."
    },
    {
      n: 4,
      layout: "instrucoes",
      titulo: "Como mostrar sua resposta",
      itens: [
        { rotulo: "1", texto: "Escreva e teste no compilador." },
        { rotulo: "2", texto: "Terminou? Levante a mão." },
        { rotulo: "3", texto: "Um ministrante confere o código na sua tela." }
      ],
      interacao: "Aquecimento sem pontos: todos abrem o compilador e rodam um print de teste. Assim os problemas de acesso aparecem antes da primeira atividade valendo. Sem sistema de envio: os ministrantes passam nas carteiras e anotam a ordem de quem terminou."
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
      imagem: "assets/img/monty-python.jpg",
      credito: "Monty Python ao vivo em 2014. Foto: Eduardo Unda-Sanzana, CC BY 2.0",
      fala: "A curiosidade do nome costuma arrancar risada. Use para quebrar o gelo."
    },
    {
      n: 7,
      layout: "cartas",
      titulo: "Onde o Python é usado",
      itens: [
        { titulo: "Inteligência artificial", imagem: "ia" },
        { titulo: "Ciência de dados", imagem: "dados" },
        { titulo: "Sites", imagem: "sites" },
        { titulo: "Automação de tarefas", imagem: "automacao" }
      ],
      fala: `30 segundos. "É uma das linguagens mais usadas do mundo e uma das mais fáceis de começar."`
    }
  ]
});
