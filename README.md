# Mestre do Estudo 📚

Aplicativo web de estudos adaptativo para educação básica (Português, Matemática e Inglês), inspirado no método Kumon: **progressão por domínio — o aluno só avança para o próximo módulo com 100% de acerto**. Correção de exercícios com IA gratuita (Gemini, Groq e OpenRouter com failover automático — sem cartão de crédito), personagem-tutor conversacional em Inglês e um motor adaptativo completo (perfil cognitivo, revisão espaçada, trilhas de reforço e missões + XP).

## Fases implementadas

### Fase 1 — MVP
- **Autenticação**: cadastro/login por email e senha (NextAuth), sessão persistente, papel **aluno** ou **responsável**.
- **3 matérias fixas**: `/portugues`, `/matematica`, `/ingles` com módulos em cadeia (bloqueado → em progresso → dominado).
- **Diagnóstico inicial**: teste curto por matéria que posiciona o aluno no módulo correto.
- **Motor de exercícios com IA**: múltipla escolha, preenchimento, dissertativa e fala (inglês); correção aponta o erro específico e dá nota 0–100.
- **Tutor de IA em Inglês**: "Sam", chat conversacional com voz (Web Speech API).
- **Dark mode**: toggle persistente.

### Fase 2 — Motor adaptativo
- **Perfil cognitivo** (`/api/cognitive`): velocidade, precisão, foco, memória, interpretação, lógica e persistência a partir dos logs + dicas.
- **Revisão espaçada** (`nextReviewAt`): 1 dia (<50%), 3 dias (50–99%), 7/14/30 dias ao atingir 100% — card "hora de revisar" no dashboard.
- **Trilhas de reforço** (`/api/reinforcement`): foca o tipo de erro dominante (gramatical, interpretação, cálculo, pronúncia…).
- **Geração dinâmica com IA** (`/api/generate`): botão "＋ Exercício novo (IA)" cria e persiste exercícios no padrão do módulo.
- **Missões + XP + Avatar**: XP por acerto/rodada/módulo/foco, nível com escala quadrática, 7 missões, mapa de conhecimento por habilidade e **avatar que evolui** (🥚 → 🐣 → 🦉 → 🦅 → 👑).

### Fase 3 — Ecossistema
- **Painel do responsável** (`/painel`): vincula alunos por email, métricas (exercícios, acerto, tempo, módulos), **alertas automáticos** (dificuldade <50%, erros recentes, revisões atrasadas, inatividade) e habilidades em dificuldade.
- **Modo concentração** (`/foco`): Pomodoro 25/5 com tela cheia e XP por minuto de foco.
- **Acessibilidade**: menu ♿ com alto contraste, escala de fonte 100/115/130% e navegação por teclado (skip-link + focus ring).

### Fase 4 — Tutor em português
- **Chat com tutor em PT-BR** (`/tutor`, `/api/tutor-pt`): explica Português, Matemática e Inglês de forma didática — linguagem simples, no máximo 4 frases, com exemplo e desafio final.
- Fallback automático offline: se a IA estiver indisponível, responde com orientações pré-definidas por matéria (nunca deixa o aluno sem retorno).
- Complementa o tutor em inglês "Sam" (Fase 1), focando no conteúdo em língua materna.

### Fase 5 — Simulado
- **Simulado por matéria** (`/simulado`, `api/simulado`): 10 questões sorteadas do banco do módulo, com cronômetro de 2 min por questão.
- **Correção na hora com IA** (`correctExercise`): nota 0–100 arredondada, placar de acertos e explicação de cada erro — tudo registrado no histórico (`exerciseLog`).

### Fase 6 — Relatórios semanais
- **Análise por semana** (`/relatorios`, `lib/report.ts`): exercícios, taxa de acerto, tempo de estudo, dias distintos e módulos dominados nas últimas semanas (gráficos com Recharts).
- **Alertas automáticos** (`weeklyAlerts`): semana sem exercícios, acerto < 50%, estudo concentrado em 1 dia e nenhum módulo dominado.
- **Envio por e-mail** (`api/report/email`): relatório formatado em HTML via `sendEmail` (Resend quando configurado; modo dev sem chave).

### Fase 7 — Recuperação de senha
- **Fluxo de redefinição** (`/esqueci-senha` + `/redefinir-senha`): token único de 32 bytes (guardado como SHA-256, nunca em texto puro) com validade de 1 hora.
- **API segura**: `api/auth/esqueci` não revela se o email existe; `api/auth/redefinir` aceita o token uma única vez e atualiza o hash bcrypt.

## Stack

Next.js 14 (App Router) + TypeScript · Tailwind CSS · Prisma ORM · PostgreSQL · NextAuth · IA multi-provedor gratuita (Gemini/Groq/OpenRouter) · Recharts · Vitest

## Como rodar (local)

### Banco: PostgreSQL

O app usa PostgreSQL em dev e prod. Há duas opções:

**Opção A — Postgres nativo (Windows, sem instalar nada no sistema):**
O script baixa e inicializa os binários oficiais em `C:\Users\<você>\.mestre-postgres` (fora do projeto, para não sincronizar no OneDrive). O Postgres inicia "destacado" do terminal (via WMI), então continua rodando depois do comando.

