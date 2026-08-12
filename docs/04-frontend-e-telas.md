# 04 - Frontend e telas

## Organização

- Rotas: [app/routes.ts](../app/routes.ts)
- Layout principal: [app/components/Layout.tsx](../app/components/Layout.tsx)
- Cliente API: [app/lib/api.ts](../app/lib/api.ts)

## Estrutura do frontend

A pasta [app](../app) contém a interface web da aplicação, construída em React Router + TypeScript. O frontend é organizado em camadas para separar layout, rotas, telas e acesso à API.

### Pastas e arquivos principais

- [app/root.tsx](../app/root.tsx): ponto de entrada da aplicação. Define o layout global do HTML e o erro de rota.
- [app/routes.ts](../app/routes.ts): registra todas as rotas da aplicação e quais arquivos de tela cada rota usa.
- [app/components/Layout.tsx](../app/components/Layout.tsx): menu lateral, cabeçalho, layout visual e navegação entre páginas.
- [app/routes](../app/routes): telas da aplicação, uma por página funcional.
  - [app/routes/Reports.tsx](../app/routes/Reports.tsx): dashboard e relatórios.
  - [app/routes/Inventory.tsx](../app/routes/Inventory.tsx): gestão de itens do inventário.
  - [app/routes/Kits.tsx](../app/routes/Kits.tsx): cadastro e controle de kits.
  - [app/routes/Movements.tsx](../app/routes/Movements.tsx): histórico e movimentações.
  - [app/routes/Settings.tsx](../app/routes/Settings.tsx): preferências e configurações locais.
- [app/lib/api.ts](../app/lib/api.ts): centraliza todas as chamadas HTTP para a API backend.
- [app/styles](../app/styles): estilos globais, tema e fontes.
- [app/components/ui](../app/components/ui): componentes reutilizáveis da interface, baseados em shadcn/ui.

### Como o fluxo funciona na prática

1. O usuário acessa uma rota, por exemplo `/inventario`.
2. O React Router resolve qual tela abrir, conforme [app/routes.ts](../app/routes.ts).
3. A tela usa funções do cliente API em [app/lib/api.ts](../app/lib/api.ts) para buscar ou enviar dados ao backend.
4. O backend responde em JSON e a tela renderiza os dados na interface.

Em outras palavras: a rota decide qual tela abrir, a tela consulta a API, e o layout garante a navegação e visual consistente de todas as páginas.

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
