> Convertido de `docs/referencias/Roteiro_Python_Imobiliario.docx` em 2026-11-14. É a fonte de verdade do conteúdo dos slides. Se o grupo mudar o roteiro, atualize este arquivo.

# Python Imobiliário

Roteiro de slides do minicurso de Python do Flash Clip. Para cada slide: o que aparece na tela, o que o ministrante fala e qual é a interação com a plateia.

Versão de 13/11/2026: tema de banco imobiliário, pontuação individual, sem listas. Ministrantes ainda não atribuídos.

## Visão geral

### Tema: o banqueiro digital

A plateia é contratada para criar o banqueiro digital de um jogo de tabuleiro de compra e venda de imóveis, no estilo do Banco Imobiliário. A cada atividade, o dono do jogo pede uma atualização nova e o código vai crescendo. Cada aluno é um jogador: acertar atividades rende dinheiro fictício, e quem terminar a aula mais rico é o Magnata da Liga.

### Como cada atividade funciona

1. **Explicar:** um conceito por vez, com uma analogia do jogo e pouco texto na tela.
2. **Mostrar ao vivo:** um ministrante digita o exemplo no VS Code projetado.
3. **Alunos tentam:** no VS Code do lab ou em um compilador online, com cronômetro na tela.
4. **Enviar:** o aluno copia o código e cola no sistema de envio. O sistema confere e registra a hora.
5. **Ranking e prêmio:** o top 3 aparece na tela, e o 1º lugar leva o prêmio da atividade.

### Regras visuais dos slides

- Uma ideia por slide. No máximo 3 linhas de texto, fora o código.
- Código sempre grande (fonte 28 ou mais), com fundo escuro de editor.
- Identidade visual de tabuleiro: casas coloridas, cartas de propriedade, dados e notas de dinheiro.
- Arte própria do grupo. Não usar o logotipo, o nome estilizado nem as ilustrações oficiais do jogo comercial.
- Sem emojis.
- Todo slide de atividade tem um cronômetro visível.

### Pontuação e prêmios

- **Atividades:** o top 3 de cada atividade ganha R$ 300, R$ 200 e R$ 100 no ranking.
- **Boss:** o top 3 ganha R$ 500, R$ 300 e R$ 100.
- **Prêmio por atividade:** um prêmio pequeno para o 1º de cada uma das 8 atividades. O prêmio aparece na tela na hora, e a entrega física fica para o intervalo e o fim.
- **Sorteio:** no recap e na premiação, a roleta sorteia um prêmio entre todos que acertaram alguma atividade, para quem é mais lento também ter chance.
- **Prêmios maiores:** Magnata da Liga (aluno mais rico no fim da aula) e melhor jogada (solução mais criativa no boss).
- **Opcional:** imprimir notas de dinheiro de brincadeira, com arte própria, e entregar ao top 3 de cada atividade.

### Cronograma

| Tempo | Etapa | Atividade |
|---|---|---|
| BLOCO 1 (80 min) |  |  |
| 0 a 7 | Abertura | Teste de envio no sistema (sem pontos) |
| 7 a 17 | print e comentários | Atividade 1 |
| 17 a 31 | Variáveis e tipos | Atividade 2 |
| 31 a 47 | input e operações | Atividade 3 |
| 47 a 75 | if / elif / else | Atividades 4a e 4b |
| 75 a 80 | Recap e ranking parcial | Sorteio na roleta |
| INTERVALO (5 min) |  |  |
| BLOCO 2 (50 min) |  |  |
| 0 a 23 | Laços for e while | Atividades 5a e 5b |
| 23 a 46 | Boss: o banqueiro final | Desafio final |
| 46 a 50 | Premiação final | Ranking final e prêmios |
| DEPOIS: 10 min de Forms de avaliação e 35 min de coffee break |  |  |

## Bloco 1 (80 min)

### Abertura (0 a 7 min)

Passagem rápida. São 7 slides em 7 minutos: o objetivo é chegar logo ao primeiro código.

#### Slide 1: Capa

- **Na tela:** "Python Imobiliário" e, embaixo, "Minicurso de Python, Liga Flash Clip". Fundo de tabuleiro visto de cima, com arte própria.
- **Fala:** Boas-vindas. "Hoje vocês não vão só assistir. Vão jogar, e quem programar melhor sai daqui milionário."

#### Slide 2: Ministrantes

