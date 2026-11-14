PI.secao({
  id: "08-lacos",
  titulo: "Laços for e while",
  bloco: 2,
  inicioMin: 0,
  fimMin: 23,
  slides: [
    {
      n: 39,
      layout: "atualizacao",
      titulo: "Atualização 5",
      texto: ["A partida tem várias rodadas. Ninguém quer escrever o mesmo código toda hora."]
    },
    {
      n: 40,
      layout: "conceito",
      titulo: "Do jeito cansativo",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `print("Rodada 1")
print("Rodada 2")
print("Rodada 3")
print("Rodada 4")
print("Rodada 5")`,
          saida: `Rodada 1
Rodada 2
Rodada 3
Rodada 4
Rodada 5`,
          testes: [{}]
        }
      ],
      fala: `"E se a partida durar 50 rodadas?"`
    },
    {
      n: 41,
      layout: "conceito",
      titulo: "for: dando voltas no tabuleiro",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `for volta in range(1, 4):
    print("Volta", volta)`,
          saida: `Volta 1
Volta 2
Volta 3`,
          testes: [{}]
        }
      ],
      fala: "O for repete o bloco para cada número. range(1, 4) gera 1, 2 e 3: o último número não entra."
    },
    {
      n: 42,
      layout: "enunciado",
      titulo: "Atividade 5a: enunciado",
      texto: ["Use um for para imprimir as 5 rodadas da partida."],
      codigo: [
        {
          rotulo: "Saída esperada",
          linguagem: "text",
          texto: `Rodada 1
Rodada 2
Rodada 3
Rodada 4
Rodada 5`
        }
      ],
      atividade: "5a"
    },
    {
      n: 43,
      layout: "resposta",
      titulo: "Atividade 5a: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `for rodada in range(1, 6):
    print("Rodada", rodada)`,
          saida: `Rodada 1
Rodada 2
Rodada 3
Rodada 4
Rodada 5`,
          testes: [{}]
        }
      ],
      atividade: "5a"
    },
    {
      n: 44,
      layout: "conceito",
      titulo: "while: enquanto tiver dinheiro",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `saldo = 300
while saldo > 0:
    print(saldo)
    saldo = saldo - 100`,
          saida: `300
200
100`,
          testes: [{}]
        }
      ],
      fala: "O while repete enquanto a condição for verdadeira. Se esquecer de atualizar a variável, o laço nunca acaba: mostre ao vivo e pare com Ctrl+C."
    },
    {
      n: 45,
      layout: "enunciado",
      titulo: "Atividade 5b: enunciado",
      texto: [
        "O jogador foi para a prisão por 3 turnos.",
        `Use um while para mostrar os turnos de 3 até 1 e depois imprimir "Você está livre!".`
      ],
      codigo: [
        {
          rotulo: "Saída esperada",
          linguagem: "text",
          texto: `Turnos na prisão: 3
Turnos na prisão: 2
Turnos na prisão: 1
Você está livre!`
        }
      ],
      atividade: "5b"
    },
    {
      n: 46,
      layout: "resposta",
      titulo: "Atividade 5b: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `turnos = 3
while turnos > 0:
    print("Turnos na prisão:", turnos)
    turnos = turnos - 1
print("Você está livre!")`,
          saida: `Turnos na prisão: 3
Turnos na prisão: 2
Turnos na prisão: 1
Você está livre!`,
          testes: [{}]
        }
      ],
      atividade: "5b"
    }
  ]
});
