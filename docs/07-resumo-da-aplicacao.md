# 07 - Resumo da aplicação

## Visão geral

O Almoxarifado TV Cultura é uma aplicação para gestão de inventário, kits e movimentações de equipamentos. A solução foi pensada em duas camadas:

- Frontend em React Router + TypeScript
- Backend em NestJS + Prisma + PostgreSQL

A comunicação entre as camadas acontece via API REST, com o backend exposto em `/api` e o frontend consumindo esse contrato para renderizar as telas.

## Stack e divisão de responsabilidades

### Frontend

Local: [app](../app)

Responsável por:
- renderizar a interface do usuário
- controlar navegação entre páginas
- exibir relatórios e dados em tempo real
- chamar a API do backend

Principais pontos:
- [app/root.tsx](../app/root.tsx): inicialização/estrutura global
- [app/routes.ts](../app/routes.ts): mapeamento das rotas
- [app/components/Layout.tsx](../app/components/Layout.tsx): layout com sidebar e header
- [app/lib/api.ts](../app/lib/api.ts): cliente HTTP para a API
- [app/routes](../app/routes): telas da aplicação

### Backend

Local: [backend/src](../backend/src)

Responsável por:
- receber requests HTTP
- validar dados de entrada
- aplicar regras de negócio
- conversar com o banco via Prisma
- devolver JSON para o frontend

Principais pontos:
- [backend/src/main.ts](../backend/src/main.ts): bootstrap da API
- [backend/src/app.module.ts](../backend/src/app.module.ts): registro dos módulos
- [backend/src/prisma/prisma.service.ts](../backend/src/prisma/prisma.service.ts): conexão com o banco
- [backend/src/inventario](../backend/src/inventario): inventário
- [backend/src/kits](../backend/src/kits): kits
- [backend/src/movimentacoes](../backend/src/movimentacoes): movimentações
- [backend/src/movements](../backend/src/movements): leitura agregada para relatórios e filtros

### Banco de dados

Local: [backend/prisma/schema.prisma](../backend/prisma/schema.prisma)

Responsável por:
- modelar as entidades do negócio
- guardar registros de inventário, kits, unidades e movimentações
- facilitar a manutenção por migrações e Prisma Client

Entidades principais:
- `Inventario`
- `Unidadeinventario`
- `Kit`
- `Kititem`
- `Movimentacao`
- `Movimentacaoitem`
- `Movimentacaohistorico`

---

## Fluxo real da aplicação

### 1) O usuário acessa a aplicação

Ao abrir o frontend, o React Router resolve a rota atual. As páginas principais são:

- `/` → Relatórios
- `/inventario` → Inventário
- `/kits` → Kits
- `/movimentacoes` → Movimentações
- `/configuracoes` → Configurações

A navegação é controlada por [app/routes.ts](../app/routes.ts) e pelo layout em [app/components/Layout.tsx](../app/components/Layout.tsx).

### 2) A tela chama a API

A tela usa funções do cliente HTTP em [app/lib/api.ts](../app/lib/api.ts), por exemplo:

- `listInventario()`
- `listKits()`
- `listMovements()`
- `createMovimentacao()`
- `finalizeMovimentacao()`

Essas funções montam a URL base e enviam requests para o backend em `http://localhost:3001/api`.

### 3) O backend recebe a request

O NestJS inicializa em [backend/src/main.ts](../backend/src/main.ts) e registra um prefixo global `/api`.

Cada módulo do backend recebe uma rota específica, como:

- `GET /api/health`
- `GET /api/inventario`
- `POST /api/inventario`
- `GET /api/kits`
- `POST /api/movimentacoes`
- `PATCH /api/movimentacoes/:id/devolucao`

### 4) Controller delega para o service

O controller recebe a request e repassa para o service correspondente.

Exemplo real:
- [backend/src/inventario/inventario.controller.ts](../backend/src/inventario/inventario.controller.ts)
- [backend/src/inventario/inventario.service.ts](../backend/src/inventario/inventario.service.ts)

O service aplica a regra de negócio, valida contexto e decide se vai criar, atualizar, excluir ou consultar dados.

### 5) Prisma acessa o PostgreSQL

O service usa o Prisma Service, definido em:

- [backend/src/prisma/prisma.service.ts](../backend/src/prisma/prisma.service.ts)

Esse service expõe `PrismaClient`, que consulta e persiste os dados nas tabelas do banco.

Exemplo do fluxo:

- tela acessa inventário
- backend chama `prisma.inventario.findMany()`
- Prisma busca registros na tabela `Inventario`
- backend retorna array JSON
- frontend renderiza os dados na tela

### 6) O frontend renderiza o resultado

A tela recebe os dados em JSON e monta a interface:

- cards de resumo
- listas de itens
- filtros e busca
- histórico de movimentações
- gráficos e métricas

Isso é o que transforma a aplicação em um sistema funcional de gestão operacional.

---

## O que cada área do sistema faz

### Inventário

Faz a gestão dos itens físicos e suas unidades.

Funcionalidades:
- cadastrar itens
- associar unidades físicas
- controlar status de cada unidade
- remover ou atualizar item/unidade

### Kits

Agrupa itens do inventário em conjuntos lógicos.

Funcionalidades:
- criar kit
- adicionar/remover itens do kit
- controlar quantidade de cada item
- sinalizar se está em uso ou disponível

### Movimentações

Responsável por registrar saídas e devoluções.

Funcionalidades:
- registrar saída de kit
- registrar devolução
- manter histórico de eventos
- atualizar status de kit como `usando` ou `disponível`

### Relatórios

A tela de relatórios consolida movimentações e status para mostrar:
- kits disponíveis
- kits em uso
- entradas e saídas por mês
- movimentações recentes
- indicadores operacionais

---

## Regras de negócio importantes

Algumas decisões fundamentais aparecem no código e no banco:

- `Kit.usando = true` indica que o kit está fora do almoxarifado.
- `Movimentacao.dataDevolucao = null` significa movimentação ativa.
- `Movimentacaohistorico` guarda o registro de saída/entrada para auditoria.
- `inventario` e `kit` têm relacionamento direto com itens e movimentações.
- o backend valida IDs, payloads e regras para impedir operações inconsistentes.

---

## Fluxo completo do sistema

Em uma linha, o ciclo do sistema é:

Frontend → rota → API → service → Prisma → PostgreSQL → resposta JSON → renderização da tela

E no sentido oposto, quando o usuário salva algo:

Formulário do frontend → API → service → Prisma → banco → confirmação → atualização da tela

---

## Conclusão

O projeto é uma aplicação completa de gestão de almoxarifado com arquitetura bem separada:

- frontend para experiência e navegação
- backend para regras e integração
- Prisma para persistência e modelagem
- PostgreSQL para armazenamento real

Essa estrutura facilita manutenção, crescimento e evolução das regras do negócio, além de deixar claro o papel de cada parte do sistema.