- **Na tela:** Foto e nome dos 5 ministrantes, cada um como um peão no tabuleiro.
- **Fala:** 15 segundos, só nomes.

#### Slide 3: Regras do jogo

- **Na tela:** Três itens: cada um de vocês é um jogador; acertar uma atividade rende dinheiro (R$ 300 para o 1º, R$ 200 para o 2º, R$ 100 para o 3º); quem terminar mais rico é o Magnata da Liga.
- **Fala:** Avise que o 1º de cada atividade ganha prêmio na hora e que todo mundo que acertar entra nos sorteios.

#### Slide 3b: Nosso compilador

- **Na tela:** Link onecompiler.com/python, "Grátis e sem cadastro.", "Proibido usar o botão AI." e 3 passos: escreva o código no main.py; clique em Run; a saída aparece no Console, e se o programa pedir algo, digite ali e aperte Enter.
- **Fala:** Abra o link no projetor e mostre ao vivo: apague o exemplo, escreva um print, clique em Run. Não precisa fazer Login. Enquanto o programa espera um input, o botão Run vira Stop.
- **Interação:** Todos abrem o link agora. Quem não conseguir levanta a mão antes da primeira atividade.

#### Slide 4: Como enviar suas respostas

- **Na tela:** QR code e link do sistema, mais 3 passos: escreva e teste no compilador; copie o código; cole no sistema e envie.
- **Interação:** Aquecimento sem pontos: todos entram no sistema com o próprio nome e enviam um teste. Assim os problemas de acesso aparecem antes da primeira atividade valendo.

#### Slide 5: O que é um algoritmo?

- **Na tela:** Título "Um turno do jogo" e 4 passos: 1. jogar os dados; 2. andar as casas; 3. ver de quem é a casa; 4. comprar ou pagar aluguel.
- **Fala:** Algoritmo é uma sequência de passos exatos, na ordem certa. O computador é um banqueiro obediente, mas sem imaginação: faz exatamente o que a regra manda. Se pular um passo, o turno trava.

#### Slide 6: Prazer, Python

- **Na tela:** Criado por Guido van Rossum. Lançado em 1991. O nome vem do grupo de comédia Monty Python, não da cobra. Ao lado, foto do Monty Python ao vivo em 2014 (Eduardo Unda-Sanzana, CC BY 2.0, Wikimedia Commons), com o crédito embaixo.
- **Fala:** A curiosidade do nome costuma arrancar risada. Use para quebrar o gelo.

#### Slide 7: Onde o Python é usado

- **Na tela:** Quatro cartas com o nome em cima e um ícone embaixo: inteligência artificial (robô), ciência de dados (gráfico), sites (janela do navegador), automação de tarefas (engrenagem).
- **Fala:** 30 segundos. "É uma das linguagens mais usadas do mundo e uma das mais fáceis de começar."

### print e comentários (7 a 17 min)

Tempo: 3 min de explicação, 5 min para tentar e 2 min de ranking e prêmio.

#### Slide 8: Atualização 1

- **Na tela:** Mensagem do dono do jogo: "Preciso que o banqueiro dê boas-vindas aos jogadores."
- **Fala:** Apresenta a história: a cada atividade, o dono do jogo pede uma atualização.

#### Slide 9: print: a maldição do Hello World

- **Na tela:** O código e a saída lado a lado.
- **Fala:** Reza a lenda que quem começa uma linguagem sem imprimir Hello, World! fica amaldiçoado. Para quebrar a maldição, o banqueiro fala em voz alta: o print mostra na tela o que está dentro dos parênteses e entre aspas.

**Exemplo**

```python
print("Hello, World!")
```

#### Slide 10: Comentários: o caderninho do banqueiro

- **Na tela:** Uma linha começando com #.
- **Fala:** O Python ignora tudo depois do #. Serve para anotar coisas para humanos, como o banqueiro rabiscando no caderninho.

**Exemplo**

```python
# Isto é um comentário. O Python não executa.
```

#### Slide 11: Achou o erro?

- **Na tela:** Duas linhas com erro.
- **Interação:** Ao vivo, o ministrante roda cada linha e mostra a mensagem de erro. A plateia diz o que está errado (sem pontos).
- **Resposta:** A primeira tem P maiúsculo. A segunda está sem aspas.

**Código com erro**

```python
Print("Compre!")
print(Compre!)
```

#### Slide 12: Atividade 1: enunciado

