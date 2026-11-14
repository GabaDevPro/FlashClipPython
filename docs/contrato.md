# Contrato

Formato do conteúdo, do estado e das mensagens entre janelas. Toda mudança de contrato atualiza este arquivo no mesmo commit.

## 1. Seção (`conteudo/secoes/NN-nome.js`)

Um arquivo por seção do roteiro, carregado por `<script src>` no `index.html` e no `apresentador.html`, na ordem do número.

```js
PI.secao({
  id: "02-print",
  titulo: "print e comentários",
  bloco: 1,                 // 1 ou 2 (intervalo entre eles)
  inicioMin: 7,             // minuto de início dentro do bloco (cronograma)
  fimMin: 17,
  slides: [ /* slides, na ordem */ ]
});
```

Regras do arquivo: só objetos literais e template strings sem `${}`. Nada de lógica. O texto vem do roteiro sem reescrita.

## 2. Slide

| Campo | Tipo | Obrigatório | Uso |
|---|---|---|---|
| `n` | número ou texto | sim | Número do roteiro (`9`). Slide de apoio extra usa texto (`"18b"`) |
| `layout` | texto | sim | Um dos modelos da seção 3 |
| `titulo` | texto | sim | Título na tela |
| `texto` | lista de textos | não | Até 3 linhas na tela, fora o código |
| `itens` | lista | não | Passos, regras, cartas ou links. Cada item: `{ titulo, texto, rotulo }` (campos opcionais) |
| `codigo` | lista de blocos | não | Ver seção 4 |
| `fala` | texto | não | Só no painel do apresentador |
| `interacao` | texto | não | Só no painel |
| `resposta` | texto | não | Só no painel (e no PDF, quando for gabarito) |
| `atividade` | texto | não | Id da atividade em `config.js` (`"1"`, `"4a"`, `"boss"`). Liga cronômetro, top 3 e prêmio |
| `apoio` | booleano | não | Slide de apoio (versão fácil, lacunas, dicas): cronômetro pequeno no canto |
| `ranking` | `"parcial"` ou `"final"` | não | Slides 37 e 52 |
| `roleta` | booleano | não | Slide com sorteio (37 e 53) |
| `qr` | texto | não | Chave do link em `config.links` (`"envio"`, `"forms"`) |
| `diagrama` | texto | não | `"if-else"` ou `"elif"` |
| `ilustracao` | texto | não | Nome do SVG em `assets/svg/` sem extensão |
| `cronometro` | texto | não | Id de tempo avulso do config (`"intervalo"`) |

## 3. Modelos (`layout`)

`capa`, `ministrantes`, `regras`, `qr`, `algoritmo`, `atualizacao`, `conceito`, `cartas`, `erro`, `enunciado`, `resposta`, `recap`, `ranking`, `intervalo`, `impacto`, `premios`, `proximos`, `encerramento`.

`cartas` cobre os slides 7 e 16 (quatro cartas). `recap` é o slide 36 (módulos como propriedades compradas). `qr` cobre os slides 4 e 55.

## 4. Bloco de código

```js
{
  rotulo: "Gabarito",            // texto acima do editor
  linguagem: "python",           // "python" ou "text"
  texto: `print("Olá")`,         // código exato do roteiro, recuo de 4 espaços
  saida: `Olá`,                  // painel "Saída" na tela (opcional)
  testes: [                      // opcional; lido por scripts/conferir-gabaritos.py
    { entradas: ["3", "4"], saida: `Total dos dados: 7\nAluguel da companhia: 70` },
    { erro: ["NameError", "SyntaxError"], porLinha: true }
  ]
}
```

- `testes[].entradas`: o que se digita em cada `input`, na ordem. O texto da pergunta do `input` não aparece na saída conferida.
- `testes[].saida`: saída esperada. Sem esse campo, vale a `saida` do bloco. Espaços no fim de linha e linhas vazias no fim são ignorados.
- `testes[].erro`: nome do erro esperado (`NameError`, `SyntaxError`, `IndentationError`). Com `porLinha: true`, cada linha não vazia roda separada; `erro` pode ser uma lista com o erro de cada linha.
- Blocos com `___` ou `...` (esqueletos) e blocos `text` não têm `testes`.

