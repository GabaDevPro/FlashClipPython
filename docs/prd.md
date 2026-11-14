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
