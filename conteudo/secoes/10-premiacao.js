PI.secao({
  id: "10-premiacao",
  titulo: "Premiação final",
  bloco: 2,
  inicioMin: 46,
  fimMin: 50,
  slides: [
    {
      n: 52,
      layout: "ranking",
      titulo: "Ranking final",
      ranking: "final"
    },
    {
      n: 53,
      layout: "premios",
      titulo: "Prêmios",
      itens: [
        { titulo: "Magnata da Liga" },
        { titulo: "Melhor jogada" },
        { titulo: "Sorteio final", texto: "entre todos que acertaram alguma atividade" }
      ],
      roleta: true,
      interacao: "Chamar os vencedores para a frente. Foto do grupo."
    },
    {
      n: 54,
      layout: "proximos",
      titulo: "Próximos passos",
      itens: [
        { titulo: "Tutorial oficial do Python em português", texto: "docs.python.org/pt-br/3/tutorial" },
        { titulo: "Curso de Python do Curso em Vídeo", texto: "YouTube" },
        { titulo: "Pratique com desafios curtos" }
      ]
    },
    {
      n: 55,
      layout: "qr",
      titulo: "Avaliação",
      texto: ["Avaliação e frequência"],
      qr: "forms",
      fala: "Dar os 10 minutos do Forms antes do coffee break."
    },
    {
      n: 56,
      layout: "encerramento",
      titulo: "Obrigado"
    }
  ]
});
