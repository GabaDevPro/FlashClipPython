# Prompt Mestre: Python Imobiliário (apresentação interativa do Flash Clip)

Gerado em 2026-11-14 pela skill `/prompt-arquiteto`. Abra uma sessão do Claude Code nesta pasta (Opus 5.5, esforço high) e peça: "leia docs/prompt-mestre.md e siga".

<contexto>
Usuário: Walter, estudante da Ulbra, turma de Paradigmas de Linguagens de Programação (PLP 3N, 2026/2, professora Fernanda Pereira Gomes). O grupo dele (5 pessoas) ministra o minicurso de Python do evento FLASHCLIP 2026/2. O roteiro do minicurso, escrito pelo grupo, se chama "Python Imobiliário": a plateia iniciante constrói o banqueiro digital de um jogo de tabuleiro de compra e venda de imóveis, ganha dinheiro fictício acertando atividades cronometradas, e quem terminar mais rico é o Magnata da Liga.

Objetivo deste projeto: trocar o slide convencional (PPTX, Canva) por uma apresentação em HTML, CSS e JavaScript que roda offline no notebook do grupo ligado ao projetor e faz o que slide comum não faz: cronômetro por atividade, placar somado, ranking, roleta de sorteio e painel do apresentador.

Quem desenvolve: só o Walter com o Claude, no computador dele, do início ao fim. Os colegas são ministrantes e ensaiam, mas não participam do desenvolvimento em nenhuma fase. Por isso as skills, agentes e comandos ECC instalados no computador do Walter estão disponíveis em todas as sessões e podem ser citados no `CLAUDE.md`. O código vai para um repositório privado no GitHub para o grupo ter acesso (ver, baixar e abrir a apresentação em outro notebook).

Tipo: D (trabalho acadêmico) com entregável estático offline (próximo do tipo A, sem login nem backend).

Prazos:
- 17/11 (terça), 19:10 às 20:30: apresentação do minicurso em sala. Precisa estar completa e ensaiada.
- 24/11: apresentação das correções pedidas pela professora.
- 05/12: evento FLASHCLIP.

Fontes de verdade:
- `docs/roteiro.md`: conteúdo dos 56 slides (texto da tela, fala, interação, código, gabaritos, cronograma). Convertido do .docx do grupo.
- `docs/referencias/evento-flashclip-2026-2.pdf`: regras da professora (do básico ao intermediário, conceitos iniciais de algoritmos, 3 horas, entrega dos slides no AULA, nota em grupo com avaliação individual de domínio do conteúdo).
- `docs/referencias/Roteiro_Python_Imobiliario.docx`: original do roteiro.

Pendências do grupo que não bloqueiam o código: confirmar com a professora que HTML + PDF é aceito e se pode usar IA no trabalho; definir os 5 ministrantes; links do sistema de envio e do Forms; decidir o corte do roteiro (135 min) para os 80 min da aula de 17/11.
</contexto>

<prd>
# PRD: Python Imobiliário

## Problema e objetivo
O minicurso tem 8 atividades cronometradas, um ranking em dinheiro fictício e sorteios. PPTX e Canva não cronometram, não somam pontos e não sorteiam. O objetivo é uma apresentação em HTML que roda offline no notebook do projetor, conduz os 56 slides do roteiro, controla tempo, placar e prêmios, tem acabamento visual à altura de um bom modelo do Canva e fica num repositório privado que o grupo acessa.

## Público
- Ministrantes (5): operam pelo teclado ou pelo passador de slides.
- Plateia iniciante: lê no projetor, do fundo da sala.
- Colegas do grupo: são ministrantes; acessam o repositório para baixar e abrir a apresentação, sem desenvolver.
- Professora: recebe o PDF no AULA.

## Casos de uso
- UC1: o ministrante avança e volta slides com o passador, pula para um slide pelo número e entra em tela cheia.
- UC2: o ministrante inicia o cronômetro de uma atividade; a plateia vê a contagem grande; no fim, aviso visual e sonoro.
- UC3: o ministrante registra o top 3 da atividade; o slide de resposta mostra o top 3 e o prêmio; o ranking soma o dinheiro.
- UC4: no recap e na premiação, o ministrante gira a roleta entre quem acertou alguma atividade.
- UC5: o ministrante abre o painel do apresentador no notebook (segunda tela) com a fala, o próximo slide e o relógio da aula; o projetor mostra só o slide.
- UC6: o Walter troca o texto de um slide editando só o arquivo da seção, sem mexer no motor.
- UC7: o grupo gera o PDF para a entrega no AULA.

