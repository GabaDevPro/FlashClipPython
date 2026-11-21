# Decisões

## 2026-11-14: teste de file://

Página: `tests/navegador/teste-file.html` (com `teste-file-filha.html`). Rodada por `node scripts/testar-file-headless.js`, que abre o arquivo por file:// num navegador real em modo headless, clica em "Abrir janela filha", recarrega a principal e lê a tabela.

### Resultado

| Teste | Edge 157 | Chrome 158 |
|---|---|---|
| Página aberta como `file:` | OK | OK |
| `window.open` com gesto do usuário | OK | OK |
| `postMessage` ida e volta | OK, 0 ms | OK, 0 ms |
| `event.origin` | `"null"` | `"null"` |
| Filha se reconecta depois de recarregar a principal (via `window.opener`) | OK | OK |
| Evento `storage` ida e volta | OK, 0 ms | OK, 1 ms |
| `BroadcastChannel` | OK | OK |
| Fonte por `@font-face` com url relativa | OK | OK |
| Fonte em base64 | OK | OK |
| localStorage persiste entre recargas | OK | OK |

### Escolhas

1. **Sincronia:** `window.open` + `postMessage`. Em file:// a origem é `"null"`, então não dá para filtrar por origem: quem recebe confere `event.source` (a janela conhecida) e o formato do contrato. O painel manda `pi:ola` a cada 1 s; assim a principal recarregada reaprende quem é o painel. `postMessage` usa `"*"` como destino porque a origem é opaca; nada sigiloso passa nas mensagens.
2. **Plano B de sincronia:** evento `storage` (funcionou nos dois). Usado quando o painel não tem `window.opener` (aberto à mão). `BroadcastChannel` também funcionou, mas não traz `event.source`; fica de fora.
3. **Fontes:** arquivos em `assets/fontes/` com `@font-face` e url relativa. Base64 não é necessário.
4. **Estado:** localStorage com a chave `pi:estado:v1`. Em file:// o Chromium compartilha o mesmo armazenamento entre todos os arquivos locais, por isso a chave tem prefixo.
5. **Verificação visual:** o navegador embutido do app abre arquivo local como `data:` (sem localStorage nem file://). A verificação visual usa um servidor estático mínimo em Node em `localhost`; o comportamento de file:// se confere com `scripts/testar-file-headless.js`.

### Falta conferir

- Duplo clique no Chrome e no Edge do Walter, com janela visível (o teste foi headless). Abra `tests/navegador/teste-file.html`, clique em "Abrir janela filha", espere 3 s e aperte F5: todas as linhas devem ficar OK. Os arquivos `fonte-teste*` ficam fora do git; sem eles as duas linhas de fonte falham.

## 2026-11-14: sem QR code e prêmio de chocolate (pedido do Walter)

- Não haverá sistema de envio nem QR code: a aula é para leigos, e os ministrantes acompanham nas carteiras quando alguém diz que terminou. O slide 4 virou "Como mostrar sua resposta" (escrever e testar no compilador; terminou, levante a mão; um ministrante confere na tela), a partir do plano B do roteiro. O slide 55 mostra o link do Forms em texto (ou "link pendente"). Layout `qr` virou `instrucoes`; o campo `qr` virou `link`.
- O prêmio físico do 1º lugar de cada atividade é chocolate (`config.atividades[x].premio`). A nota de dinheiro ao lado de "prêmio do 1º lugar" virou uma barra de chocolate. A pontuação do ranking continua em dinheiro fictício (tema do Magnata), até o Walter dizer o contrário.
- A F11 deixa de ter QR code e fica só com os ministrantes do config (foto opcional, peão na cor dele).

## 2026-11-18: código ao vivo sem tirar a apresentação da tela (pedido do Walter)

Problema: o Walter digita código ao vivo no OneCompiler. Com o Windows em "Estender", o código não aparece no projetor; com "Duplicar", o painel do apresentador aparece para a plateia.

- **Duas versões, porque não se sabe se a professora exige o OneCompiler.** Tecla E: editor próprio, offline, com o Skulpt 1.2.0 (MIT, `vendor/skulpt/skulpt.min.js` 560 KB e `skulpt-stdlib.js` 400 KB, copiados do npm via jsDelivr em 2026-11-18). Tecla O: o editor oficial do OneCompiler embutido no palco (API de embed: `populateCode`, `triggerRun`, `codeChangeEvent`).
- **Os dois funcionam nos dois modos do Windows.** No Duplicar, digita-se no próprio slide e o painel fica fechado. No Estender, o painel ganha o mesmo editor: digita-se no notebook e o projetor mostra o código e a saída (no OneCompiler, o "Rodar no projetor" roda lá).
- **Exceção à regra de nenhuma requisição externa:** só a tecla O carrega `onecompiler.com`, e só depois de apertada. Sem internet (`navigator.onLine` falso) aparece o aviso para usar a tecla E. As capturas por file:// continuam sem requisição externa.
- **Limites do Skulpt:** não é o Python oficial. Todo código dos slides com `testes` roda nele com a mesma saída do Python (`tests/skulpt.test.js`), e as mensagens de erro mais comuns são traduzidas para o texto do Python 3.12 (`traduzirErro`). Módulos de rede e de página (`requests`, `urllib`, `document`) ficam bloqueados. Um `print` em laço infinito roda devagar (cerca de 250 linhas por segundo), e o botão Parar corta.
- **Sincronia por localStorage, não por postMessage:** o painel pode ser aberto à mão, e o evento `storage` já é o caminho do estado principal (seção 7 do contrato). Detalhes na seção 8.
- **No OneCompiler embutido**, programas com `input` pedem a resposta no console do iframe do projetor; no Estender, isso pede levar o mouse para a tela do projetor. No editor offline, o `input` também pode ser respondido pelo painel.
- **Revisão de segurança (agente security-reviewer, sem CRITICAL nem HIGH):** o iframe do OneCompiler ganhou `sandbox` (scripts, origem própria, formulários, modais e popups; sem navegar a apresentação) e `referrerPolicy = no-referrer`. Os módulos do Skulpt passaram de lista negra para lista branca (`PI.aoVivo.moduloPermitido`: sys, math, random, time, string, re, itertools, collections, operator), porque `webbrowser` abria abas e `turtle` mexia na página. Versão, id de pedido e linha têm teto de 1e9 (um número gigante gravado por outra página local travaria os pedidos). O QR code mostra o aviso em vez de quebrar o slide se o link não couber.
- **Ficou de fora, de propósito:** operação nativa longa no Skulpt (`sum(range(10**10))`, `"a" * 10**10`) não para no botão Parar e congela a janela principal até terminar; rodar o Skulpt num Web Worker resolveria, mas não compensa para a aula. Content-Security-Policy por meta tag também ficou de fora (o Skulpt precisa de eval).

## 2026-11-18 (tarde): só o OneCompiler, com cola no painel (pedido do Walter)

- O editor offline (tecla E, Skulpt) saiu: o grupo vai usar o OneCompiler e o Windows em Estender, com o painel no notebook. `vendor/skulpt`, `js/ui/editor.js`, `js/ui/motor-skulpt.js` e `tests/skulpt.test.js` foram para `Documents\Claude\_para_apagar\editor-offline-2026-11-18`; a lógica de execução, input, tradução de erro e lista de módulos saiu de `js/logica/aovivo.js`. A tecla E ficou livre.
- O OneCompiler do projetor usa o tema claro (sem `theme=dark` na URL) e letra 28; o do painel, tema escuro e letra 18.
- O Walter digita ao vivo o código que o Enzo e o Gabriel apresentam: o OneCompiler abre com o último código digitado (para aproveitar o do slide anterior), e a cola do painel mostra o código do slide, o input e a saída esperada. Limpar zera nas duas telas; Código do slide preenche tudo de uma vez se o tempo apertar.
- A chave do estado virou `pi:aovivo:v2`, porque o formato mudou (sem `motor` e sem `execucao`).

## 2026-11-18 (noite): modo edição para mudar slides no dia (pedido do Walter, depois da crítica da professora)

- A professora achou o HTML duro de mudar no dia. O grupo não vai trocar de ferramenta, então a apresentação ganhou o modo edição (tecla E): mudar textos e código clicando neles, criar slide de texto ou de código, esconder slide, desfazer, exportar e importar.
- As alterações ficam no localStorage, por cima dos arquivos de `conteudo/`, que continuam sendo a fonte de verdade do roteiro e dos testes. Para levar a outro computador ou para o GitHub, usa-se o arquivo exportado. Os gabaritos (`scripts/conferir-gabaritos.py`) conferem só os arquivos, não as alterações feitas no navegador.
- Mudar um campo redesenha na hora; criar, esconder, desfazer e importar recarregam a página, porque mudam a lista de slides que várias partes usam.
- O modo é só da janela principal, porque o painel serve para apresentar. Por isso o modo fica na sessionStorage: recarregar a principal mantém o modo, e abrir de novo pelo duplo clique sai dele.
- A tecla E, que estava livre desde a saída do editor offline, passou a ser a do modo edição.
- Revisado pelos agentes security-reviewer (sem CRITICAL; o HIGH era esconder todos os slides e deixar a apresentação em branco) e typescript-reviewer (HIGH: edição perdida e teclas travadas se o palco redesenhasse no meio; desfazer um slide comum apagava os novos criados depois dele). Corrigidos, junto com os MEDIUM: os escondidos saem da lista também no modo edição (antes, a principal e o painel apontavam para slides diferentes), código com no máximo 30 linhas, título e item não ficam vazios, e o botão Restaurar cópia passou a usar a cópia guardada.
