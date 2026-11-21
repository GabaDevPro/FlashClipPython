PI.secao({
  id: "11-extras",
  titulo: "Plano B: rodada bônus",
  bloco: 2,
  inicioMin: 55,
  fimMin: 55,
  slides: [
    {
      n: 57,
      layout: "atualizacao",
      titulo: "Rodada bônus",
      texto: ["Sobrou tempo? O banqueiro abriu mais quatro rodadas valendo dinheiro."],
      fala: "Só se sobrar tempo. Cada bônus usa um assunto: o 1 pode entrar depois do slide 26, o 2 depois do 35, o 3 e o 4 depois do 46. Para voltar ao roteiro, aperte G, o número do slide e Enter (ex.: G 5 2 Enter para o ranking final)."
    },
    {
      n: 58,
      layout: "enunciado",
      titulo: "Bônus 1: o recibo",
      texto: [
        "Pergunte o nome do jogador e o valor do aluguel.",
        "Monte o recibo juntando os textos com +."
      ],
      codigo: [
        {
          rotulo: "Saída esperada (digitando Ana e 70)",
          linguagem: "text",
          texto: `Recibo: Ana pagou R$ 70`
        }
      ],
      atividade: "b1"
    },
    {
      n: 59,
      layout: "resposta",
      titulo: "Bônus 1: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `nome = input("Nome: ")
aluguel = input("Aluguel: ")
print("Recibo: " + nome + " pagou R$ " + aluguel)`,
          saida: `Recibo: Ana pagou R$ 70`,
          testes: [{ entradas: ["Ana", "70"], saida: `Recibo: Ana pagou R$ 70` }]
        }
      ],
      atividade: "b1",
      fala: "O aluguel veio do input, então já é texto: dá para concatenar direto, sem str()."
    },
    {
      n: 60,
      layout: "conceito",
      titulo: "%: o resto da divisão",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `print(7 % 2)   # sobra 1: ímpar
print(8 % 2)   # sobra 0: par`,
          saida: `1
0`,
          testes: [{}]
        }
      ],
      fala: "O % dá o que sobra da divisão. Se o número dividido por 2 não deixa resto, ele é par."
    },
    {
      n: 61,
      layout: "enunciado",
      titulo: "Bônus 2: par ou ímpar",
      texto: [
        "Leia o valor do dado.",
        `Se for par, imprima "Par: joga de novo!". Senão, imprima "Ímpar: passa a vez."`
      ],
      codigo: [
        {
          rotulo: "Saída esperada (digitando 4)",
          linguagem: "text",
          texto: `Par: joga de novo!`
        }
      ],
      atividade: "b2"
    },
    {
      n: 62,
      layout: "resposta",
      titulo: "Bônus 2: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `dado = int(input("Dado: "))
if dado % 2 == 0:
    print("Par: joga de novo!")
else:
    print("Ímpar: passa a vez.")`,
          saida: `Par: joga de novo!`,
          testes: [
            { entradas: ["4"], saida: `Par: joga de novo!` },
            { entradas: ["3"], saida: `Ímpar: passa a vez.` }
          ]
        }
      ],
      atividade: "b2"
    },
    {
      n: 63,
      layout: "enunciado",
      titulo: "Bônus 3: a tabuada",
      texto: [
        "Leia o valor do aluguel.",
        "Use um for para mostrar a tabuada dele, de 1 a 5."
      ],
      codigo: [
        {
          rotulo: "Saída esperada (digitando 70)",
          linguagem: "text",
          texto: `1 x 70 = 70
2 x 70 = 140
3 x 70 = 210
4 x 70 = 280
5 x 70 = 350`
        }
      ],
      atividade: "b3"
    },
    {
      n: 64,
      layout: "resposta",
      titulo: "Bônus 3: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `aluguel = int(input("Aluguel: "))
for vezes in range(1, 6):
    print(vezes, "x", aluguel, "=", vezes * aluguel)`,
          saida: `1 x 70 = 70
2 x 70 = 140
3 x 70 = 210
4 x 70 = 280
5 x 70 = 350`,
          testes: [{ entradas: ["70"], saida: `1 x 70 = 70
2 x 70 = 140
3 x 70 = 210
4 x 70 = 280
5 x 70 = 350` }]
        }
      ],
      atividade: "b3"
    },
    {
      n: 65,
      layout: "enunciado",
      titulo: "Bônus 4: o terreno",
      texto: [
        "O jogador começa com 0 e ganha 200 a cada turno.",
        "Use um while para repetir até juntar 1000 e conte os turnos."
      ],
      codigo: [
        {
          rotulo: "Saída esperada",
          linguagem: "text",
          texto: `Saldo: 200
Saldo: 400
Saldo: 600
Saldo: 800
Saldo: 1000
Comprou o terreno em 5 turnos!`
        }
      ],
      atividade: "b4"
    },
    {
      n: 66,
      layout: "resposta",
      titulo: "Bônus 4: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `saldo = 0
turnos = 0
while saldo < 1000:
    saldo = saldo + 200
    turnos = turnos + 1
    print("Saldo:", saldo)
print("Comprou o terreno em", turnos, "turnos!")`,
          saida: `Saldo: 200
Saldo: 400
Saldo: 600
Saldo: 800
Saldo: 1000
Comprou o terreno em 5 turnos!`,
          testes: [{}]
        }
      ],
      atividade: "b4",
      fala: "Aqui o while sobe: o saldo cresce 200 por volta e o laço para quando chega em 1000."
    }
  ]
});
