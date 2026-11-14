# Plano: Python Imobiliário

**PRD:** `docs/prd.md` (fonte: `docs/prompt-mestre.md`)
**Complexidade:** grande (15 funcionalidades, 3 dias até 17/11 às 19:10)
**Status:** aprovado pelo Walter em 2026-11-14 (com o slide 18b no fluxo e no PDF)

## Resumo

Apresentação em HTML, CSS e JS puros que abre por file://, com 56 slides do roteiro, cronômetro, placar, ranking, roleta e painel do apresentador. Conteúdo separado do motor; lógica pura em `js/logica/` com TDD; visual vindo do Figma. O visual fica desacoplado da lógica para que o atraso na aprovação do Figma não trave navegação, cronômetro e placar.

## Padrões a seguir

A pasta só tem `docs/`. Não existe código para espelhar. Os padrões vêm do Prompt Mestre:

| Categoria | Padrão |
|---|---|
| Nomes | Arquivos e funções em português, kebab-case nos arquivos (`conferir-gabaritos.py`, `01-abertura.js`) |
| Módulos | Script clássico; cada módulo de `js/logica/` registra a API em `window.PI` e, se `module` existir, em `module.exports` |
| Erros | Mensagem amigável na tela; detalhe em `console.error`; JSON inválido recusado com motivo |
| Dados | Estado único versionado no localStorage (`pi:estado:v1`); funções puras devolvem estado novo, sem mutação |
| Testes | `node --test` em `tests/*.test.js`, `node:assert/strict`, cobertura de linhas de 80% em `js/logica/**` |

Ambiente conferido agora: Python 3.12.10, Node 24.19.0 (flags `--experimental-test-coverage`, `--test-coverage-lines`, `--test-coverage-include` existem), git 2.55, gh 2.98 logado como `wluca1`.

## Decisões técnicas

1. **Sincronia entre janelas:** `window.open` + `postMessage`, conferindo `event.source` e o formato da mensagem. Plano B: evento `storage`. `BroadcastChannel` provavelmente não funciona em file:// (origem opaca); o teste confirma.
2. **Cronômetro:** guarda `terminaEm` (horário em ms) quando rodando e `restanteMs` quando pausado. O restante é sempre `terminaEm - agora`, então não acumula erro e sobrevive a recarregar.
3. **Fontes:** `@font-face` com url relativa; se o teste de file:// falhar, base64 num CSS gerado.
4. **Conteúdo:** `conteudo/secoes/NN-nome.js` chama `PI.secao({...})` com objetos literais; código em template string sem interpolação.
5. **Conferência dos gabaritos:** `scripts/conferir-gabaritos.py` pede a um helper `node scripts/exportar-conteudo.js` o JSON dos blocos de código (mais robusto que regex no JS), roda cada bloco com `input` trocado por uma versão que não imprime a pergunta, compara com a saída esperada e confirma o erro dos slides 11 (cada linha separada: `NameError` e `SyntaxError`) e 30 (`IndentationError`).
6. **Slides de apoio:** o roteiro cita uma "versão fácil" extra da atividade 2 (fora dos 56). Proposta: slide `18b` com `apoio: true`, logo depois do 18, no fluxo normal e no PDF (57 páginas). Os slides 49 e 50 já são numerados.
7. **Slide 30:** o roteiro não traz o código. Uso o exemplo do slide 29 sem os 4 espaços de recuo, sem mudar mais nada.
8. **QR code:** biblioteca pequena em `vendor/` (ex.: `qrcode-generator`, MIT). Download só com seu ok, no F11.
9. **PDF:** `@media print` com `@page` 16:9 sem margem, um slide por página, controles escondidos, ranking como "ranking ao vivo".

## Fases

### Fase 0: harness e teste de file:// (hoje, sábado)
- `git init`, `.gitignore`, `CLAUDE.md`, `docs/contrato.md`, `docs/features.json`, `docs/progresso.md`, `package.json`, esqueleto de `scripts/conferir-gabaritos.py`, hooks em `.claude/settings.json`, estrutura de pastas.
- Página mínima de teste de file:// (postMessage, storage, fonte local, localStorage). Resultado em `docs/decisoes.md` e a técnica escolhida no contrato.
- Commit `chore(projeto): estrutura inicial e harness`.
- **Validação:** `npm test` roda (sem testes ainda passa ou falha de forma esperada), `node --check` nos JS, abrir a página de teste no navegador embutido.

### Fase 1: Figma, direções visuais (hoje)
- Criar o arquivo "Python Imobiliário - Flash Clip", página "Direções" com 3 direções x 3 frames 1920x1080.
- **Para aqui:** você escolhe a direção. Notificação no celular.

### Fase 2: conteúdo e núcleo (sábado à noite e domingo)
- Subagent Sonnet 5.5 transcreve o roteiro para `conteudo/secoes/` seguindo o contrato; `python scripts/conferir-gabaritos.py`.
- F01 palco 16:9 e navegação; F04 realce de Python (TDD); F05 cronômetro (TDD); F06 placar e ranking (TDD); F07 slides de resposta e ranking ligados ao placar; F08 persistência, exportar e importar (TDD).
- Em paralelo à espera do Figma: componentes e modelos na direção escolhida, depois F02 (modelos em CSS a partir dos tokens).
- **Para aqui:** aprovação dos modelos no Figma.

### Fase 3: apresentador e extras (segunda)
- F09 painel e sincronia; F10 roleta (TDD); F11 QR e ministrantes; F12 PDF.
- `click-path-audit` depois de F09 e F10; `security-reviewer` depois de F06, F08 e F09.
- README mínimo antes de qualquer push. Ensaio cronometrado com o grupo.

### Fase 4: polimento (se sobrar tempo)
- F13 animações; F14 README completo e ajuda de atalhos; `/code-review`, `typescript-reviewer`, `/web-design-guidelines`, `accessibility`, `make-interfaces-feel-better`, `motion-foundations`, `/humanizer` (README e interface), `verification-loop` e comparação com o Figma.

## Prioridades em `features.json`

| Prioridade | Funcionalidades |
|---|---|
| P0 (domingo) | F01, F02, F03, F04, F05, F06, F07, F08 |
| P1 (segunda) | F09, F10, F11, F12, README mínimo |
| P2 (se sobrar) | F13, F14 completo |

## Riscos

| Risco | Chance | Mitigação |
|---|---|---|
| Figma precisa de autorização (`/mcp`) antes da Fase 1 | certa | Você autoriza o servidor Figma pelo `/mcp`; enquanto isso eu sigo no harness |
| Prazo de 3 dias para 15 funcionalidades | alta | Ordem de prioridade; visual desacoplado; F13 e F14 completos podem ficar para 24/11 |
| Restrições de file:// variam entre Chrome e Edge | média | Teste no início; plano B de sincronia e de fonte; você confere o duplo clique no seu Chrome e Edge |
| Navegador embutido não abrir file:// | média | Servidor estático mínimo em Node só para a verificação visual |
| Roteiro tem 135 min e a aula de 17/11 tem 80 | certa | Decisão do grupo; eu só ajusto tempos no config |
| Fontes e biblioteca de QR exigem download | certa | Peço o ok com arquivo, origem e tamanho antes |

## Perguntas para você

1. O slide extra da versão fácil (18b) entra no fluxo e no PDF, deixando 57 páginas? Minha escolha padrão é sim.
2. Pode autorizar o servidor do Figma no `/mcp` agora? Sem isso a Fase 1 não começa.

## Aceite do plano

- [ ] Plano confirmado pelo Walter
- [ ] Respostas das perguntas 1 e 2