```bash
npm install
npm run db:setup      # inicia o Postgres, cria o banco, aplica schema e seed
npm run db:start      # só inicia o Postgres (porta 5432)
npm run db:stop       # para o Postgres
npm run db:status     # checa se está aceitando conexões
npm run dev           # http://localhost:3000
```

**Opção B — Docker (qualquer sistema):**
```bash
docker compose up -d        # sobe Postgres 16 na 5432
npx prisma db push
npx prisma db seed
npm run dev
```

> Se você estava no SQLite antes, os dados não migram automaticamente — rode o seed para popular o conteúdo pedagógico (3 matérias, 72 exercícios) e recrie usuários.

### Ativando a IA (100% gratuita, sem cartão de crédito)

Sem chave, o app funciona com um **corretor local de fallback**. Com chaves, usa **failover automático**: tenta Gemini → Groq → OpenRouter e, quando um provedor esgota a cota (429), pausa e troca para o próximo — o aluno nunca vê erro.

1. **Gemini (recomendado)**: https://aistudio.google.com/apikey (sem cartão). Múltiplas chaves separadas por vírgula multiplicam a cota.
2. **Groq**: https://console.groq.com/keys (sem cartão, cota generosa).
3. **OpenRouter**: https://openrouter.ai/keys — use modelos com sufixo `:free`.

```env
GEMINI_API_KEYS="sua-chave-1,sua-chave-2"
GROQ_API_KEY="sua-chave-groq"
OPENROUTER_API_KEY="sua-chave-openrouter"
```

## Produção (Vercel + Neon)

1. Crie um banco PostgreSQL gratuito no **Neon** (https://neon.tech) e copie a URL de conexão.
2. No painel da **Vercel** (https://vercel.com): `New Project` → importe o repositório. Em *Settings → Environment Variables* adicione:
   - `DATABASE_URL` (URL do Neon, com `?sslmode=require`)
   - `NEXTAUTH_SECRET` (rode `npx auth secret` ou gere um aleatório)
   - `NEXTAUTH_URL` = `https://SEU-DOMINIO.vercel.app`
   - `GEMINI_API_KEYS`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`
   - `RESEND_API_KEY` e `EMAIL_FROM` (opcional) — para envio real dos e-mails de recuperação de senha e relatórios semanais
3. Antes de publicar, aplique o schema no banco da nuvem:
   ```bash
   npx prisma db push      # apontando DATABASE_URL para o Neon
   npx prisma db seed
   ```
4. O `postinstall` roda `prisma generate` automaticamente no build; `vercel.json` garante runtime Node.js (Prisma não roda no Edge).

## Testes

```bash
npm test   # vitest — 14 suítes: progressão, IA (failover), perfil cognitivo, revisão espaçada,
           # reforço, gerador IA, missões/XP, avatar, foco, painel do responsável, acessibilidade,
           # simulado, recuperação de senha e tutor em português (84 testes)
```

## Estrutura

```
app/
  api/            # rotas de API (auth, esqueci/redefinir, register, run, diagnostic, student,
                  # tutor, tutor-pt, simulado, report/report-email, cognitive, reinforcement,
                  # generate, focus, parent/link)
  dashboard/      # visão geral (gráficos, revisões, missões, mapa, avatar)
  painel/         # painel do responsável
  foco/           # Pomodoro
  tutor/          # chat com tutor em português
  simulado/       # simulado com cronômetro e correção na hora
  relatorios/     # análise semanal do responsável
  esqueci-senha/  # solicitação de redefinição de senha
  redefinir-senha/# gerência de senha via token
  [subject]...    # páginas das matérias e dos módulos (SSR)
components/       # UI, motor de exercícios, chat de tutor (PT/EN), avatar, mapas, acessibilidade
lib/
  ai.ts            # IA multi-provedor gratuita (failover) + fallback local
  progression.ts   # regra de progressão (pura, testada)
  cognitive.ts     # perfil cognitivo
  spaced.ts        # revisão espaçada
  reinforcement.ts # trilhas de reforço
  generator.ts     # gerador de exercícios (IA)
  xp.ts            # XP, níveis e missões
  avatar.ts        # estágios do avatar
  focus.ts         # pomodoro + XP de foco
  parent.ts        # resumo/alertas do responsável
  accessibility.ts # contraste e escala de fonte
  tutor.ts         # tutor em português (fallback offline)
  simulado.ts      # montagem e nota do simulado
  report.ts        # relatório semanal e alertas
  reset.ts         # token/hash/TTL de recuperação de senha
  email.ts         # envio transacional (Resend / modo dev)
prisma/
  schema.prisma    # Student, Subject, Module, MicroSkill, Exercise, Progress, ExercícioLog,
                   # CognitiveProfile, FocusSession, ParentStudent
  seed.js          # conteúdo pedagógico inicial
scripts/
  db.ps1          # gerencia o Postgres nativo local (start/stop/setup)
docker-compose.yml # Postgres via Docker (ambiente alternativo)
tests/             # regras de negócio puras (vitest)
```