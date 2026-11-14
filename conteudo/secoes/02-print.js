PI.secao({
  id: "02-print",
  titulo: "print e comentários",
  bloco: 1,
  inicioMin: 7,
  fimMin: 17,
  slides: [
    {
      n: 8,
      layout: "atualizacao",
      titulo: "Atualização 1",
      texto: ["Preciso que o banqueiro dê boas-vindas aos jogadores."],
      fala: "Apresenta a história: a cada atividade, o dono do jogo pede uma atualização."
    },
    {
      n: 9,
      layout: "conceito",
      titulo: "print: o banqueiro anuncia",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `print("Passou pelo ponto de partida!")`,
          saida: `Passou pelo ponto de partida!`,
          testes: [{ saida: `Passou pelo ponto de partida!` }]
        }
      ],
      fala: "O print é o banqueiro falando em voz alta: o que está dentro dos parênteses e entre aspas aparece na tela."
    },
    {
      n: 10,
      layout: "conceito",
      titulo: "Comentários: o caderninho do banqueiro",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `# Isto é um comentário. O Python não executa.`,
          testes: [{ saida: "" }]
        }
      ],
      fala: "O Python ignora tudo depois do #. Serve para anotar coisas para humanos, como o banqueiro rabiscando no caderninho."
    },
    {
      n: 11,
      layout: "erro",
      titulo: "Achou o erro?",
      codigo: [
        {
          rotulo: "Código com erro",
          linguagem: "python",
          texto: `Print("Compre!")
print(Compre!)`,
          testes: [{ erro: ["NameError", "SyntaxError"], porLinha: true }]
        }
      ],
      interacao: "Ao vivo, o ministrante roda cada linha e mostra a mensagem de erro. A plateia diz o que está errado (sem pontos).",
      resposta: "A primeira tem P maiúsculo. A segunda está sem aspas."
    },
    {
      n: 12,
      layout: "enunciado",
      titulo: "Atividade 1: enunciado",
      texto: ["Escreva um programa que imprima exatamente estas duas linhas e tenha um comentário no topo."],
      codigo: [
        {
          rotulo: "Saída esperada",
          linguagem: "text",
          texto: `Bem-vindos ao tabuleiro Flash Clip
Que comecem os negócios!`
        }
      ],
      atividade: "1",
      interacao: "Alunos fazem no compilador e enviam no sistema."
    },
    {
      n: 13,
      layout: "resposta",
      titulo: "Atividade 1: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `# Banqueiro digital da Liga Flash Clip
print("Bem-vindos ao tabuleiro Flash Clip")
print("Que comecem os negócios!")`,
          saida: `Bem-vindos ao tabuleiro Flash Clip
Que comecem os negócios!`,
          testes: [{}]
        }
      ],
      atividade: "1"
    }
  ]
});
