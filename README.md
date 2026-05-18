# 🎮 SGA Arena Pulse

> Plataforma oficial da **Santos Games Arena** — acompanhe campeonatos, partidas, rankings e estatísticas de jogadores de CS2, Valorant e CS em tempo real.

---

## 📋 Sobre o Projeto

O **SGA Arena Pulse** é o frontend da Santos Games Arena, uma plataforma de e-sports desenvolvida para gerenciar e exibir torneios, partidas, equipes e jogadores. A interface consome uma API REST externa e oferece tanto uma área pública (acessível a qualquer visitante) quanto um painel administrativo restrito a usuários autenticados.

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Versão | Função |
|---|---|---|
| React | 19 | Biblioteca de UI |
| TypeScript | 5.8 | Tipagem estática |
| TanStack Router | 1.x | Roteamento file-based |
| TanStack Query | 5.x | Cache e gerenciamento de estado do servidor |
| Tailwind CSS | 4.x | Estilização utilitária |
| shadcn/ui + Radix UI | — | Componentes de interface |
| Framer Motion | 12.x | Animações |
| Zustand | 5.x | Gerenciamento de estado global (autenticação) |
| Recharts | 2.x | Gráficos e visualizações |
| React Hook Form + Zod | — | Formulários e validação |
| Vite | 7.x | Bundler e dev server |

### Deploy / Infraestrutura
| Tecnologia | Função |
|---|---|
| Cloudflare Workers | Runtime de produção (via Wrangler) |
| Docker | Containerização para deploy alternativo |
| Node.js 22 | Runtime de build |

---

## 🔌 API & Backend

O frontend se comunica exclusivamente com uma **API REST externa** — o backend **não está incluído** neste repositório.

### URL Base

```
https://app.santos-games.com
```

Pode ser sobrescrita via variável de ambiente:

```env
VITE_API_URL=https://sua-api.exemplo.com
```

### Autenticação

A autenticação é feita via **JWT (Bearer Token)**. Após o login, o token é armazenado no `localStorage` (persistido via Zustand) e no `sessionStorage`, e enviado automaticamente no header `Authorization` de todas as requisições autenticadas.

```
Authorization: Bearer <token>
```

Ao receber um erro `401` com `Token has expired`, o usuário é redirecionado automaticamente para `/login`.

### Módulo de Serviço (`src/API/service.tsx`)

Camada de abstração sobre o `fetch` nativo, com suporte a:

- `GET`, `POST`, `PUT`, `DELETE`
- Upload de imagens via `multipart/form-data`
- Tratamento padronizado de erros (compatível com o padrão Problem Details do ASP.NET)
- Injeção automática do token de autenticação

### Controller Genérico (`src/API/controler.tsx`)

Hook `useApiController(entityName)` que expõe operações CRUD padronizadas para qualquer entidade da API:

```ts
const { getAll, getById, create, update, remove } = useApiController("tournaments");
```

### Endpoints Utilizados (exemplos)

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login de usuário |
| GET | `/api/tournaments` | Listar torneios |
| GET | `/api/matches` | Listar partidas |
| GET | `/api/players` | Listar jogadores |
| GET | `/api/teams` | Listar equipes |
| GET | `/api/roles` | Listar funções/roles |
| GET | `/api/participants` | Listar participantes |

> O contrato completo da API é definido pelo backend (ASP.NET). Os erros de validação seguem o padrão `Problem Details` com o campo `errors`.

---

## 🗄️ Banco de Dados

O banco de dados é gerenciado inteiramente pelo **backend** e não é acessado diretamente pelo frontend. As entidades principais inferidas pelo consumo da API são:

- **Users** — usuários com roles (`Administrador`, `Jogador`)
- **Tournaments** — torneios com status (Agendado, Ao vivo, Encerrado)
- **Matches** — partidas vinculadas a torneios
- **Teams** — equipes participantes
- **Players** — jogadores com estatísticas
- **Participants** — relação entre jogadores, equipes e roles
- **Roles** — funções dos jogadores (ex: IGL, Sniper, etc.)
- **Gallery / Highlights** — conteúdo de mídia

---

## 📁 Estrutura do Projeto

```
src/
├── API/
│   ├── service.tsx        # Cliente HTTP (fetch wrapper)
│   └── controler.tsx      # Hook CRUD genérico
├── components/
│   ├── sga/               # Componentes de domínio (MatchCard, Bracket, etc.)
│   └── ui/                # Componentes base (shadcn/ui)
├── lib/
│   ├── api.ts             # Utilitários de unwrap de listas
│   ├── publicApi.ts       # Mappers para dados públicos
│   └── dateUtils.ts       # Helpers de data
├── routes/                # Páginas (file-based routing via TanStack Router)
│   ├── index.tsx          # Home pública
│   ├── matches.tsx        # Listagem de partidas
│   ├── tournaments.tsx    # Torneios
│   ├── players.tsx        # Jogadores
│   ├── teams.tsx          # Equipes
│   ├── bracket.tsx        # Chaveamento
│   ├── gallery.tsx        # Galeria
│   ├── highlights.tsx     # Destaques
│   ├── login.tsx          # Autenticação
│   ├── register.tsx       # Cadastro
│   ├── profile.tsx        # Perfil do usuário
│   └── admin.tsx          # Painel administrativo
├── store/
│   └── auth.ts            # Store Zustand de autenticação
├── hooks/                 # Hooks customizados
└── server.ts              # Entry point Cloudflare Workers
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js `22.x`
- npm ou bun

### Instalação

```bash
git clone https://github.com/seu-usuario/sga-arena-pulse.git
cd sga-arena-pulse
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_API_URL=https://app.santos-games.com
```

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

---

## 🐳 Deploy com Docker

```bash
docker build -t sga-arena-pulse .
docker run -p 3000:3000 -e VITE_API_URL=https://app.santos-games.com sga-arena-pulse
```

---

## ☁️ Deploy no Cloudflare Workers

```bash
npm run build
npx wrangler deploy
```

Configurações em `wrangler.jsonc`.

---

## 👥 Perfis de Usuário

| Role | Acesso |
|---|---|
| Visitante | Área pública (home, partidas, torneios, jogadores, equipes, galeria) |
| Jogador | Área pública + perfil próprio |
| Administrador | Tudo acima + painel de administração completo |

---

## 📄 Licença

Projeto privado — Santos Games Arena. Todos os direitos reservados.
