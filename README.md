<h1 align="center"> Almoxarifado TV Cultura</h1>

<div align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/6910f0503efdd315c8f9b858234310c06e04d9c0/icons/react/react-original.svg" height="30" alt="react logo"  />
  <img width="12" />
  <img src="https://raw.githubusercontent.com/devicons/devicon/6910f0503efdd315c8f9b858234310c06e04d9c0/icons/typescript/typescript-original.svg" height="30" alt="typescript logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" height="30" alt="postgresql logo"  />
  <img width="12" />
  <img src="https://cdn.simpleicons.org/reactrouter" height="30" alt="react-router"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg" height="30" alt="vite-logo"  />
  <img width="12" />
  <img src="https://cdn.simpleicons.org/tailwindcss" height="30" alt="tailwind-logo" >
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" height="30" alt="npm-logo"  />
  <img width="12" />
</div>

## 🔐 Visão Geral

Aplicação para gerenciar kits e movimentações de inventário (câmeras, baterias, equipamentos), com fluxo previsto em [TODO.md](TODO.md).

### Tecnologias

- React 19 + React Router 7
- TypeScript + Vite
- Tailwind CSS
- NestJS + Prisma + PostgreSQL

## 📁 Estrutura do projeto

- `app/` : código principal do frontend
  - `root.tsx` : layout global, meta, links, `ErrorBoundary`
  - `routes.ts` : configuração de rota index para `routes/home.tsx`
  - `routes/home.tsx` : página inicial (`Welcome`)
  - `welcome/welcome.tsx` : tela de boas-vindas com recursos e links
- `public/` : ativos estáticos
- `TODO.md` : backlog de features, fluxos e prioridades
- `package.json` / `vite.config.ts` / `tsconfig.json` : configuração do build e deps

## ⚙️ Instalação local

```bash
npm i
npm run dev
```

Acesse a porta que o Vite indicar.

### Compilação para produção

```bash
npm run build
npm run start
```

## 🧩 Scripts úteis

- `npm run dev` : ambiente de desenvolvimento
- `npm run build` : build de produção (React Router)
- `npm run start` : serve o build com `react-router-serve`
- `npm run typecheck` : `react-router` typegen + `tsc`
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

## 🗂️ Banco de dados

O backend usa Prisma com PostgreSQL (ver `backend/prisma/schema.prisma`).

## 🛠️ Próximas etapas

### As próximas etapas estão em

### [TODO.md](TODO.md)

## 📚 Documentação
