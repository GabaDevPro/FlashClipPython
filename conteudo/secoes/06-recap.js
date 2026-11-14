PI.secao({
  id: "06-recap",
  titulo: "Recap e ranking parcial",
  bloco: 1,
  inicioMin: 75,
  fimMin: 80,
  slides: [
    {
      n: 36,
      layout: "recap",
      titulo: "O que o banqueiro já faz",
      itens: [
        { texto: "Boas-vindas" },
        { texto: "Ficha do jogador" },
        { texto: "Ler os dados" },
        { texto: "Calcular aluguel" },
        { texto: "Decidir a compra" }
      ],
      fala: `"Em 75 minutos vocês construíram um banqueiro que toma decisões."`
    },
    {
      n: 37,
      layout: "ranking",
      titulo: "Ranking parcial",
      ranking: "parcial",
      roleta: true,
      interacao: "Roleta: sorteio de um prêmio entre todos que acertaram alguma atividade."
    }
  ]
});