## Requisitos funcionais
- RF01 Navegação: setas, PageUp/PageDown (passador), espaço, Home/End e clique. F liga a tela cheia, G + número pula de slide, ? mostra os atalhos.
- RF02 Conteúdo: os 56 slides do roteiro, na ordem, com texto, código, fala, interação e resposta vindos de `conteudo/secoes/NN-nome.js`, um arquivo por seção do roteiro. Editar um slide não exige mexer no código do motor.
- RF03 Layouts (modelos): capa, ministrantes (peões), regras, envio com QR code, algoritmo em passos, "Atualização N" (mensagem do dono do jogo), conceito com código e saída, tipos (quatro cartas), achou o erro, enunciado de atividade, resposta com gabarito e top 3, ranking (parcial e final), intervalo, impacto (boss), prêmios, próximos passos e encerramento.
- RF04 Código Python com realce de sintaxe, fonte equivalente a 28px ou mais num palco de 1920x1080, fundo escuro de editor e recuo de 4 espaços visível.
- RF05 Cronômetro de atividade com tempos de `conteudo/config.js` (atividades 1, 2, 3, 4a, 4b, 5a, 5b e boss: 5, 7, 9, 5, 7, 6, 7 e 15 min; intervalo de 5): iniciar, pausar, +1 min e zerar por tecla e clique; cor de alerta no último minuto; aviso sonoro no fim (Web Audio, sem arquivo de som), com opção de silenciar. Continua contando quando o ministrante vai para os slides de apoio (versão fácil, lacunas, dicas), onde aparece pequeno no canto. Conta pelo relógio (horário de término), sem acumular erro, e sobrevive a recarregar a página.
- RF06 Placar: cadastro de jogadores (nome), registro do 1º, 2º e 3º de cada atividade (R$ 300, 200 e 100; boss R$ 500, 300 e 100), desfazer e corrigir. O teste de envio da abertura não pontua.
- RF07 Ranking: cada slide de resposta mostra o top 3 da atividade e o prêmio do 1º (texto no config); o ranking parcial mostra os 5 mais ricos; o final destaca o Magnata da Liga. Desempate: mais 1ºs lugares; persistindo, ordem de cadastro.
- RF08 Roleta de sorteio entre os jogadores marcados como "acertou alguma atividade" (marcação com um clique ou lista de nomes colada), com opção de não repetir vencedor. Usada no ranking parcial (slide 37) e na premiação (slide 53).
- RF09 Painel do apresentador em segunda janela (tecla P): slide atual e próximo, fala, interação e resposta do roteiro, cronômetro, relógio da aula (hora, etapa prevista pelo cronograma, adiantado ou atrasado) e os controles do placar e da roleta. As duas janelas ficam sincronizadas nos dois sentidos.
- RF10 Persistência: placar, jogadores e cronômetro salvos no navegador; recarregar ou fechar não perde nada. Exportar e importar o placar em JSON (backup) e "zerar partida" com confirmação.
- RF11 QR codes gerados offline a partir dos links do config (sistema de envio no slide 4, Forms no slide 55). Sem link, o slide mostra "link pendente".
- RF12 Ministrantes no config (nome, seção, foto opcional). Sem foto, avatar desenhado na cor do peão.
- RF13 PDF pelo Ctrl+P: uma página 16:9 por slide, sem controles, com os gabaritos; slides de ranking mostram "ranking ao vivo".
- RF14 Identidade de tabuleiro com arte própria (casas coloridas, cartas de propriedade, dados, notas de dinheiro, peões), desenhada no Figma e exportada como SVG. Nada do logotipo, do nome estilizado ou das ilustrações do jogo comercial. Nenhum emoji.
- RF15 Animações que o Canva não faz: dinheiro subindo no placar, cartas virando para revelar o top 3, dados rolando ao iniciar o cronômetro, roleta girando. Todas respeitam `prefers-reduced-motion`.

