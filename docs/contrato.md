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
| `n` | número ou texto | sim | Número do roteiro (`9`). Slide extra usa texto (`"3b"`, `"18b"`, `"29a"`, `"29b"`, `"30b"`) |
| `layout` | texto | sim | Um dos modelos da seção 3 |
| `titulo` | texto | sim | Título na tela |
| `texto` | lista de textos | não | Até 3 linhas na tela, fora o código |
| `itens` | lista | não | Passos, regras, cartas ou links. Cada item: `{ titulo, texto, rotulo, imagem }` (campos opcionais). `imagem` nas cartas: `"ia"`, `"dados"`, `"sites"` ou `"automacao"` (ícone SVG em `js/ui/modelos.js`) |
| `codigo` | lista de blocos | não | Ver seção 4 |
| `fala` | texto | não | Só no painel do apresentador |
| `interacao` | texto | não | Só no painel |
| `resposta` | texto | não | Só no painel (e no PDF, quando for gabarito) |
| `atividade` | texto | não | Id da atividade em `config.js` (`"1"`, `"4a"`, `"boss"`). Liga cronômetro, top 3 e prêmio |
| `apoio` | booleano | não | Slide de apoio (versão fácil, lacunas, dicas): cronômetro pequeno no canto |
| `ranking` | `"parcial"` ou `"final"` | não | Slides 37 e 52 |
| `roleta` | booleano | não | Slide com sorteio (37 e 53) |
| `link` | texto | não | Chave do link em `config.links` mostrado em texto (`"forms"`) |
| `qr` | texto | não | Chave do link em `config.links` desenhado como QR code ao lado do link (só o slide 55, `"forms"`). Gerado offline por `vendor/qrcode-generator`; link vazio mostra o aviso no lugar |
| `diagrama` | texto | não | `"if-else"` ou `"elif"` |
| `revelarSaida` | booleano | não | Qualquer modelo com código (hoje slides 28, 30 e 30b): na janela principal a saída do código só aparece no primeiro avanço; painel e PDF mostram direto |
| `destaque` | texto | não | Modelo `erro`: frase grande embaixo do código (slide 30: "Indentação!!!"); com `revelarSaida`, aparece no mesmo clique da saída |
| `ilustracao` | texto | não | `"envelope"` (arte ao lado do código) ou `"fantasmas"` (camada decorativa por cima); SVG embutido em `js/ui/modelos.js` |
| `imagem` | texto | não | Modelo `conceito`: caminho de uma foto local (`assets/img/...`) ao lado do texto |
| `credito` | texto | não | Legenda com o crédito da `imagem` (autor e licença) |
| `cronometro` | texto | não | Id de tempo avulso do config (`"intervalo"`) |

## 3. Modelos (`layout`)

`capa`, `ministrantes`, `regras`, `instrucoes`, `algoritmo`, `atualizacao`, `conceito`, `cartas`, `erro`, `enunciado`, `resposta`, `recap`, `ranking`, `intervalo`, `impacto`, `premios`, `proximos`, `encerramento`.

