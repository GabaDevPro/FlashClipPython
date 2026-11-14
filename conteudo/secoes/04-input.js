PI.secao({
  id: "04-input",
  titulo: "input e operações",
  bloco: 1,
  inicioMin: 31,
  fimMin: 47,
  slides: [
    {
      n: 20,
      layout: "atualizacao",
      titulo: "Atualização 3",
      texto: ["Quero digitar o resultado dos dados durante a partida."]
    },
    {
      n: 21,
      layout: "conceito",
      titulo: "input: o banqueiro pergunta",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `dado = input("Quanto deu o dado? ")
print(dado)`,
          saida: `3`,
          testes: [{ entradas: ["3"], saida: `3` }]
        }
      ],
      fala: "O input faz o programa parar e esperar alguém digitar. O texto entre aspas é a pergunta que aparece na tela."
    },
    {
      n: 22,
      layout: "conceito",
      titulo: "A pegadinha",
      codigo: [
        {
          rotulo: "Código ao vivo",
          linguagem: "python",
          texto: `a = input("Dado 1: ")
b = input("Dado 2: ")
print(a + b)`,
          saida: `34`,
          testes: [{ entradas: ["3", "4"], saida: `34` }]
        }
      ],
      interacao: `Ao vivo, digite 3 e 4. A tela mostra 34. Pergunte à plateia: "Por que deu 34 e não 7?"`,
      resposta: `O input sempre entrega texto. Texto mais texto junta, não soma. É o caso do saldo = "1500" de antes.`
    },
    {
      n: 23,
      layout: "conceito",
      titulo: "int(): o conversor",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `a = int(input("Dado 1: "))
b = int(input("Dado 2: "))
print(a + b)`,
          saida: `7`,
          testes: [{ entradas: ["3", "4"], saida: `7` }]
        }
      ],
      fala: "O int() transforma o texto em número inteiro. Agora 3 + 4 dá 7."
    },
    {
      n: 24,
      layout: "conceito",
      titulo: "Operadores: o caixa do banco",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `saldo = 1500 + 200     # passou pela partida: 1700
saldo = 1500 - 300     # comprou um terreno: 1200
aluguel = 7 * 10       # aluguel da companhia: 70
parte = 100 / 4        # dividir entre 4: 25.0`,
          testes: [{ saida: "" }]
        }
      ],
      fala: "Destaque que a divisão com / sempre dá decimal."
    },
    {
      n: 25,
      layout: "enunciado",
      titulo: "Atividade 3: enunciado",
      texto: [
        "Peça o valor dos dois dados.",
        "Mostre o total e o aluguel da companhia, que é o total vezes 10.",
        `Dica: print("Total dos dados:", total) junta o texto e o número com um espaço.`
      ],
      codigo: [
        {
          rotulo: "Exemplo de execução (digitando 3 e 4)",
          linguagem: "text",
          texto: `Total dos dados: 7
Aluguel da companhia: 70`
        }
      ],
      atividade: "3"
    },
    {
      n: 26,
      layout: "resposta",
      titulo: "Atividade 3: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `dado1 = int(input("Dado 1: "))
dado2 = int(input("Dado 2: "))
total = dado1 + dado2
aluguel = total * 10
print("Total dos dados:", total)
print("Aluguel da companhia:", aluguel)`,
          saida: `Total dos dados: 7
Aluguel da companhia: 70`,
          testes: [{ entradas: ["3", "4"] }]
        }
      ],
      atividade: "3"
    }
  ]
});