- **Na tela:** Escreva um programa que imprima exatamente estas duas linhas e tenha um comentário no topo. Cronômetro de 5 minutos.
- **Interação:** Alunos fazem no compilador e enviam no sistema.

**Saída esperada**

```text
Bem-vindos ao tabuleiro Flash Clip
Que comecem os negócios!
```

#### Slide 13: Atividade 1: resposta e ranking

- **Na tela:** Gabarito e o top 3 do sistema. Anúncio do prêmio do 1º lugar.

**Gabarito**

```python
# Banqueiro digital da Liga Flash Clip
print("Bem-vindos ao tabuleiro Flash Clip")
print("Que comecem os negócios!")
```

### Variáveis e tipos (17 a 31 min)

Tempo: 5 min de explicação, 7 min para tentar e 2 min de ranking e prêmio.

#### Slide 14: Atualização 2

- **Na tela:** Dono do jogo: "Agora o banqueiro precisa guardar os dados de cada jogador."

#### Slide 15: Variável: o envelope com etiqueta

- **Na tela:** Desenho de um envelope com a etiqueta "saldo" e notas de dinheiro dentro, ao lado do código.
- **Fala:** A variável é o envelope. A etiqueta é o nome dela e o que está dentro é o valor. O sinal de = guarda o valor no envelope. Não é o igual da matemática.

**Exemplo**

```python
saldo = 1500
print(saldo)
```

#### Slide 16: Os 4 tipos da ficha do jogador

- **Na tela:** Quatro cartas, uma por tipo: texto (str) é o nome, sempre entre aspas; inteiro (int) é o saldo; decimal (float) é o aluguel; verdadeiro ou falso (bool) diz se está preso.
- **Fala:** Destaque dois detalhes: decimal usa ponto, não vírgula; True e False começam com letra maiúscula.

**Exemplo**

```python
nome = "Ana"       # str
saldo = 1500       # int
aluguel = 37.5     # float
preso = False      # bool
```

#### Slide 17: Ao vivo: qual é o tipo?

- **Fala:** Mostre o type() e depois compare saldo = 1500 com saldo = "1500". Parecem iguais, mas um é número e o outro é texto. "Guardem isso, vai voltar daqui a pouco."

**Exemplo**

```python
aluguel = 37.5
print(type(aluguel))  # <class 'float'>
 
saldo = "1500"
print(type(saldo))    # <class 'str'>
```

#### Slide 18: Atividade 2: enunciado

- **Na tela:** Crie a ficha do jogador com 4 variáveis: nome "Ana", saldo 1500, aluguel 37.5 e preso falso. Imprima cada uma, nessa ordem. Cronômetro de 7 minutos.
- **Versão fácil:** Um slide extra, mostrado aos 3 minutos, com o esqueleto pela metade.

**Saída esperada**

```text
Ana
1500
37.5
False
```

**Esqueleto (versão fácil)**

```python
nome = "Ana"
saldo = ___
aluguel = ___
preso = ___
print(nome)
print(___)
print(___)
print(___)
```

#### Slide 19: Atividade 2: resposta e ranking

- **Na tela:** Gabarito, top 3 e prêmio.

**Gabarito**

```python
nome = "Ana"
saldo = 1500
aluguel = 37.5
preso = False
print(nome)
print(saldo)
print(aluguel)
print(preso)
```

### input e operações (31 a 47 min)

Tempo: 5 min de explicação, 9 min para tentar e 2 min de ranking e prêmio.

#### Slide 20: Atualização 3

- **Na tela:** Dono do jogo: "Quero digitar o resultado dos dados durante a partida."

#### Slide 21: input: o banqueiro pergunta

- **Fala:** O input faz o programa parar e esperar alguém digitar. O texto entre aspas é a pergunta que aparece na tela.

**Exemplo**

```python
dado = input("Quanto deu o dado? ")
print(dado)
```

#### Slide 22: A pegadinha

- **Interação:** Ao vivo, digite 3 e 4. A tela mostra 34. Pergunte à plateia: "Por que deu 34 e não 7?"
- **Resposta:** O input sempre entrega texto. Texto mais texto junta, não soma. É o caso do saldo = "1500" de antes.

**Código ao vivo**

```python
a = input("Dado 1: ")
b = input("Dado 2: ")
print(a + b)
```

#### Slide 23: int(): o conversor

- **Fala:** O int() transforma o texto em número inteiro. Agora 3 + 4 dá 7.

**Exemplo**

```python
a = int(input("Dado 1: "))
b = int(input("Dado 2: "))
print(a + b)
```

