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
