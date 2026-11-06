# Monitor da Portaria → notificação no iPhone

Um robô gratuito no GitHub abre o site da portaria a cada 10 minutos. Quando o status
muda para **"entregando encomendas"**, você recebe uma notificação no iPhone.
Nada roda no celular, então não gasta bateria.

## 1. No iPhone: app de notificação
1. Instale o app **ntfy** (gratuito na App Store).
2. Toque em **+** e assine um tópico com um nome difícil de adivinhar,
   por exemplo `portaria-primavera-x7k29q`. Qualquer pessoa que souber esse nome recebe as mesmas notificações.
3. Permita as notificações.

## 2. No GitHub (dá para fazer pelo navegador do celular)
1. Crie uma conta em github.com, se ainda não tiver.
2. Crie um repositório novo (pode ser **privado**), ex.: `portaria-monitor`.
3. Envie os arquivos desta pasta mantendo a estrutura:
   - `monitor.mjs`
   - `.github/workflows/monitor.yml`
4. Em **Settings → Secrets and variables → Actions → New repository secret**:
   - Nome: `NTFY_TOPIC`
   - Valor: o nome do tópico do passo 1 (ex.: `portaria-primavera-x7k29q`)
5. Vá na aba **Actions**, abra "Monitor da portaria" e clique em **Run workflow** para testar.
   No log aparece o "Trecho da página", que mostra se o robô está lendo o status.

## Ajustes
- **Intervalo:** no `monitor.yml`, troque `sleep 600` por `sleep 1200` para checar a cada 20 minutos.
- **Pausar:** em Actions → Monitor da portaria → `...` → **Disable workflow**. Para religar, **Enable workflow** e **Run workflow**.
- O repositório precisa ser **público** (minutos ilimitados no GitHub). O nome do tópico continua secreto.
- **Página:** por padrão o robô lê `/publico`. Se o status aparecer só em `/status-live`, troque a URL no topo do `monitor.mjs`.
- **Outros status:** a regra está na linha `ALVO`. Exemplo: `/pausa|ronda/i`.
- Se as notificações pararem, veja a aba Actions: deve haver sempre uma rodada em andamento.
