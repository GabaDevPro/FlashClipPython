PI.secao({
  id: "09-boss",
  titulo: "Boss: o banqueiro final",
  bloco: 2,
  inicioMin: 23,
  fimMin: 46,
  slides: [
    {
      n: 47,
      layout: "impacto",
      titulo: "Pronto para a rodada final?",
      fala: `"Agora é tudo junto: input, if, laço. Vale R$ 500 para o 1º."`
    },
    {
      n: 48,
      layout: "enunciado",
      titulo: "Boss: enunciado",
      itens: [
        { rotulo: "1", texto: "Pergunte o nome do jogador; o saldo começa em 1500." },
        { rotulo: "2", texto: "Com um for, jogue 3 rodadas pedindo o preço de uma propriedade." },
        { rotulo: "3", texto: `Se o saldo der, desconte o preço e imprima "Comprou!"; senão, imprima "Sem dinheiro".` },
        { rotulo: "4", texto: `No fim, mostre o saldo e, se tiver 500 ou mais, "Magnata!". Senão, "Cuidado com a falência".` }
      ],
      codigo: [
        {
          rotulo: "Exemplo de execução (Ana; preços 400, 300 e 900)",
          linguagem: "text",
          texto: `Comprou!
Comprou!
Sem dinheiro
Ana terminou com 800
Magnata!`
        }
      ],
      atividade: "boss"
    },
    {
      n: 49,
      layout: "enunciado",
      titulo: "Boss: versão com lacunas",
      codigo: [
        {
          rotulo: "Esqueleto",
          linguagem: "python",
          texto: `nome = input("Nome do jogador: ")
saldo = ___
for rodada in range(1, ___):
    preco = int(input("Preço da propriedade: "))
    if saldo ___ preco:
        saldo = saldo - ___
        print("Comprou!")
    else:
        print("Sem dinheiro")
print(nome, "terminou com", saldo)
if saldo ___ 500:
    print("Magnata!")
else:
    print("Cuidado com a falência")`
        }
      ],
      atividade: "boss",
      apoio: true,
      interacao: "Mostrado aos 5 minutos para quem travou."
    },
    {
      n: 50,
      layout: "enunciado",
      titulo: "Boss: dicas",
      itens: [
        { texto: "Comece pelo laço." },
        { texto: "O saldo começa em 1500 antes do laço." },
        { texto: "Para descontar, use saldo = saldo - preco." }
      ],
      atividade: "boss",
      apoio: true,
      interacao: "Mostradas aos 10 minutos."
    },
    {
      n: 51,
      layout: "resposta",
      titulo: "Boss: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `nome = input("Nome do jogador: ")
saldo = 1500
for rodada in range(1, 4):
    preco = int(input("Preço da propriedade: "))
    if saldo >= preco:
        saldo = saldo - preco
        print("Comprou!")
    else:
        print("Sem dinheiro")
print(nome, "terminou com", saldo)
if saldo >= 500:
    print("Magnata!")
else:
    print("Cuidado com a falência")`,
          saida: `Comprou!
Comprou!
Sem dinheiro
Ana terminou com 800
Magnata!`,
          testes: [{ entradas: ["Ana", "400", "300", "900"] }]
        }
      ],
      atividade: "boss",
      interacao: "Gabarito comentado, top 3, prêmio maior e a melhor jogada (escolhida pelos ministrantes no painel)."
    }
  ]
});
