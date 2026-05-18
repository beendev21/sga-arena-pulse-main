# SGA Arena  — Santos Games Arena

![SGA Logo](https://santos-games.com/encontre-um-time/assets/sga-logo-B5SOul8E.png)

A **SGA Arena** é a plataforma oficial da Santos Games Arena, projetada para gerenciar o ecossistema competitivo de e-sports, com foco em títulos como **CS2, Valorant e CS**. O sistema oferece uma experiência imersiva com estética *cyberpunk/tactical HUD*, integrando dados em tempo real de campeonatos, rankings de elite e dossiês detalhados de jogadores.

## 🚀 Tecnologias Utilizadas

Este projeto utiliza uma stack moderna de alto desempenho:

- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Roteamento:** [TanStack Router](https://tanstack.com/router/latest) (File-based routing)
- **Gerenciamento de Estado:** [Zustand](https://zustand-demo.pmnd.rs/) (Auth & Global UI)
- **Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Feedback:** [Sonner](https://sonner.emilkowal.ski/) (Toasts)

## ✨ Funcionalidades Principais

### 🎮 Para Jogadores e Fãs
- **Live Hub:** Acompanhe partidas ao vivo, agendadas e resultados históricos com sincronização de satélite.
- **Dossiê do Agente:** Perfis detalhados de jogadores com estatísticas avançadas (KDA, ADR, Rating, HS%).
- **Ranking de Elite:** Leaderboards oficiais de times e jogadores baseados em desempenho competitivo real.
- **Chaveamentos (Brackets):** Visualização profissional de árvores de torneios (Eliminação Simples e Dupla).
- **Galeria de Glória:** Destaques (highlights) em vídeo e fotos dos melhores momentos da arena.

### 🛡️ Para Administradores
- **Dashboard de Controle:** Painel central para gestão de campeonatos, times e atletas.
- **Gestão de Chaveamento:** Interface *drag-and-drop* para organizar playoffs e avançar vencedores.
- **Roster Lock:** Controle de inscrições e transferências de jogadores entre equipes.
- **Sincronização de Dados:** Interface direta para atualização de estatísticas de partidas e mapas.

## 🛠️ Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone <https://github.com/seu-usuario/sga-arena-pulse.git>
    cd sga-arena-pulse
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto com a URL da sua API:
    ```env
    VITE_API_URL=<https://sua-api-sga.com>
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 📁 Estrutura de Pastas

- `/src/routes`: Definição de rotas utilizando o sistema de arquivos do TanStack Router.
- `/src/components/sga`: Componentes customizados com a identidade visual da SGA (StatsCard, MatchCard, Bracket).
- `/src/components/ui`: Componentes base da biblioteca Shadcn/UI.
- `/src/store`: Gerenciamento de estado global (Ex: `auth.ts`).
- `/src/API`: Controladores e serviços de integração com o backend.
- `/src/lib`: Funções utilitárias, formatação de datas e lógica de normalização de dados.

## 🎨 Interface Visual

O design foi construído sobre o conceito de **Tactical HUD**, utilizando:
- Grids de fundo e overlays de ruído analógico.
- Gradientes radiais focados em legibilidade e contraste.
- Animações de "scanning" e transições de página suaves com Framer Motion.
- Tipografia voltada para alta performance e leitura rápida de dados técnicos.

---
Desenvolvido por **Breno Silva e Willian Chiquinato**.
