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
