PI.secao({
  id: "05-condicionais",
  titulo: "if / elif / else",
  bloco: 1,
  inicioMin: 47,
  fimMin: 75,
  slides: [
    {
      n: 27,
      layout: "atualizacao",
      titulo: "Atualização 4",
      texto: ["O banqueiro precisa decidir se o jogador pode comprar a propriedade."]
    },
    {
      n: 28,
      layout: "conceito",
      titulo: "Comparando valores",
      texto: ["Cada comparação responde True ou False."],
      itens: [
        { rotulo: ">", texto: "maior" },
        { rotulo: "<", texto: "menor" },
        { rotulo: "==", texto: "igual" },
        { rotulo: "!=", texto: "diferente" },
        { rotulo: ">=", texto: "maior ou igual" },
        { rotulo: "<=", texto: "menor ou igual" }
      ],
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `print(1500 > 300)
print(4 == 4)
print(200 >= 500)`,
          saida: `True
True
False`,
          testes: [{}]
        }
      ],
      revelarSaida: true,
      fala: "Destaque: um = guarda valor; dois == comparam."
    },
    {
      n: "29a",
      layout: "cartas",
      titulo: "if e else: se e senão",
      itens: [
        { titulo: "if = se", texto: "Faz uma pergunta. Se a resposta for True, roda o bloco do if." },
        { titulo: "else = senão", texto: "Não pergunta nada. Roda quando o if deu False." }
      ],
      texto: ["Se os dados forem iguais, jogue novamente. Senão, passe a vez."],
      fala: "Antes do código, a ideia. Em português a gente já fala assim: se chover, levo guarda-chuva; senão, vou de boné. O if testa uma condição, aquela que vimos no slide anterior e que responde True ou False. O else é o plano B: não tem condição e só roda quando o if falhou. Sempre roda exatamente um dos dois. Leia a frase de baixo: no próximo slide ela vira código."
    },
    {
      n: "29b",
      layout: "conceito",
      titulo: "if / else: tirou dupla?",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `dado1 = int(input("Dado 1: "))
dado2 = int(input("Dado 2: "))
if dado1 == dado2:
    print("Dupla! Jogue de novo")
else:
    print("Vez do próximo jogador")`,
          testes: [
            { entradas: ["3", "3"], saida: `Dupla! Jogue de novo` },
            { entradas: ["3", "4"], saida: `Vez do próximo jogador` }
          ]
        }
      ],
      diagrama: "if-else",
      fala: "No jogo, quem tira dois dados iguais joga de novo. Destaque os dois pontos no fim da linha e os 4 espaços de recuo. O recuo diz o que pertence a cada caminho."
    },
    {
      n: 30,
      layout: "erro",
      titulo: "Onde está o erro?",
      destaque: "Indentação!!!",
      codigo: [
        {
          rotulo: "Sem o recuo",
          linguagem: "python",
          texto: `dado1 = int(input("Dado 1: "))
dado2 = int(input("Dado 2: "))
if dado1 == dado2:
print("Dupla! Jogue de novo")
else:
print("Vez do próximo jogador")`,
          saida: `  File "main.py", line 4
    print("Dupla! Jogue de novo")
    ^^^^^
IndentationError: expected an indented block after 'if' statement on line 3`,
          testes: [{ erro: "IndentationError" }]
        }
      ],
      revelarSaida: true,
      interacao: "Rode o exemplo sem os 4 espaços e mostre o IndentationError. A plateia diz o que falta."
    },
    {
      n: "30b",
      layout: "conceito",
      titulo: "Indentação: o recuo manda",
      texto: [
        "Depois dos dois pontos, o bloco vai 4 espaços para dentro.",
        "Tudo no mesmo recuo faz parte do mesmo bloco.",
        "Voltou para a margem? Saiu do if e roda sempre."
      ],
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `dado1 = 3
dado2 = 3
if dado1 == dado2:
    print("Dupla!")
    print("Jogue de novo")
else:
    print("Passe a vez")
print("Fim do turno")`,
          saida: `Dupla!
Jogue de novo
Fim do turno`,
          testes: [{}]
        }
      ],
      revelarSaida: true,
      fala: "Logo depois do erro: o Python não usa chaves nem \"fim\", ele usa o recuo. Tudo que está 4 espaços para dentro depois dos dois pontos pertence ao if ou ao else. Mostre as duas linhas recuadas do if: as duas rodam juntas. A última linha voltou para a margem, então está fora do if e do else e roda sempre. Pergunte antes de revelar: o que sai na tela? Dica: o compilador costuma recuar sozinho depois dos dois pontos; não misture Tab com espaço."
    },
    {
      n: 31,
      layout: "enunciado",
      titulo: "Atividade 4a: enunciado",
      texto: [
        "Peça o saldo do jogador e o preço da propriedade.",
        `Se o saldo for maior ou igual ao preço, imprima "Compra aprovada".`,
        `Senão, imprima "Saldo insuficiente".`
      ],
      codigo: [
        {
          rotulo: "Testes",
          linguagem: "text",
          texto: `500 e 300  ->  Compra aprovada
100 e 300  ->  Saldo insuficiente`
        }
      ],
      atividade: "4a"
    },
    {
      n: 32,
      layout: "resposta",
      titulo: "Atividade 4a: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `saldo = int(input("Seu saldo: "))
preco = int(input("Preço da propriedade: "))
if saldo >= preco:
    print("Compra aprovada")
else:
    print("Saldo insuficiente")`,
          testes: [
            { entradas: ["500", "300"], saida: `Compra aprovada` },
            { entradas: ["100", "300"], saida: `Saldo insuficiente` }
          ]
        }
      ],
      atividade: "4a"
    },
    {
      n: 33,
      layout: "conceito",
      titulo: "elif: o terceiro caminho",
      itens: [
        { texto: "Sobra dinheiro" },
        { texto: "Fica zerado" },
        { texto: "Não dá" }
      ],
      codigo: [
        {
          rotulo: "Estrutura",
          linguagem: "python",
          texto: `if condicao1:
    ...
elif condicao2:
    ...
else:
    ...`
        }
      ],
      diagrama: "elif",
      fala: `O elif é "senão, se". Ele testa uma segunda condição antes de cair no else.`
    },
    {
      n: 34,
      layout: "enunciado",
      titulo: "Atividade 4b: enunciado",
      texto: ["Atualize o programa: se o saldo for exatamente igual ao preço, avise que o jogador vai ficar zerado."],
      codigo: [
        {
          rotulo: "Testes",
          linguagem: "text",
          texto: `500 e 300  ->  Compra aprovada
300 e 300  ->  Compra aprovada, mas você ficou zerado
100 e 300  ->  Saldo insuficiente`
        }
      ],
      atividade: "4b"
    },
    {
      n: 35,
      layout: "resposta",
      titulo: "Atividade 4b: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `saldo = int(input("Seu saldo: "))
preco = int(input("Preço da propriedade: "))
if saldo > preco:
    print("Compra aprovada")
elif saldo == preco:
    print("Compra aprovada, mas você ficou zerado")
else:
    print("Saldo insuficiente")`,
          testes: [
            { entradas: ["500", "300"], saida: `Compra aprovada` },
            { entradas: ["300", "300"], saida: `Compra aprovada, mas você ficou zerado` },
            { entradas: ["100", "300"], saida: `Saldo insuficiente` }
          ]
        }
      ],
      atividade: "4b"
    }
  ]
});