## 5. Config (`conteudo/config.js`)

```js
PI.config = {
  titulo: "Python Imobiliário",
  atividades: {
    "1":    { nome: "Atividade 1",  minutos: 5,  premios: [300, 200, 100], premio: "" },
    "boss": { nome: "Boss",         minutos: 15, premios: [500, 300, 100], premio: "" }
  },
  tempos: { intervalo: 5 },
  cronograma: [ { bloco: 1, inicioMin: 0, fimMin: 7, etapa: "Abertura" } ],
  links: { envio: "", forms: "" },
  ministrantes: [ { nome: "Ministrante 1", secao: "Abertura", foto: "", cor: "" } ],
  aula: { inicio: "19:10" }
};
```

Link vazio mostra "link pendente". Foto vazia desenha o peão na cor do ministrante. Os slides `ministrantes` (2) e `encerramento` (56) mostram os nomes de `ministrantes` direto do config, sem repetir na seção.

## 6. Estado (localStorage, chave `pi:estado:v1`)

```js
{
  versao: 1,
  slide: 0,                        // índice na lista de slides
  jogadores: [ { id: "j1", nome: "Ana", acertou: true, ordem: 1 } ],
  resultados: { "1": ["j1", "j3", "j2"] },   // top 3 por atividade, em ordem
  cronometro: {
    alvo: "1",                     // id da atividade ou do tempo avulso
    duracaoMs: 300000,
    rodando: false,
    terminaEm: null,               // horário (ms) em que acaba, quando rodando
    restanteMs: 300000             // quando pausado
  },
  roleta: { semRepetir: true, sorteados: ["j3"] },
  melhorJogada: null,              // id do jogador
  som: true
}
```

- Funções de `js/logica/` recebem o estado e devolvem um novo, sem mutação.
- O restante do cronômetro rodando é sempre `terminaEm - agora`.
- Exportar gera `placar-AAAA-MM-DD-HHMM.json` com este objeto. Importar valida estrutura, tipos e tamanho (até 200 jogadores, nome até 40 caracteres) antes de trocar o estado.
- Nomes entram no DOM só por `textContent`.

## 7. Mensagens entre janelas

A janela principal (`index.html`) é a dona do estado. O painel (`apresentador.html`) envia comandos e desenha o estado que recebe.

Técnica (teste de 2026-11-14 em `docs/decisoes.md`): `window.open` + `postMessage(msg, "*")`. Em file:// `event.origin` é `"null"`, então quem recebe confere `event.source` e o formato. O painel manda `pi:ola` a cada 1 s para a principal recarregada reaprender a janela. Sem `window.opener`, o painel usa o plano B: comandos na chave `pi:comando` do localStorage e estado pelo evento `storage`.

| Mensagem | Sentido | Formato |
|---|---|---|
| Olá | painel para principal | `{ tipo: "pi:ola", versao: 1 }` |
| Estado | principal para painel | `{ tipo: "pi:estado", versao: 1, estado }` |
| Comando | painel para principal | `{ tipo: "pi:comando", versao: 1, comando, dados }` |

Comandos: `ir` (`{ slide }`), `proximo`, `anterior`, `cronometro` (`{ acao: "iniciar" | "pausar" | "mais1" | "zerar" }`), `jogador` (`{ acao: "adicionar" | "renomear" | "remover" | "acertou", id, nome }`), `resultado` (`{ atividade, top3 }`), `roleta` (`{ acao: "girar" | "semRepetir" | "limpar" }`), `melhorJogada` (`{ id }`), `som` (`{ ligado }`).

Quem recebe confere a origem (janela conhecida) e o formato. Mensagem fora do contrato é ignorada.
