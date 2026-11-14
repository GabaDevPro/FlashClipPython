PI.secao({
  id: "03-variaveis",
  titulo: "Variáveis e tipos",
  bloco: 1,
  inicioMin: 17,
  fimMin: 31,
  slides: [
    {
      n: 14,
      layout: "atualizacao",
      titulo: "Atualização 2",
      texto: ["Agora o banqueiro precisa guardar os dados de cada jogador."]
    },
    {
      n: 15,
      layout: "conceito",
      titulo: "Variável: o envelope com etiqueta",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `saldo = 1500
print(saldo)`,
          saida: `1500`,
          testes: [{ saida: `1500` }]
        }
      ],
      ilustracao: "envelope",
      fala: "A variável é o envelope. A etiqueta é o nome dela e o que está dentro é o valor. O sinal de = guarda o valor no envelope. Não é o igual da matemática."
    },
    {
      n: 16,
      layout: "cartas",
      titulo: "Os 4 tipos da ficha do jogador",
      itens: [
        { rotulo: "str", titulo: "texto", texto: "o nome, sempre entre aspas" },
        { rotulo: "int", titulo: "inteiro", texto: "o saldo" },
        { rotulo: "float", titulo: "decimal", texto: "o aluguel" },
        { rotulo: "bool", titulo: "verdadeiro ou falso", texto: "diz se está preso" }
      ],
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `nome = "Ana"       # str
saldo = 1500       # int
aluguel = 37.5     # float
preso = False      # bool`,
          testes: [{ saida: "" }]
        }
      ],
      fala: "Destaque dois detalhes: decimal usa ponto, não vírgula; True e False começam com letra maiúscula."
    },
    {
      n: 17,
      layout: "conceito",
      titulo: "Ao vivo: qual é o tipo?",
      codigo: [
        {
          rotulo: "Exemplo",
          linguagem: "python",
          texto: `aluguel = 37.5
print(type(aluguel))  # <class 'float'>

saldo = "1500"
print(type(saldo))    # <class 'str'>`,
          saida: `<class 'float'>
<class 'str'>`,
          testes: [{}]
        }
      ],
      fala: `Mostre o type() e depois compare saldo = 1500 com saldo = "1500". Parecem iguais, mas um é número e o outro é texto. "Guardem isso, vai voltar daqui a pouco."`
    },
    {
      n: 18,
      layout: "enunciado",
      titulo: "Atividade 2: enunciado",
      texto: [
        `Crie a ficha do jogador com 4 variáveis: nome "Ana", saldo 1500, aluguel 37.5 e preso falso.`,
        "Imprima cada uma, nessa ordem."
      ],
      codigo: [
        {
          rotulo: "Saída esperada",
          linguagem: "text",
          texto: `Ana
1500
37.5
False`
        }
      ],
      atividade: "2",
      interacao: "Versão fácil: um slide extra, mostrado aos 3 minutos, com o esqueleto pela metade."
    },
    {
      n: "18b",
      layout: "enunciado",
      titulo: "Atividade 2: versão fácil",
      codigo: [
        {
          rotulo: "Esqueleto",
          linguagem: "python",
          texto: `nome = "Ana"
saldo = ___
aluguel = ___
preso = ___
print(nome)
print(___)
print(___)
print(___)`
        }
      ],
      atividade: "2",
      apoio: true
    },
    {
      n: 19,
      layout: "resposta",
      titulo: "Atividade 2: resposta e ranking",
      codigo: [
        {
          rotulo: "Gabarito",
          linguagem: "python",
          texto: `nome = "Ana"
saldo = 1500
aluguel = 37.5
preso = False
print(nome)
print(saldo)
print(aluguel)
print(preso)`,
          saida: `Ana
1500
37.5
False`,
          testes: [{}]
        }
      ],
      atividade: "2"
    }
  ]
});
