# Python Imobiliário (Flash Clip, PLP 3N 2026/2)

Apresentação interativa do minicurso de Python do grupo do Walter (evento em 05/12, 14:00): 71 slides (os 56 do roteiro, mais 7b, 18b, 22b e 30b, o 29 dividido em 29a e 29b, e o plano B de 57 a 66), cronômetro, placar, ranking, roleta, painel do apresentador e código ao vivo. HTML, CSS e JS puros, offline por file://. Fonte de verdade das decisões: `docs/prompt-mestre.md`. Requisitos: `docs/prd.md`. Plano aprovado: `docs/plano.md`.

## Abrir e testar

- Abrir: duplo clique em `index.html` (Chrome ou Edge). Painel do apresentador: tecla P. Código ao vivo: tecla O (OneCompiler embutido; no painel, com a cola do código do slide); Esc fecha. Usa o Windows em Estender, com o painel na tela do notebook.
- `npm test`: testes de `js/logica/` com cobertura mínima de 80% de linhas.
- `npm run test:rapido`: os mesmos testes, sem cobertura.
- `python scripts/conferir-gabaritos.py`: roda os gabaritos e exemplos dos slides e confere a saída e os erros dos slides 11 e 30.
- Não há build nem lint. "Passou no build" = `index.html` aberto por file:// sem erro no console e sem requisição externa.

## Regras de file:// (não quebre)

- Só `<script src>` clássico. Sem ES modules, sem `fetch`, sem CDN, sem fonte remota. Única requisição externa permitida: o iframe do OneCompiler, criado só ao apertar O (`docs/decisoes.md`, 2026-11-18).
- Cada módulo de `js/logica/` registra a API em `window.PI` e, se `module` existir, em `module.exports` (roda no navegador e no Node).
- Sincronia entre janelas, fontes e localStorage: técnica em `docs/decisoes.md` e `docs/contrato.md` (seção 8 para o modo ao vivo, com uma chave para cada janela).
- O navegador embutido abre arquivo local como `data:` (sem localStorage). Para ver a tela nele: `preview_start` com a configuração `apresentacao` (`.claude/launch.json`, `scripts/servidor.js`, porta 8137).
- Verificação por file:// de verdade: `node scripts/capturar.js --largura 1920 --altura 1080 --saida capturas/1920x1080 [--slides 1,15] [--navegador <exe do Edge>]` salva um PNG por slide e lista erros de console e requisições externas (pasta `capturas/` fora do git). Sincronia entre janelas: `node scripts/testar-file-headless.js`.
- Código sem ligaduras (`!=` não vira ≠): a regra fica no fim de `css/modelos.css`.

## Onde fica cada coisa

| Caminho | O quê |
|---|---|
| `conteudo/secoes/NN-nome.js` | Texto dos slides, um arquivo por seção do roteiro |
| `conteudo/config.js` | Tempos, cronograma, prêmios, links, ministrantes |
| `js/logica/` | Funções puras testadas (placar, cronômetro, roleta, cronograma, estado, realce) |
| `js/ui/` | Renderização, navegação, painel, sincronia, efeitos |
| `css/` | `tokens.css` (do Figma), base, modelos, impressão, animações |
| `assets/svg/`, `assets/fontes/` | Arte do Figma e fontes locais. |
| `vendor/` | Bibliotecas copiadas, com a licença ao lado |
| `tests/` | `node --test`; `tests/navegador/` tem páginas de teste manual |
| `scripts/` | Conferência dos gabaritos, exportador de conteúdo e hooks |
| `docs/` | Contrato, features, progresso, decisões, roteiro. `docs/referencias/` fica fora do git |

## Contrato

`docs/contrato.md` define slide, seção, bloco de código, config, estado e mensagens entre janelas. Mudou o contrato, atualize o arquivo no mesmo commit.

## Regras do projeto

- Texto dos slides é do grupo (`docs/roteiro.md`). Não reescreva; só corrija erro evidente de digitação e avise.
- Sem emoji, sem travessão, no máximo 3 linhas de texto por slide fora o código, código a 28px ou mais no palco 1920x1080.
- Nomes de jogadores só por `textContent`. JSON importado validado antes de trocar o estado. Mensagem entre janelas só da janela conhecida e no formato do contrato.
- Download de fonte ou biblioteca, push, convite, compartilhar o Figma e crédito de IA do Figma: só com pedido do Walter na hora.
- TDD e cobertura só em `js/logica/`. Interface se verifica no navegador embutido em 1920x1080, 1366x768 e 1024x768 (painel em 1366x768).
- Commit por funcionalidade concluída, direto na `main` local, no formato `tipo(escopo): descrição`.

## Skills e agentes por tarefa

- Lógica nova em `js/logica/`: agente `tdd-guide`.
- Bug ou teste que não passa na primeira tentativa: skill `systematic-debugging`.
- Figma: `figma:figma-use` antes de todo `use_figma`; `figma:figma-design-to-code` antes de `get_design_context`.
- Depois de F09 e F10: skill `click-path-audit`. Depois de F06, F08 e F09: agente `security-reviewer`.
- P0 e P1 prontas: `/code-review` e agente `typescript-reviewer`.
- F13: `/web-design-guidelines`, `accessibility`, `make-interfaces-feel-better`, `motion-foundations`.
- README e textos de interface: `/humanizer`. Antes de dizer que terminou: `verification-loop`.

## Hooks (`.claude/settings.json`)

- Depois de Edit/Write em `.js`: `node --check` e testes rápidos (`scripts/hooks/pos-edicao.js`).
- Ao encerrar: `npm test`; teste quebrado impede encerrar (`scripts/hooks/ao-parar.js`).

## Ritual de cada sessão

1. Conferir a pasta, `git log --oneline -10` e `docs/progresso.md`.
2. `npm test`.
3. Abrir `index.html` no navegador embutido.
4. Pegar em `docs/features.json` a pendente de maior prioridade. Uma por vez: teste passando, verificação no navegador, `passa: true`, commit, linha nova em `docs/progresso.md`.