`cartas` cobre os slides 3 e 16 (quatro cartas). `recap` é o slide 36 (módulos como propriedades compradas). `instrucoes` cobre os slides 7 (compilador: link e passos), 7b (como mostrar a resposta) e 55 (Forms, com QR code). A abertura segue a ordem pedida pela professora: capa, ministrantes, onde o Python é usado, história, algoritmo, regras, compilador e como mostrar a resposta. A seção `11-extras` (slides 57 a 66) é o plano B: fica depois do Obrigado, com os bônus `b1` a `b4` no config, e tem a linha "Plano B" de duração zero no cronograma.

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
    "1":    { nome: "Atividade 1",  minutos: 5,  premios: [300, 200, 100], premio: "chocolate" },
    "boss": { nome: "Boss",         minutos: 15, premios: [500, 300, 100], premio: "chocolate" }
  },
  tempos: { intervalo: 10 },
  cronograma: [ { bloco: 1, inicioMin: 0, fimMin: 7, etapa: "Abertura" } ],
  links: { envio: "", forms: "", compilador: "onecompiler.com/python" },
  ministrantes: [ { nome: "Ministrante 1", secao: "Abertura", foto: "", cor: "" } ],
  aula: { inicio: "14:00" }
};
```

`premios` são os pontos em dinheiro fictício do ranking; `premio` é o prêmio físico do 1º lugar (chocolate). Link vazio mostra "link pendente". Foto vazia desenha o peão na cor do ministrante. Os slides `ministrantes` (2) e `encerramento` (56) mostram os nomes de `ministrantes` direto do config, sem repetir na seção.

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
- Exportar gera `placar-AAAA-MM-DD-HHMM.json` com este objeto. Importar valida estrutura, tipos e tamanho (até 200 jogadores, nome até 40 caracteres) antes de trocar o estado. Atividade e alvo do cronômetro só valem se forem chave própria de `atividades` ou `tempos` do config; nome com caractere de controle, largura zero ou direção de texto é recusado; o estado importado é remontado só com os campos desta seção.
- Nomes entram no DOM só por `textContent`.

## 7. Sincronia entre a janela principal e o painel

As duas janelas (`index.html` e `apresentador.html`) leem e escrevem o mesmo estado no localStorage (`pi:estado:v1`). Cada mudança grava o estado inteiro; a outra janela recebe o evento `storage`, valida o JSON com `PI.estado.importar` (o que não passa é ignorado) e redesenha. O teste de file:// mediu 0 a 1 ms entre janelas; no painel, ida e volta com redesenho ficou em 78 ms.

- A tecla P abre o painel com `window.open('apresentador.html')`. O painel também funciona aberto à mão, sem `window.opener`.
- Recarregar qualquer janela não perde nada: o estado está no localStorage.
- Só a janela principal toca o aviso sonoro do cronômetro; a roleta anima só na principal.
- `estado.roleta.ultimo` (`{ id, em }`) marca o último sorteio; a principal anima quando `em` muda.
- `estado.melhorJogada` guarda o id escolhido no painel e aparece no slide 51.

Teclas da janela principal: setas, Page Up/Down, espaço, Home/End, G + número, F, ?, C (cronômetro), M (+1 min), Z (zerar), S (som), L (placar), R (roleta), P (painel). O painel aceita as mesmas, menos F, ? e P.

## 8. Modo ao vivo (tecla O)

Lógica pura em `js/logica/aovivo.js` (`PI.aoVivo`, testada em `tests/logica-aovivo.test.js`); interface em `js/ui/aovivo-ui.js` e `css/aovivo.css`.

- **O que é:** o OneCompiler oficial (`https://onecompiler.com/embed/python`) embutido num iframe, criado só quando a tecla O é apertada. No projetor, tema claro e letra 28; no painel, tema escuro, letra 18 e, ao lado, a cola. Abre com o último código digitado (vazio na primeira vez). Botões: Rodar (no painel, "Rodar no projetor"), Limpar, Código do slide (o primeiro bloco Python do slide atual ou do próximo que tiver) e Fechar (Esc).
- **Cola (só no painel):** os blocos Python do slide atual (`codigosDoSlide`) com realce, o que digitar no `input` (as `entradas` do primeiro teste) e a saída esperada; sem código no slide, mostra o próximo que tem (`proximoComCodigo`) e avisa; embaixo, qual é o código seguinte. Botões Slide anterior e Próximo slide mudam o slide da apresentação.
- **Estado** (`PI.aoVivo.criar()`): `{ aberto, codigo, versao, autor, pedido }`, chave `pi:aovivo:v2`. `normalizar` valida tipos e limites (código até 20.000 caracteres; versão e id de pedido até 1e9) e remonta o objeto.
- **Duas chaves, um dono cada:** a janela principal grava `pi:aovivo:v2` e é quem roda (manda `triggerRun` ao iframe dela); o painel grava `pi:aovivo:v2:painel` com o código e o `pedido` `{ id, acao: 'rodar' }` (`id` = versão + 1). A principal trata cada pedido uma vez, adota abrir/fechar de cada gravação nova do painel e roda o código que veio com o pedido. Fora isso, o código da outra janela só entra se ninguém digitou nesta nos últimos 1,5 s. Limpar e Código do slide valem nas duas na hora. A versão nunca regride (cada janela parte da maior ao recarregar).
- **Mensagens com o iframe:** para ele, com destino `https://onecompiler.com`: `{ eventType: 'populateCode', language: 'python', files: [{ name: 'main.py', content }] }` e `{ eventType: 'triggerRun' }`. Dele: `{ language, files: [{ name, content }], stdin, result, action: 'change' }` a cada mudança (com CRLF); `codigoDaMensagem` só aceita origem `https://onecompiler.com` e `event.source` igual ao iframe, e troca CRLF por LF. Até o iframe devolver o código enviado (eco), a janela reenvia a cada 0,9 s (até 15 vezes) e ignora o resto; depois, eco igual (`mesmoCodigo`) não conta como digitação. O iframe tem `sandbox` (scripts, origem própria, formulários, modais e popups) e `referrerPolicy = no-referrer`.