#### Slide 24: Operadores: o caixa do banco

- **Na tela:** Quatro linhas com situações do jogo.
- **Fala:** Destaque que a divisão com / sempre dá decimal.

**Exemplo**

```python
saldo = 1500 + 200     # passou pela partida: 1700
saldo = 1500 - 300     # comprou um terreno: 1200
aluguel = 7 * 10       # aluguel da companhia: 70
parte = 100 / 4        # dividir entre 4: 25.0
```

#### Slide 25: Atividade 3: enunciado

- **Na tela:** Peça o valor dos dois dados. Mostre o total e o aluguel da companhia, que é o total vezes 10. Cronômetro de 9 minutos.
- **Dica:** print("Total dos dados:", total) junta o texto e o número com um espaço.

**Exemplo de execução (digitando 3 e 4)**

```text
Total dos dados: 7
Aluguel da companhia: 70
```

#### Slide 26: Atividade 3: resposta e ranking

- **Na tela:** Gabarito, top 3 e prêmio.

**Gabarito**

```python
dado1 = int(input("Dado 1: "))
dado2 = int(input("Dado 2: "))
total = dado1 + dado2
aluguel = total * 10
print("Total dos dados:", total)
print("Aluguel da companhia:", aluguel)
```

### if / elif / else (47 a 75 min)

Tempo: 7 min de explicação, atividade 4a (5 min para tentar e 2 de prêmio), explicação do elif, atividade 4b (7 para tentar e 2 de prêmio) e 5 min de margem para quem travou.

#### Slide 27: Atualização 4

- **Na tela:** Dono do jogo: "O banqueiro precisa decidir se o jogador pode comprar a propriedade."

#### Slide 28: Comparando valores

- **Na tela:** Tabela com > (maior), < (menor), == (igual), != (diferente), >= (maior ou igual) e <= (menor ou igual). Cada comparação responde True ou False.
- **Fala:** Destaque: um = guarda valor; dois == comparam.

**Exemplo**

```python
print(1500 > 300)    # True
print(4 == 4)        # True
print(200 >= 500)    # False
```

#### Slide 29a: if e else: se e senão

- **Na tela:** Duas cartas: "if = se" (faz uma pergunta; se a resposta for True, roda o bloco do if) e "else = senão" (não pergunta nada; roda quando o if deu False). Embaixo: "Se os dados forem iguais, jogue novamente. Senão, passe a vez." Sem código.
- **Fala:** Antes do código, a ideia. Em português a gente já fala assim: se chover, levo guarda-chuva; senão, vou de boné. O if testa uma condição, aquela que vimos no slide anterior e que responde True ou False. O else é o plano B: não tem condição e só roda quando o if falhou. Sempre roda exatamente um dos dois. Leia a frase de baixo: no próximo slide ela vira código.

#### Slide 29b: if / else: tirou dupla?

- **Na tela:** Diagrama com setas: uma pergunta; se for verdade, vai por um caminho; se não, pelo outro. Código ao lado.
- **Fala:** No jogo, quem tira dois dados iguais joga de novo. Destaque os dois pontos no fim da linha e os 4 espaços de recuo. O recuo diz o que pertence a cada caminho.

**Exemplo**

```python
dado1 = int(input("Dado 1: "))
dado2 = int(input("Dado 2: "))
if dado1 == dado2:
    print("Dupla! Jogue de novo")
else:
    print("Vez do próximo jogador")
```

#### Slide 30: Ao vivo: o erro de recuo

- **Interação:** Rode o exemplo sem os 4 espaços e mostre o IndentationError. A plateia diz o que falta.

**Saída**

```text
  File "main.py", line 4
    print("Dupla! Jogue de novo")
    ^^^^^
IndentationError: expected an indented block after 'if' statement on line 3
```

#### Slide 31: Atividade 4a: enunciado

- **Na tela:** Peça o saldo do jogador e o preço da propriedade. Se o saldo for maior ou igual ao preço, imprima "Compra aprovada". Senão, imprima "Saldo insuficiente". Cronômetro de 5 minutos.

**Testes**

```text
500 e 300  ->  Compra aprovada
100 e 300  ->  Saldo insuficiente
```

#### Slide 32: Atividade 4a: resposta e ranking

- **Na tela:** Gabarito, top 3 e prêmio.

**Gabarito**

