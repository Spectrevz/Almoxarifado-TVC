# 04 - Frontend e telas

## Organização

- Rotas: [app/routes.ts](../app/routes.ts)
- Layout principal: [app/components/Layout.tsx](../app/components/Layout.tsx)
- Cliente API: [app/lib/api.ts](../app/lib/api.ts)

## Navegação

Itens de navegação principais:
- Relatórios (`/`)
- Movimentações (`/movimentacoes`)
- Inventário (`/inventario`)
- Kits (`/kits`)
- Configurações (`/configuracoes`)

## Cliente HTTP e ambiente

Arquivo: [app/lib/api.ts](../app/lib/api.ts)

- Base URL padrão: `http://localhost:3001/api`
- Override opcional por `VITE_API_URL`
- `apiRequest` lança erro para qualquer status não-2xx
- Serializa payload JSON e suporta query params

## Tela de Inventário

Arquivo: [Inventory.tsx](../app/routes/Inventory.tsx)

Responsabilidades:
- Listar inventário com unidades físicas
- Filtrar por categoria e busca
- Criar item com múltiplas unidades
- Marcar unidade em manutenção
- Remover unidade ou item completo

Integrações API:
- `listInventario`
- `createInventario`
- `createUnidadeInventario`
- `updateUnidadeInventario`
- `deleteUnidadeInventario`
- `deleteInventario`

## Tela de Kits

Arquivo: [Kits.tsx](../app/routes/Kits.tsx)

Responsabilidades:
- Listar kits com status (disponível/fora/manutenção)
- Criar kit a partir de unidades do inventário
- Editar itens/quantidades do kit
- Exibir uso recente a partir das movimentações

Integrações API:
- `listKits`
- `createKit`
- `updateKit`
- `createKitItem`
- `updateKitItem`
- `deleteKitItem`
- `listInventario`
- `listMovimentacoes`

## Tela de Movimentações

Arquivo: [Movements.tsx](../app/routes/Movements.tsx)

Responsabilidades:
- Histórico completo e abas (histórico, saídas, devoluções, kits fora)
- Registrar saída de kit
- Finalizar devolução
- Busca/filtros por tipo, status e período

Integrações API:
- `listMovements`
- `listKits`
- `createMovimentacao`
- `finalizeMovimentacao`

## Tela de Relatórios

Arquivo: [Reports.tsx](../app/routes/Reports.tsx)

Responsabilidades:
- KPIs de kits disponíveis/fora
- Série temporal de entradas/saídas (Recharts)
- Resumo de movimentações recentes

Integrações API:
- `listMovements`
- `listKits`

## Tela de Configurações

Arquivo: [Settings.tsx](../app/routes/Settings.tsx)

Estado atual:
- UI local para preferências (tema/notificações/autosave)
- Sem persistência no backend (apenas estado local/log)