## 9. Modo edição (tecla E)

Lógica pura em `js/logica/edicao.js` (`PI.edicao`, testada em `tests/logica-edicao.test.js`); interface em `js/ui/edicao-ui.js` e `css/edicao.css`. Os arquivos de `conteudo/` não mudam: as alterações ficam no navegador e são aplicadas por cima deles na janela principal, no painel e no PDF.

- **Ligar e desligar:** a tecla E marca `pi:editando` na sessionStorage da janela principal e recarrega. Só essa janela edita; o painel recarrega sozinho quando as alterações mudam (menos com o OneCompiler aberto). No modo edição, o clique não avança o slide e a saída escondida aparece. Os slides escondidos saem da lista nas duas janelas (o painel e a principal trocam o slide atual pelo índice, então a lista é a mesma), e a barra mostra um botão "Mostrar N" para cada um. Enquanto um texto está em edição no palco, a principal não redesenha o slide.
- **Campos editáveis:** os modelos marcam com `data-campo` o elemento de cada campo: `titulo`, `texto.0` a `texto.2`, `itens.I.titulo`, `itens.I.texto`, `itens.I.rotulo`, `codigo.I.texto`, `codigo.I.saida`, `codigo.I.rotulo` (`PI.pecas.campo`, `opcoes.campos` de `PI.pecas.carta` e `opcoes.indice` de `PI.pecas.blocoCodigo`). Texto se edita no lugar (Enter salva, Esc cancela); código e saída, numa caixa (Ctrl+Enter salva, Tab recua 4 espaços).
- **Estado** (`pi:edicao:v1`): `{ slides: { n: { campos: { caminho: texto }, oculto } }, novos: [{ n, depoisDe, modelo }] }`. `n` em minúsculas; slide novo tem `n` = número do slide de base + `+K` (ex.: `22b+1`) e modelo `texto` ou `codigo`. `normalizar` recusa caminho fora da lista, tipo errado, mais de 40 slides novos, mais de 200 slides alterados e slide novo que depende de outro novo que ainda não apareceu na lista; corta texto em 300 caracteres e código e saída em 4.000 caracteres e 30 linhas. `aplicar` nunca devolve a lista vazia: se tudo estiver escondido, ignora o esconder.
- **Barra:** novo slide de texto ou de código (entra logo depois do atual, na mesma seção), mais uma linha de texto (até 3, nos modelos `conceito`, `enunciado` e `instrucoes`), esconder (vai para o vizinho; não esconde o último slide), mostrar cada escondido, desfazer este slide (num slide comum, só as mudanças dele; no slide novo, apaga ele e os novos criados a partir dele), exportar, importar, desfazer tudo, restaurar cópia e sair. Desfazer, importar e restaurar guardam antes a versão atual em `pi:edicao:v1:anterior`, e restaurar troca as duas (dá para voltar). Título e partes de item não ficam vazios. Estado gravado fora do formato é ignorado e guardado em `pi:edicao:v1:anterior:invalido`.
- **Arquivo exportado:** `alteracoes-slides-AAAA-MM-DD-HHMM.json`, o mesmo objeto do estado. Importar valida com `normalizar` antes de trocar; arquivo fora do formato ou acima de 1 MB é recusado com aviso.
