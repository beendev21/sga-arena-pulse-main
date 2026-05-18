# 🎮 SGA Arena 

Plataforma web para acompanhamento de campeonatos de e-sports. O sistema exibe torneios, partidas, rankings, estatísticas de jogadores e equipes em tempo real, com área pública e painel administrativo.
---

## 📌 Sobre

Plataforma: https://prime.santos-games.com/

Este projeto foi desenvolvido como freelance. O escopo de entrega foi o **frontend completo**, integrado a uma API REST e infraestrutura de backend fornecidas pelo cliente.

---

## 🖥️ Front-End

Interface web construída em **React 19** com **TypeScript**, focada em performance, responsividade e atualização em tempo real.

**Tecnologias utilizadas:**

- **React 19** com **TypeScript** — base da aplicação
- **TanStack Router** — roteamento file-based com suporte a SSR
- **TanStack Query** — gerenciamento de dados, cache e sincronização com a API
- **Tailwind CSS 4** — estilização utilitária
- **shadcn/ui + Radix UI** — componentes de interface acessíveis
- **Framer Motion** — animações e transições
- **Zustand** — estado global de autenticação
- **Recharts** — gráficos e visualizações de estatísticas
- **React Hook Form + Zod** — formulários com validação tipada
- **Vite** — bundler e dev server

**Páginas:**

- **Home** — visão geral com torneios, partidas recentes e ranking
- **Torneios** — listagem e detalhes de campeonatos
- **Partidas** — resultados e partidas ao vivo
- **Chaveamento (Bracket)** — visualização de eliminatórias
- **Equipes** — times participantes
- **Jogadores** — perfis e estatísticas individuais
- **Galeria / Destaques** — conteúdo de mídia
- **Login / Cadastro** — autenticação de usuários
- **Perfil** — área do usuário logado
- **Admin** — painel administrativo restrito

---

## ⚙️ Back-End

O backend foi fornecido pelo cliente. A arquitetura é composta por:

- **.NET API** — responsável por autenticação (JWT), regras de negócio, integração com a Steam API e gerenciamento de campeonatos
- **Background Worker** — serviço que roda em segundo plano para persistência de eventos de partida e processamento do motor de jogo (Match Engine)
- **Event API** — recebe eventos em tempo real capturados no computador do jogador e os encaminha para processamento
- **SignalR Gateway** — camada de comunicação em tempo real entre o backend e os frontends, responsável por empurrar atualizações de placar, rounds e eventos instantaneamente para os clientes conectados
- **Redis** — utilizado para cache, Pub/Sub, filas de processamento e stream processing dos eventos de jogo

---

## 🗄️ Banco de Dados

- **PostgreSQL** — banco de dados relacional principal, armazena jogadores, times, torneios, partidas e histórico de rounds. A escrita é feita principalmente pelo Background Worker
- **Cloudflare R2** — armazenamento de mídia (imagens, logos, highlights)

---

## 🔌 API

O frontend se comunica com a API via **REST**, autenticando todas as requisições protegidas com **JWT (Bearer Token)**. A URL base é configurada via variável de ambiente `VITE_API_URL`.

Os perfis de acesso controlam o que cada usuário pode ver e fazer:

| Perfil | Acesso |
|---|---|
| Visitante | Área pública |
| Jogador | Área pública + perfil próprio |
| Administrador | Acesso total + painel admin |

---

## 🚀 Deploy

Preparado para deploy em **Cloudflare Workers** (via Wrangler) ou **Docker**.

---

## 📄 Licença

© 2026 Santos Games Arena. Todos os direitos reservados.

Este repositório é de uso privado. É proibida a reprodução, distribuição ou uso do código sem autorização expressa da Santos Games Arena.