## Requisitos não funcionais
- RNF01 Offline: abre com duplo clique em `index.html` (file://) no Chrome e no Edge atuais, sem internet, servidor ou build. Fontes, bibliotecas e imagens ficam no repositório. Scripts clássicos (`<script src>`), sem ES modules e sem fetch, que o Chrome bloqueia em file://.
- RNF02 Projeção: palco 16:9 que escala para qualquer resolução de 1024x768 a 1920x1080, com faixas nas sobras, sem rolagem nem corte. No máximo 3 linhas de texto por slide, fora o código.
- RNF03 Fluidez: troca de slide em menos de 100 ms; animações sem engasgo num notebook comum.
- RNF04 Manutenção: conteúdo separado do código; README em português; arquivos de 200 a 400 linhas; nenhuma dependência para usar ou editar o conteúdo. Node só é necessário para rodar os testes.
- RNF05 Acessibilidade: contraste alto (projetor desbota cor), tudo operável por teclado, foco visível no painel, `aria-live` no cronômetro do painel.
- RNF06 Privacidade: nomes dos alunos ficam só no navegador do notebook e nunca entram no git.
- RNF07 Robustez: funciona sem som e sem o painel (projetor espelhado); fechar o painel não derruba a janela principal; recarregar a janela principal não perde o estado.

## Fora de escopo
Sistema de envio de respostas; Forms de avaliação; rodar Python no navegador; terminal simulado; revelação automática dos slides de apoio por tempo; arte das notas impressas; editor visual de slides; versão em Canva ou PPTX; corte do roteiro para 80 min (decisão do grupo, o Claude só ajusta tempos no config); hospedagem online (GitHub Pages).

## Critérios de aceite
- CA01 Com o Wi-Fi desligado, duplo clique em `index.html` abre a capa no Chrome e no Edge, e a aba Network não mostra requisição externa.
- CA02 Os 56 slides batem com `docs/roteiro.md`, e `scripts/conferir-gabaritos.py` executa todos os gabaritos e exemplos com as entradas do roteiro, confere a saída esperada e confirma que os códigos de "achou o erro" (slides 11 e 30) falham com o erro certo.
- CA03 Um cronômetro de 5:00 termina com menos de 1 s de erro, toca o aviso, pausa, retoma e sobrevive a recarregar a página.
- CA04 Registrar o top 3 das 8 atividades gera o ranking com a soma e o desempate certos (teste unitário com um caso montado a partir do roteiro).
- CA05 Fechar e reabrir o navegador mantém o placar; exportar e importar o JSON restaura o mesmo estado; JSON inválido é recusado com mensagem clara.
- CA06 Navegar em qualquer das duas janelas atualiza a outra em menos de 200 ms.
- CA07 A roleta só sorteia entre os marcados e, com a opção ligada, não repete vencedor.
- CA08 Ctrl+P gera um PDF de 56 páginas 16:9, sem controles.
- CA09 Screenshots em 1920x1080, 1366x768 e 1024x768 sem corte; código legível; visual igual aos modelos aprovados no Figma.
- CA10 `npm test` passa com cobertura de 80% ou mais em `js/logica/`.
- CA11 Um colega sem Node consegue, só com o README, baixar o repositório e abrir a apresentação no notebook dele.

## Riscos e premissas
- A professora pediu os slides no AULA e indicou o modelo do Canva. O PDF cobre a entrega; o grupo confirma com ela que HTML é aceito.
- Prazo curto (sábado 14/11 a terça 17/11). Prioridade: navegação, conteúdo, cronômetro e placar; depois painel, roleta e PDF; animações e polimento por último.
- Restrições de file:// (sincronia entre janelas, fontes locais, localStorage) variam entre navegadores: um teste rápido no início decide a técnica.
- Popup e som: o painel abre por tecla (gesto do usuário) e o som só liga depois da primeira interação.
- Premissas: notebook do grupo com Chrome ou Edge atual; o sistema de envio mostra o top 3 para um ministrante digitar; links do sistema e do Forms chegam depois; ministrantes ainda sem nome (placeholders); a disciplina não proíbe IA (a confirmar com a professora).
</prd>

<instrucao_inicial>
1. Salve o bloco `<prd>` em `docs/prd.md`.
2. Leia `docs/roteiro.md` inteiro e o PDF em `docs/referencias/`.
3. Rode `/plan docs/prd.md` e espere o Walter confirmar o plano antes de escrever qualquer código.
4. Depois do plano aprovado, esta primeira sessão monta o harness descrito em `<harness>`, faz o teste de file:// e cria o arquivo do Figma. Ela não escreve funcionalidade.
</instrucao_inicial>

<harness>
A pasta ainda não é repositório git. A sessão de inicialização cria:

1. `git init`, `.gitignore` com: `docs/referencias/`, `assets/fotos/`, `placar-*.json`, `node_modules/`, `coverage/`, `.claude/settings.local.json`. As referências da professora (PDF com telefone e e-mail dela) e as fotos dos ministrantes ficam fora do git.
2. `CLAUDE.md` curto (até 80 linhas), como mapa para as próximas sessões do Walter. Pode citar as skills, agentes e comandos ECC do computador dele. Conteúdo: como abrir (duplo clique), como testar (`npm test`, `python scripts/conferir-gabaritos.py`), as regras de file:// (scripts clássicos, sem fetch, sem ES modules, sem CDN), onde fica cada coisa, quais skills e agentes usar em cada tipo de tarefa e o ritual de sessão.
3. `docs/contrato.md`: formato de um slide e de uma seção (campos como `n`, `layout`, `titulo`, `texto`, `codigo` com rótulo e linguagem, `fala`, `interacao`, `resposta`, `atividade`, `apoio`), o formato do estado (jogadores, resultados por atividade, cronômetro, slide atual) e as mensagens entre a janela principal e o painel. Toda mudança de contrato atualiza este arquivo no mesmo commit.
4. `docs/features.json` derivado do PRD, com `id`, `descricao`, `prioridade`, `passos_de_teste` e `passa: false`. Ordem sugerida: F01 palco 16:9 e navegação; F02 modelos visuais a partir do Figma; F03 conteúdo das seções e conferência dos gabaritos; F04 realce de Python; F05 cronômetro; F06 placar e ranking; F07 slides de resposta e ranking ligados ao placar; F08 persistência, exportar e importar; F09 painel do apresentador, sincronia e relógio da aula; F10 roleta; F11 QR codes e ministrantes; F12 impressão em PDF; F13 animações; F14 README e ajuda de atalhos.
5. `docs/progresso.md`: diário curto por sessão (feito, pendente, próximo passo).
6. `package.json` sem dependências, só com scripts: `test` roda `node --test` com cobertura e limite de 80% em `js/logica/` (Node 24: `--experimental-test-coverage` e `--test-coverage-lines=80` com include de `js/logica/**`; confira as flags com `node --help` antes de fixar).
7. `scripts/conferir-gabaritos.py`: lê os blocos de código das seções, roda cada gabarito e exemplo com as entradas do roteiro (ex.: dados 3 e 4; saldo 500/300, 300/300, 100/300; boss com Ana, 400, 300 e 900) e compara com a saída esperada, ignorando o texto dos prompts do `input`. Também confirma que os códigos de erro dos slides 11 e 30 falham.
8. Hooks em `.claude/settings.json` do projeto: `PostToolUse` em Edit/Write de `*.js` roda `node --check` no arquivo e os testes rápidos, com saída curta quando passa e o erro inteiro quando falha; `Stop` roda `npm test` e não deixa a sessão encerrar com teste quebrado.
9. Estrutura de pastas:
   ```
   index.html              apresentação (abre com duplo clique)
   apresentador.html       painel do apresentador (tecla P)
   conteudo/config.js      tempos, cronograma, prêmios, links, ministrantes
   conteudo/secoes/        um arquivo por seção do roteiro (01-abertura.js ... 10-premiacao.js)
   js/logica/              funções puras testadas com node --test (placar, cronometro, roleta, cronograma, estado, realce)
   js/ui/                  renderização, navegação, painel, sincronia, roleta, efeitos
   css/                    tokens (do Figma), base, modelos, impressao, animacoes
   assets/svg/             ilustrações exportadas do Figma
   assets/fontes/          fontes locais (woff2 ou base64)
   vendor/                 bibliotecas copiadas, com licença ao lado
   tests/
   scripts/
   docs/
   ```
   Os módulos de `js/logica/` funcionam no navegador e no Node: cada um registra a API em `window.PI` e, se `module` existir, em `module.exports`.
10. Primeiro commit: `chore(projeto): estrutura inicial e harness`.

Teste de file:// (logo depois do harness, registrado em `docs/decisoes.md`): uma página mínima aberta por file:// no Chrome e no Edge que confere (a) sincronia entre duas janelas por `postMessage` com `window.open` e, como alternativa, pelo evento `storage`; (b) fonte local por `@font-face` com url relativa e, se falhar, embutida em base64; (c) localStorage persistindo entre recargas. A técnica escolhida entra no `docs/contrato.md`.

Ritual de toda sessão seguinte: conferir a pasta, ler `git log --oneline -10` e `docs/progresso.md`, rodar `npm test`, abrir `index.html` no navegador embutido, escolher em `docs/features.json` a pendente de maior prioridade. Uma funcionalidade por vez: termina com teste passando, verificação no navegador, `passa: true`, commit descritivo e `docs/progresso.md` atualizado.
</harness>

<sessoes>
Sessão única, do Walter: Opus 5.5, esforço high, nesta pasta, sem worktree. Nome para o `/rename`: `PLP: Python Imobiliário`.

Motivo: o Walter desenvolve sozinho com o Claude, no computador dele, e o motor, o CSS e o conteúdo mudam juntos a cada funcionalidade. Sessões paralelas iam esbarrar nos mesmos arquivos. Se o contexto encher, a próxima sessão retoma pelo ritual de `<harness>` (progresso.md, features.json, git log).

Subagents dentro da sessão:
- Sonnet 5.5: transcreve `docs/roteiro.md` para `conteudo/secoes/` seguindo `docs/contrato.md`, sem reescrever o texto do grupo.
- Revisores com contexto limpo nos passos de revisão de `<comandos_ecc>`.

Os colegas não desenvolvem. Depois do push (quando o Walter pedir), eles recebem acesso ao repositório só para ver, baixar e abrir a apresentação.
</sessoes>

<referencias_figma>
Ainda não existe design. O Figma está conectado pela conta do Walter na Ulbra (plano educacional, assento Full). Ordem:

1. Carregue a skill `figma:figma-create-new-file` e crie um arquivo Design chamado "Python Imobiliário - Flash Clip" no time do Walter. Chame `create_session` com a chave do arquivo e reutilize o `sessionId` em toda chamada seguinte.
2. Carregue `figma:figma-use` (obrigatória antes de todo `use_figma`) e `figma:figma-generate-design`.
3. Página "Direções": três direções visuais diferentes, cada uma com três frames de 1920x1080 (capa, conceito com código e saída, atividade com cronômetro). Cada direção define paleta (cores das casas do tabuleiro, fundo, texto, editor de código), duas fontes (uma de display e uma de texto, licença livre para embutir; código em fonte mono legível) e tratamento das peças. Respeite as diretrizes de `<diretrizes_design_qa>`. Mande o link ao Walter e espere ele escolher.
4. Na direção escolhida: variáveis (cores, tipografia, espaçamentos), componentes (casa, carta de propriedade, dado, nota de dinheiro, peão, cronômetro, bloco de código, linha do ranking, card do top 3) e uma página "Modelos" com um frame por layout do RF03, preenchido com conteúdo real do roteiro. Os 56 slides não são desenhados no Figma: saem do HTML a partir do conteúdo.
5. Ilustrações: desenhe como vetores com `use_figma`. `generate_vector_illustration` e `generate_image` gastam créditos de IA do plano do Walter: só use com o ok dele, pedido a cada vez.
6. Do Figma para o código: `get_metadata` (estrutura), `get_variable_defs` (tokens viram variáveis CSS em `css/tokens.css`), `get_design_context` por modelo (referência de código, adaptada para HTML e CSS puros), `download_assets` em SVG para `assets/svg/`, e `get_screenshot` de cada modelo para comparar com a implementação.
7. Compartilhar o arquivo por link com o grupo só se o Walter pedir.
</referencias_figma>

<comandos_ecc>
1. `/plan docs/prd.md`. Gatilho: início. Espera confirmação.
2. Sessão de harness e teste de file:// (`<harness>`). Gatilho: plano aprovado.
3. Figma, passos 1 a 4 de `<referencias_figma>`. Gatilho: harness commitado. Para na escolha da direção e na aprovação dos modelos (notificação no celular).
4. Subagent Sonnet 5.5 transcreve o roteiro para `conteudo/secoes/`; depois `python scripts/conferir-gabaritos.py`. Gatilho: contrato fechado.
5. Funcionalidades na ordem de `docs/features.json`. Para cada módulo de `js/logica/`, agente `tdd-guide` (teste que falha, implementação mínima, refatoração). Para a interface, verificação no navegador embutido.
6. Skill `click-path-audit`. Gatilho: F09 e F10 prontas (estado compartilhado entre duas janelas, botões de placar, roleta e cronômetro).
7. Agente `security-reviewer`. Gatilho: F06, F08 e F09 prontas (nomes digitados na tela, JSON importado, mensagens entre janelas).
8. `/code-review` e agente `typescript-reviewer` (revisa JavaScript). Gatilho: todas as P0 e P1 prontas.
9. `/web-design-guidelines`, skill `accessibility` (contraste no projetor, teclado), skill `make-interfaces-feel-better` e skill `motion-foundations` (animações e `prefers-reduced-motion`). Gatilho: F13.
10. `/humanizer` em modo arquivo: `README.md` e os textos de interface do painel e da ajuda. Gatilho: F14.
11. Skill `verification-loop` e comparação com o Figma (`get_screenshot`). Gatilho: antes de dizer que terminou.
12. Só com pedido do Walter: `gh repo create wluca1/flashclip-python-imobiliario --private`, push e convites para os colegas acessarem (`gh api` com o usuário de cada um, ou o Walter convida pelo e-mail na página do repositório).

Bug ou teste quebrado que não se resolve na primeira tentativa: skill `systematic-debugging` antes de propor correção.
</comandos_ecc>

<diretrizes_design_qa>
Regras do roteiro (valem acima de tudo):
- Uma ideia por slide. No máximo 3 linhas de texto, fora o código.
- Código grande (28px ou mais no palco de 1920x1080), fundo escuro de editor.
- Identidade de tabuleiro: casas coloridas, cartas de propriedade, dados, notas de dinheiro. Arte própria do grupo.
- Sem emojis. Todo slide de atividade com cronômetro visível.

Filtro de design que se aplica:
- Proibido: gradientes fortes, orbs, dot grid, liquid glass; roxo com preto e neon; fundo branco puro (#FFFFFF); sombras exageradas e cantos arredondados em tudo; ícones Lucide, sparkle, emoji decorativo, setas animadas; só Inter, Geist ou Space Grotesk; faixa colorida na borda esquerda de card; listas com checkmark (no slide 36, os módulos concluídos viram propriedades compradas no tabuleiro, não checks); hover genérico.
- A saída de código aparece como painel "Saída" do editor, sem imitar janela de terminal com botões coloridos.
- Direção de arte definida no Figma antes do código (`<referencias_figma>`).

Projeção:
- Contraste alto; testar cores sobre fundo escuro e claro pensando em projetor que desbota.
- Nada importante a menos de 5% da borda do palco (projetores cortam as beiradas).
- Texto do placar e do cronômetro legível do fundo da sala.

Não se aplica (apresentação offline, não site): checklist de lançamento (404, sitemap, OG, cookies, LGPD de site, Lighthouse), skeleton loaders, Termos de Uso, verificação em 375px.

Texto:
- O texto dos slides é do grupo e vem do roteiro. Não passa pelo humanizer e não é reescrito; só corrija erro evidente de digitação e avise.
- Passam pelo `/humanizer` em modo arquivo: `README.md`, textos de interface do painel, da ajuda de atalhos e das mensagens de erro. Amostra de voz: `docs/roteiro.md`.
- Sem travessão em nenhum texto.
</diretrizes_design_qa>

<excecoes_as_rules>
- TDD e cobertura de 80% valem só para `js/logica/`. Renderização, CSS e animação são verificados no navegador embutido, sem teste unitário.
- Não há typecheck nem lint, para manter o projeto sem dependências. O sensor é `node --check`, `npm test` e `scripts/conferir-gabaritos.py`. Não instale ESLint, TypeScript nem Playwright sem perguntar.
- Não há build: "passou pelo build" significa abrir `index.html` por file:// sem erro no console.
- A verificação em 375px vira verificação em 1920x1080, 1366x768 e 1024x768 (resoluções de projetor). O painel do apresentador é verificado em 1366x768.
- O Prompt Mestre autoriza um commit por funcionalidade concluída, direto na main local, porque o Walter é o único desenvolvedor. Push continua só com pedido do Walter.
</excecoes_as_rules>

<restricoes_seguranca>
- Nenhuma requisição de rede: sem CDN, sem analytics, sem fonte remota.
- Baixar fonte (Google Fonts, licença OFL) ou biblioteca (ex.: gerador de QR code, MIT) só depois de dizer ao Walter qual arquivo, de onde e o tamanho, e ele aprovar. Prefira escrever o realce de Python em `js/logica/realce.js`, sem biblioteca. Copie a licença de toda biblioteca para `vendor/`.
- Nomes digitados (jogadores) entram no DOM só por `textContent`, nunca por `innerHTML`.
- JSON importado é validado (estrutura, tipos, limites de tamanho) antes de substituir o estado; inválido é recusado com mensagem clara.
- Mensagens entre janelas: confira que vêm da janela conhecida (`event.source`) e têm o formato do contrato; ignore o resto.
- LGPD: nomes dos alunos só no localStorage do notebook, com botão de apagar; `placar-*.json` no `.gitignore`. Fotos reais dos ministrantes só com o consentimento de cada um e fora do git (`assets/fotos/`).
- Material da professora fica em `docs/referencias/`, fora do git.
- Nada do logotipo, nome estilizado ou ilustração do jogo comercial.
- O Claude não faz sozinho: criar o repositório no GitHub, push, convite de colaborador, compartilhamento do Figma, GitHub Pages, uso de crédito de IA do Figma. Tudo isso só com pedido do Walter na hora.
</restricoes_seguranca>

<fora_de_escopo>
Sistema de envio de respostas; Forms de avaliação e frequência; rodar Python no navegador; terminal simulado; revelação automática por tempo dos slides de apoio; arte das notas de dinheiro impressas; editor visual de slides; versão em Canva ou PPTX; corte do roteiro para 80 min; hospedagem online.
</fora_de_escopo>

<criterios_de_aceite>
Pronto significa todos os CA01 a CA11 do PRD, mais:
- `docs/features.json` com todas as P0 e P1 em `passa: true`.
- Modelos implementados batendo com os frames aprovados no Figma.
- README que um colega sem Node segue para baixar e abrir a apresentação, e que explica ao Walter onde fica o texto de cada slide.
- Nenhum `console.log` de depuração, código comentado ou emoji no repositório.
</criterios_de_aceite>

<verificacao>
Antes de dizer que uma funcionalidade ou o projeto terminou, mostre o comando e o resultado:
1. `npm test` passando, com a cobertura de `js/logica/`.
2. `python scripts/conferir-gabaritos.py` passando.
3. `index.html` aberto por file:// no navegador embutido, console sem erro e Network sem requisição externa. Se o navegador embutido não abrir file://, use um servidor estático mínimo em Node só para a verificação visual e peça ao Walter para conferir o duplo clique no Chrome e no Edge dele.
4. Screenshots em 1920x1080, 1366x768 e 1024x768 de cada modelo, comparados com `get_screenshot` do Figma.
5. Teste de ponta a ponta como o ministrante usaria: cadastrar 6 jogadores, registrar o top 3 de todas as atividades, conferir o ranking parcial e o final, girar a roleta, abrir o painel, navegar pelas duas janelas, recarregar e conferir que nada se perdeu, exportar e importar o JSON, gerar o PDF.
6. `security-reviewer` sem achado CRITICAL ou HIGH.
7. Textos do README e da interface revisados com `/humanizer`.
8. `/web-design-guidelines` sem achado pendente.
Diga também o que não foi verificado e por quê.
</verificacao>

<formato_saida>
Ao fim de cada etapa:
- o que mudou, com links para os arquivos;
- comandos de teste e resultado (falha inteira, sucesso resumido);
- screenshots quando a etapa mexer no visual;
- item marcado em `docs/features.json` e linha nova em `docs/progresso.md`;
- o que ficou pendente e o próximo passo.

Mande notificação no celular (Remote Control, ferramenta PushNotification) quando terminar uma etapa longa e quando precisar de decisão: escolha da direção no Figma, aprovação dos modelos, download de fonte ou biblioteca, push e convites.

Ordem de entrega pensando no prazo de terça, 17/11:
- Até domingo: harness, Figma aprovado, F01 a F08 (apresentação navegável com conteúdo, cronômetro e placar).
- Segunda: F09 a F12 (painel, roleta, QR, PDF) e ensaio cronometrado com o grupo.
- Se sobrar tempo: F13 e F14 completos. README mínimo entra antes do push, mesmo que o resto atrase.
</formato_saida>