```python
saldo = int(input("Seu saldo: "))
preco = int(input("Preço da propriedade: "))
if saldo >= preco:
    print("Compra aprovada")
else:
    print("Saldo insuficiente")
```

#### Slide 33: elif: o terceiro caminho

- **Na tela:** O mesmo diagrama, agora com três saídas: sobra dinheiro, fica zerado, não dá.
- **Fala:** O elif é "senão, se". Ele testa uma segunda condição antes de cair no else.

**Estrutura**

```python
if condicao1:
    ...
elif condicao2:
    ...
else:
    ...
```

#### Slide 34: Atividade 4b: enunciado

- **Na tela:** Atualize o programa: se o saldo for exatamente igual ao preço, avise que o jogador vai ficar zerado. Cronômetro de 7 minutos.

**Testes**

```text
500 e 300  ->  Compra aprovada
300 e 300  ->  Compra aprovada, mas você ficou zerado
100 e 300  ->  Saldo insuficiente
```

#### Slide 35: Atividade 4b: resposta e ranking

- **Na tela:** Gabarito, top 3 e prêmio.

**Gabarito**

```python
saldo = int(input("Seu saldo: "))
preco = int(input("Preço da propriedade: "))
if saldo > preco:
    print("Compra aprovada")
elif saldo == preco:
    print("Compra aprovada, mas você ficou zerado")
else:
    print("Saldo insuficiente")
```

### Recap e intervalo (75 a 80 min)

#### Slide 36: O que o banqueiro já faz

- **Na tela:** Cinco módulos marcados como concluídos: boas-vindas, ficha do jogador, ler os dados, calcular aluguel, decidir a compra.
- **Fala:** "Em 75 minutos vocês construíram um banqueiro que toma decisões."

#### Slide 37: Ranking parcial

- **Na tela:** Os 5 jogadores mais ricos até agora, tirados do sistema.
- **Interação:** Roleta: sorteio de um prêmio entre todos que acertaram alguma atividade.

#### Slide 38: Intervalo

- **Na tela:** Cronômetro de 5 minutos e o teaser: "Na volta, o banqueiro vai jogar rodadas inteiras sozinho."
- **Fala:** Aproveite para entregar os prêmios do Bloco 1.

## Bloco 2 (50 min)

### Laços for e while (0 a 23 min)

Tempo: 6 min de explicação, atividade 5a (6 min para tentar e 2 de prêmio) e atividade 5b (7 para tentar e 2 de prêmio). Os laços são a parte mais difícil para quem nunca programou, por isso ficaram com mais tempo.

#### Slide 39: Atualização 5

- **Na tela:** Dono do jogo: "A partida tem várias rodadas. Ninguém quer escrever o mesmo código toda hora."

#### Slide 40: Do jeito cansativo

- **Na tela:** Cinco prints repetidos, um embaixo do outro.
- **Fala:** "E se a partida durar 50 rodadas?"

**Exemplo**

```python
print("Rodada 1")
print("Rodada 2")
print("Rodada 3")
print("Rodada 4")
print("Rodada 5")
```

#### Slide 41: for: dando voltas no tabuleiro

- **Na tela:** Exemplo com voltas no tabuleiro, para não entregar a resposta da atividade.
- **Fala:** O for repete o bloco para cada número. range(1, 4) gera 1, 2 e 3: o último número não entra.

**Exemplo**

```python
for volta in range(1, 4):
    print("Volta", volta)
```

#### Slide 42: Atividade 5a: enunciado

- **Na tela:** Use um for para imprimir as 5 rodadas da partida. Cronômetro de 6 minutos.

**Saída esperada**

```text
Rodada 1
Rodada 2
Rodada 3
Rodada 4
Rodada 5
```

#### Slide 43: Atividade 5a: resposta e ranking

- **Na tela:** Gabarito, top 3 e prêmio.

**Gabarito**

```python
for rodada in range(1, 6):
    print("Rodada", rodada)
```

#### Slide 44: while: enquanto tiver dinheiro

- **Na tela:** Exemplo de um jogador pagando aluguel até zerar.
- **Fala:** O while repete enquanto a condição for verdadeira. Se esquecer de atualizar a variável, o laço nunca acaba: mostre ao vivo e pare com Ctrl+C.

**Exemplo**

```python
saldo = 300
while saldo > 0:
    print(saldo)
    saldo = saldo - 100
```

#### Slide 45: Atividade 5b: enunciado

