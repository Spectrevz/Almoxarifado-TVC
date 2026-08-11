# 06 - Scripts e operação diária

## Scripts da raiz

Arquivo de referência: [package.json](../package.json)

- `npm run dev` -> sobe só frontend
- `npm run dev:frontend` -> frontend em desenvolvimento
- `npm run backend` -> backend em desenvolvimento (`backend/src/main.ts`)
- `npm run dev:full` -> frontend + backend juntos
- `npm run build` -> build frontend
- `npm run start` -> servir build frontend
- `npm run typecheck` -> typecheck frontend

### Prisma (encaminhados para backend)

- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:migrate:dev`
- `npm run prisma:seed`
- `npm run prisma:studio`
- `npm run setup:db`

## Scripts do backend

Arquivo de referência: [backend/package.json](../backend/package.json)

- `npm run start:dev` -> backend com watch (tsx)
- `npm run build` -> compila TypeScript backend
- `npm run start` -> executa `dist/main.js`
- `npm run typecheck` -> valida tipos backend

## Rotina de desenvolvimento sugerida

1. Atualizar código:

```bash
git pull
```

2. Garantir dependências:

```bash
npm install
```

3. Garantir banco atualizado:

```bash
npm run setup:db
```

4. Subir ambiente:

```bash
npm run dev:full
```

## Deploy local simplificado (produção simulada)

```bash
npm run build
npm run backend:build
npm run backend:start
npm run start
```

## Checklist rápido de troubleshooting

- Backend não sobe:
  - validar [`.env`](../.env) e [`backend/.env`](../backend/.env)
  - testar `npm run prisma:generate`
  - testar `npm run prisma:migrate`

- Frontend sem dados:
  - confirmar backend em `localhost:3001`
  - testar `GET /api/health`
  - revisar `VITE_API_URL` se estiver usando URL customizada
