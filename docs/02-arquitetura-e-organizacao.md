# 02 - Arquitetura e organização

## Visão geral

O projeto está dividido em:

- Frontend React em [app/](../app)
- Backend NestJS em [backend/src/](../backend/src)
- Banco modelado com Prisma em [backend/prisma/schema.prisma](../backend/prisma/schema.prisma)

## Estrutura principal

- [README.md](../README.md): entrada da documentação
- [TODO.md](../TODO.md): backlog funcional
- [app/routes.ts](../app/routes.ts): mapa de rotas do frontend
- [app/lib/api.ts](../app/lib/api.ts): cliente HTTP da API
- [backend/src/main.ts](../backend/src/main.ts): bootstrap Nest, CORS, prefixo `/api`
- [backend/src/app.module.ts](../backend/src/app.module.ts): composição dos módulos

## Módulos do backend

- `health`: health check
- `inventario`: CRUD de inventário e unidades físicas
- `kits`: CRUD de kits e itens de kit
- `movimentacoes`: saída/devolução e histórico de movimentações
- `movements`: visão agregada/filtrável dos eventos
- `prisma`: conexão e ciclo de vida do Prisma Client

## Rotas do frontend

Definidas em [app/routes.ts](../app/routes.ts):

- `/` → Relatórios
- `/inventario` → Inventário
- `/kits` → Kits
- `/movimentacoes` → Movimentações
- `/configuracoes` → Configurações

## Fluxo de dados

1. Tela React chama funções de [app/lib/api.ts](../app/lib/api.ts)
2. API Nest recebe em `/api/*`
3. DTOs validam payload
4. Services executam regras de negócio
5. Prisma persiste/lê no PostgreSQL
6. Backend responde JSON ao frontend