- **Na tela:** O jogador foi para a prisão por 3 turnos. Use um while para mostrar os turnos de 3 até 1 e depois imprimir "Você está livre!". Cronômetro de 7 minutos.

**Saída esperada**

```text
Turnos na prisão: 3
Turnos na prisão: 2
Turnos na prisão: 1
Você está livre!
```

#### Slide 46: Atividade 5b: resposta e ranking

- **Na tela:** Gabarito, top 3 e prêmio.

**Gabarito**

```python
turnos = 3
while turnos > 0:
    print("Turnos na prisão:", turnos)
    turnos = turnos - 1
print("Você está livre!")
```

### Boss: o banqueiro final (23 a 46 min)

Tempo: 3 min de enunciado, 15 min para tentar e 5 min de ranking, prêmio maior e gabarito.

#### Slide 47: Pronto para a rodada final?

- **Na tela:** Slide de impacto, com o tabuleiro inteiro.
- **Fala:** "Agora é tudo junto: input, if, laço. Vale R$ 500 para o 1º."

#### Slide 48: Boss: enunciado

- **Na tela:** Quatro passos: 1. pergunte o nome do jogador; o saldo começa em 1500; 2. com um for, jogue 3 rodadas pedindo o preço de uma propriedade; 3. se o saldo der, desconte o preço e imprima "Comprou!"; senão, imprima "Sem dinheiro"; 4. no fim, mostre o saldo e, se tiver 500 ou mais, "Magnata!". Senão, "Cuidado com a falência". Cronômetro de 15 minutos.

**Exemplo de execução (Ana; preços 400, 300 e 900)**

```text
Comprou!
Comprou!
Sem dinheiro
Ana terminou com 800
Magnata!
```

#### Slide 49: Boss: versão com lacunas

- **Na tela:** Mostrado aos 5 minutos para quem travou.

**Esqueleto**

```python
nome = input("Nome do jogador: ")
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
    print("Cuidado com a falência")
```

#### Slide 50: Boss: dicas

- **Na tela:** Mostradas aos 10 minutos: comece pelo laço; o saldo começa em 1500 antes do laço; para descontar, use saldo = saldo - preco.

#### Slide 51: Boss: resposta e ranking

- **Na tela:** Gabarito comentado, top 3, prêmio maior e a melhor jogada (escolhida pelos ministrantes no painel).

**Gabarito**

```python
nome = input("Nome do jogador: ")
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
    print("Cuidado com a falência")
```

### Premiação final (46 a 50 min)

#### Slide 52: Ranking final

- **Na tela:** Os jogadores mais ricos, com o Magnata da Liga em destaque.

#### Slide 53: Prêmios

- **Na tela:** Três momentos: Magnata da Liga, melhor jogada e o sorteio final entre todos que acertaram alguma atividade.
- **Interação:** Chamar os vencedores para a frente. Foto do grupo.

#### Slide 54: Próximos passos

- **Na tela:** Tutorial oficial do Python em português (docs.python.org/pt-br/3/tutorial), o curso de Python do Curso em Vídeo no YouTube e a dica de praticar com desafios curtos.

#### Slide 55: Avaliação

- **Na tela:** QR code do Forms de avaliação e frequência.
- **Fala:** Dar os 10 minutos do Forms antes do coffee break.

#### Slide 56: Obrigado

- **Na tela:** Agradecimento e contatos do grupo.

## Pendências do grupo

- **Ministrantes:** definir quem apresenta cada seção.
- **Prêmios:** 8 pequenos (um por atividade), alguns para os sorteios e 2 maiores (Magnata da Liga e melhor jogada).
- **Dinheiro de brincadeira:** se forem usar notas impressas, criar arte própria, sem copiar as notas do jogo comercial.
- **Sistema de envio:** construir, hospedar e testar no lab com vários computadores ao mesmo tempo.
- **Regras do sistema:** ignorar o texto das perguntas do input na saída; ignorar acentos, maiúsculas e espaços extras ao comparar; limite de 3 tentativas por atividade; painel que mostra o código do top 3.
- **Plano B:** se a rede cair, vale a mão levantada e um ministrante confere o código na tela do aluno.
- **Lab:** conferir se o VS Code com Python está instalado e ter um compilador online de reserva.
- **Forms:** criar o formulário de avaliação e frequência e gerar o QR code.
- **Slides:** montar a identidade visual de tabuleiro com arte própria e aplicar este roteiro.
- **Ensaio:** rodar todos os gabaritos antes da aula e fazer um ensaio cronometrado.
