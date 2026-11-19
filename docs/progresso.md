# Progresso

Diário curto por sessão: feito, pendente, próximo passo.

## 2026-11-14 (sábado), sessão 1

- Feito: PRD em `docs/prd.md`, plano em `docs/plano.md` (aprovado, com o slide 18b no fluxo e no PDF), harness (commit `0441638`), teste de file:// passando no Edge 157 e no Chrome 158 (`docs/decisoes.md`).
- Feito: arquivo Figma "Python Imobiliário - Flash Clip" (https://www.figma.com/design/h79hmQoeENq5ROZwUHMnyV), página "Direções" com A (Tabuleiro de papel), B (Mesa de feltro) e C (Cédula), cada uma com capa, conceito (slide 15) e atividade (slide 25).
- Walter escolheu a Direção A (Tabuleiro de papel).
- Feito: no Figma, coleção de variáveis "Python Imobiliário" (34 variáveis: cores, espaços, raios, bordas, com sintaxe `var(--...)`), 9 estilos de texto, página "Componentes" (Casa, Carta de propriedade, Dado, Nota de dinheiro, Peão, Cronômetro, Bloco de código, Linha do ranking, Card do top 3, Cabeçalho, Faixa de casas, Mensagem do dono) e página "Modelos" com 21 frames, um por layout do contrato.
- Feito: roteiro transcrito para `conteudo/secoes/` (10 arquivos, 57 slides) e `conteudo/config.js`, com `tests/conteudo.test.js`. `python scripts/conferir-gabaritos.py`: 28/28. `npm test`: 13/13.
- Pendente: Walter aprovar os modelos; Walter conferir o duplo clique em `tests/navegador/teste-file.html`; conferência completa do texto das seções contra o roteiro (F03 continua `passa: false`).
- Walter aprovou os modelos e o download das fontes, e conferiu o teste de file:// no Edge dele (tudo OK).

## 2026-11-14 (sábado), sessão 1, continuação

- Feito: fontes OFL em `assets/fontes/` com as licenças; `css/tokens.css` a partir de `get_variable_defs`; integrantes do grupo em `conteudo/config.js` (slides 2 e 56).
- Feito: F01 (palco 16:9, navegação, G + número, ajuda, tela cheia), F02 (18 modelos em HTML/CSS), F03 (conteúdo conferido: 208 trechos contra o roteiro), F04 (realce de Python sem biblioteca). `npm test`: 36/36, 100% de linhas em `js/logica/`. Gabaritos: 28/28.
- Verificado: `scripts/capturar.js` por file:// no Chrome em 1920x1080, 1366x768 e 1024x768 (57 slides cada) e no Edge (amostra), sem erro de console e sem requisição externa; nenhum elemento sai do palco.
- Diferenças em relação ao Figma: código longo usa 30 a 32px (mínimo 28); a resposta com código longo mostra o top 3 em coluna; código e saída lado a lado quando passam de 8 linhas; comentário do editor mais claro (`#ada899`, também no Figma); ilustrações em SVG embutido no JS, não em `assets/svg/`.
- Não verificado: a tecla F (tela cheia) só funciona com tecla real, e o teste automático não a cobre.
- Próximo: F05 cronômetro (TDD), F06 placar e ranking, F07 respostas ligadas ao placar, F08 persistência.
- Walter confirmou a tela cheia (tecla F) no navegador dele.

## 2026-11-14 (sábado), sessão 1, F05 a F08

- Feito: `js/logica/cronometro.js`, `placar.js` e `estado.js` em TDD (66 testes, 100% de linhas). Teclas novas: C inicia ou pausa, M soma 1 minuto, Z zera, S som, L placar.
- Feito: cronômetro ao vivo pelo horário de término (alerta vermelho no último minuto, pisca no fim, pequeno no canto dos slides de apoio, aviso sonoro por Web Audio); painel do placar (tecla L) com jogadores, lista colada de quem acertou, top 3 por atividade, ranking, desfazer, exportar, importar e zerar; slides de resposta e ranking ligados ao placar; tudo salvo no localStorage (`pi:estado:v1`).
- Verificado no navegador embutido: 6 jogadores e top 3 das 8 atividades pela interface; totais e desempate certos nos slides 13, 37, 51 e 52; recarregar mantém placar e cronômetro (diferença de 1 ms); JSON quebrado e inválido recusados com mensagem; importar, zerar e desfazer funcionam. Capturas por file:// sem erro e sem requisição externa.
- Não verificado: o som do aviso, que precisa de alguém ouvindo. Teste: som do notebook ligado, slide 12, tecla C, e esperar os 5 minutos (ou Z e C de novo para recomeçar).
- Próximo: F09 painel do apresentador e sincronia, F10 roleta, F11 QR e ministrantes, F12 PDF; depois `click-path-audit` e `security-reviewer`.

## 2026-11-14 (sábado), sessão 1, F09 a F12

- Walter decidiu: sem QR code nem sistema de envio (ministrantes conferem nas carteiras) e prêmio de chocolate para o 1º lugar. Registrado em `docs/decisoes.md`.
- Feito: `js/logica/cronograma.js` e `roleta.js` em TDD (81 testes, 100% de linhas). Painel do apresentador (`apresentador.html`, tecla P) com slide atual e próximo, fala, interação e resposta, cronômetro, relógio da aula (etapa prevista e adiantado ou atrasado), roleta, melhor jogada e placar. Sincronia pelo estado no localStorage e evento `storage` (contrato, seção 7).
- Feito: roleta (tecla R ou botão do painel) entre quem acertou alguma atividade, sem repetir; gira no slide 37 e aparece por cima do slide 53. PDF pelo Ctrl+P (`css/impressao.css`, `js/ui/impressao.js`).
- Verificado: painel para principal em 1 ms e principal para painel em 78 ms; painel cabe em 1366x768; três sorteios sem repetir; PDF com 57 páginas 16:9 gerado por `node scripts/capturar.js --pdf capturas/python-imobiliario.pdf`; 57 capturas por file:// sem erro e sem requisição externa.
- Não verificado: o PDF página a página (não há renderizador de PDF aqui; o Walter abre o arquivo); o painel aberto por file:// com a tecla P numa janela real (testado em localhost; a técnica de janelas já passou no teste de file://).
- Pendente do grupo: as falas e interações das atividades ainda dizem "enviam no sistema"; ajustar quando o grupo reescrever.
- Próximo: `click-path-audit` e `security-reviewer`; depois F13 animações e F14 README.

## 2026-11-16 (segunda), F13 animações

- Corrigido: validação do placar só por chave própria do config (`constructor` e `__proto__` passavam como atividade), alvo do cronômetro conferido contra `atividades` e `tempos`, limite de id e de slide, nome com caractere de controle ou de direção de texto recusado e `importar` remontando o estado só com os campos do contrato. Os 6 testes que estavam vermelhos passam.
- Feito: `css/animacoes.css` e `js/ui/efeitos.js`. Entrada do slide (200 ms), cartas do top 3 virando do 3º para o 1º, linhas do ranking subindo com o dinheiro contando até o total (no mesmo slide conta do valor anterior), dados rolando quando o cronômetro passa de parado para rodando. A roleta já girava (`roleta-ui.js`). Só anima o que mudou desde o último desenho.
- `prefers-reduced-motion`: CSS sem animação e JS mostra o valor e a face final direto. `scripts/capturar.js` emula movimento reduzido por padrão (PNG nunca no meio de uma animação); `--com-movimento` e `--espera ms` para ver os quadros.
- Verificado por file:// no Chrome headless: 57 capturas sem erro e sem requisição externa; quadros no meio e no fim das animações nos slides 12, 13, 37 e 52; movimento reduzido mostra tudo pronto; 1024x768 sem quebra. `npm test`: 87/87, 100% de linhas.
- Não verificado: fluidez num notebook comum ligado ao projetor (RNF03). Teste: slide 37 ou 52 com placar montado, e slide 12 com a tecla C.
- Skills `motion-foundations`, `make-interfaces-feel-better`, `web-design-guidelines` e `accessibility` não estavam instaladas; usadas `frontend-ui-engineering`, `debugging-and-error-recovery` e `design:accessibility-review`.
- Próximo: F14 README e ajuda de atalhos.

## 2026-11-17 (terça), horários do evento

- Trazida a versão dos amigos (zip com o git): 6 commits por cima de `4951ec4`, por fast-forward, sem conflito. Fotos dos ministrantes copiadas para `assets/fotos/` (fora do git).
- Feito: horários do programa do evento (imagem do Walter): cursos às 14:00 por 80 min, intervalo de 10 min (era 5), retorno de 55 min (era 50; os 5 min a mais foram para a premiação final, 46 a 55), coffee-break às 16:25. `conteudo/config.js`, seções 07 e 10, contrato e tabela do roteiro.
- Feito: cronômetro parado se refaz com o tempo do config quando a duração salva no navegador é antiga.
- Verificado: `npm test` 89/89; gabaritos 28/28; slide 38 em 10:00 por file://, inclusive com estado antigo de 5 min; etapa prevista às 15:20 e 15:29 = Intervalo, 15:30 = Laços, 16:25 = fim do cronograma.
- Atenção: `aula.inicio` agora é 14:00 (evento). Para a aula de hoje às 19:10, trocar para "19:10" em `conteudo/config.js`; só afeta o relógio do painel.

## 2026-11-18 (quarta), anotações da professora e código ao vivo

- Trazido o GitHub (`GabaDevPro/FlashClipPython`, agora o remoto `origin`): a pasta local não tinha remoto e estava 17 commits atrás. O commit dos horários do evento, que só existia aqui, foi reaplicado por cima (conflito no `aoEntrar` do cronômetro resolvido juntando as duas regras).
- Feito (F15): abertura na ordem da professora (nós, linguagem, história, algoritmo, regras, OneCompiler, como mostrar a resposta; renumeração só de 3 a 7b), while do 5b subindo de 1 até 3, slide 22b de concatenação, QR code do Forms no 55 (vendor/qrcode-generator), plano B com 4 bônus (57 a 66, `b1` a `b4` no config). Roteiro, contrato e falas do Enzo e do Walter atualizados (PDFs pelo Word; os antigos em `_para_apagar/falas-2026-11-18`).
- Feito (F16, F17): modo ao vivo. Tecla E abre o editor offline (Skulpt) e tecla O abre o OneCompiler embutido, os dois com o código do slide. O painel espelha os dois, então dá para usar o Windows em Estender: digita-se no notebook e o projetor mostra. Decisões em `docs/decisoes.md` (2026-11-18) e contrato na seção 8.
- Verificado: `npm test` 185/185 (99,8% de linhas); gabaritos 36/36; `tests/skulpt.test.js` roda todos os códigos dos slides no Skulpt com a mesma saída do Python, e o erro do slide 30 sai idêntico; capturas por file:// dos 71 slides em 1920, 1366 e 1024 sem erro e sem requisição externa; no navegador embutido: input, erro com linha marcada, Parar no laço infinito, digitar e responder input pelo painel, OneCompiler com código do slide, Rodar e espelho do painel para o projetor, aviso sem internet. Revisão do security-reviewer sem CRITICAL nem HIGH (MEDIUMs corrigidos).
- Não verificado: ler o QR code com um celular (não há link do Forms ainda); digitar com o mouse dentro do console do OneCompiler embutido (a automação não clica em iframe escalado); duas janelas de verdade com o Windows em Estender no notebook do grupo.
- Próximo: colar o link do Forms em `conteudo/config.js` e ler o QR; ensaiar E e O no notebook com o projetor; F14 (README).

## 2026-11-18 (tarde), só o OneCompiler e cola no painel

- Feito (pedido do Walter): saiu o editor offline (tecla E e Skulpt; arquivos em `_para_apagar/editor-offline-2026-11-18`). O OneCompiler do projetor abre no tema claro e o do painel no escuro; os dois abrem com o último código digitado, com Limpar e Código do slide. O painel ganhou a cola (F18): código do slide, input e saída esperada, com Slide anterior e Próximo slide. Só o Enzo e o Gabriel apresentam; o Walter digita o código ao vivo pelo painel, com o Windows em Estender.
- Verificado: `npm test` 126/126 (100% de linhas em `js/logica/`); gabaritos 36/36; 71 capturas por file:// sem erro e sem requisição externa; no navegador embutido: tema claro no projetor e escuro no painel, cola do 22b com input e saída, Código do slide e Limpar nas duas telas, Rodar no projetor, Próximo slide trocando slide e cola, a linha mais longa (52 caracteres, slide 64) cabendo na cola em 1366x768, aviso sem internet.
- Não verificado: digitar com o mouse e o teclado de verdade dentro do OneCompiler do painel (a automação não entra no iframe; o Walter testou a versão anterior e funcionou).

## 2026-11-18 (noite), modo edição

- Feito (F19, pedido do Walter depois da crítica da professora): tecla E liga o modo edição na janela principal. Clicar num título, linha de texto, item ou carta edita no lugar; código e saída abrem uma caixa. A barra cria slide de texto ou de código, esconde e mostra slides, desfaz um slide ou tudo, restaura a cópia, exporta e importa as alterações num .json. Tudo fica no navegador, por cima de `conteudo/`, e vale no painel e no PDF.
- Lógica em TDD pelo agente tdd-guide (`js/logica/edicao.js`); marcação `data-campo` nos modelos; revisões do security-reviewer e do typescript-reviewer com os HIGH e MEDIUM corrigidos.
- Verificado: `npm test` 172/172 (100% de linhas em `js/logica/`); gabaritos 36/36; 71 capturas por file:// em 1920, 1366 e 1024 sem erro e sem requisição externa; no navegador embutido: título editado na hora e salvo, código pela caixa, carta mapeada certo, slide novo de código depois do 22b, esconder (vai para o vizinho, some da navegação, do painel e do PDF) e mostrar, edição que sobrevive a um redesenho, desfazer só o slide, desfazer tudo, importar, arquivo inválido recusado, restaurar cópia, barra em 1024x768.
- Não verificado: o botão Exportar baixando o arquivo de verdade (não cliquei para não salvar arquivo no computador; a função que monta o conteúdo e o nome está testada); edição com teclado e mouse reais no Chrome por file://.

## 2026-11-19 (quinta), roleta animada

- Feito (pedido do Walter, a roleta estava parada): a roda balança devagar enquanto espera; no sorteio só ela gira (antes o ponteiro girava junto, dentro do mesmo SVG) e desacelera por 5,2 s; a cada fatia que passa, o ponteiro dá um tranco, o nome de um candidato aparece e toca um tique (se o som estiver ligado); no fim, a fatia sorteada acende, as outras apagam, o nome do vencedor entra com um salto, sai confete nas cores do tabuleiro e toca um plim. Só transform e opacity; com movimento reduzido, vai direto ao resultado. Contas do giro em TDD em `js/logica/roleta.js` (`desacelerar`, `fatiaNoPonteiro`, `embaralhar`).
- Verificado: `npm test` 175/175; capturas por file:// dos slides 37 e 53 sem erro; no navegador embutido com 10 candidatos: nomes passando durante o giro, ponteiro parado, revelação com o mesmo nome do estado, fatia acesa, confete se espalhando, sem repetir o vencedor, balanço no slide 37, console sem erros.
- Não verificado: o som do tique e do plim no notebook (o navegador embutido não toca áudio aqui); o sorteio pelo painel anima na principal, mas fica sem som, porque o navegador só libera áudio depois de um gesto na própria janela.
