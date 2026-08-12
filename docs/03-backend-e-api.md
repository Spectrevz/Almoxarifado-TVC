# 03 - Backend e API

## Estrutura do backend

A pasta [backend/src](../backend/src) contém a aplicação NestJS responsável pela API do sistema. Ela organiza o código por módulos, onde cada módulo representa um domínio do negócio.

### Arquivos e pastas principais

- [backend/src/main.ts](../backend/src/main.ts): ponto de entrada da aplicação. Inicializa o NestJS, configura CORS, validação global e prefixo `/api`.
- [backend/src/app.module.ts](../backend/src/app.module.ts): módulo raiz, que registra todos os módulos da aplicação.
- [backend/src/prisma](../backend/src/prisma): camada de acesso ao banco via Prisma.
  - [backend/src/prisma/prisma.module.ts](../backend/src/prisma/prisma.module.ts): registra o Prisma como provedor global.
  - [backend/src/prisma/prisma.service.ts](../backend/src/prisma/prisma.service.ts): serviço que conecta e desconecta do banco usando `PrismaClient`.
- [backend/src/health](../backend/src/health): módulo de saúde da API.
- [backend/src/inventario](../backend/src/inventario): módulo de inventário.
  - controller: recebe requisições HTTP.
  - service: aplica regras e acessa o Prisma.
  - DTOs: validam entrada de dados.
- [backend/src/kits](../backend/src/kits): módulo de kits.
- [backend/src/movimentacoes](../backend/src/movimentacoes): módulo principal de movimentações do negócio.
- [backend/src/movements](../backend/src/movements): visão agregada/consulta de movimentações para leitura filtrável.
- [backend/src/common](../backend/src/common): utilitários e compartilhamentos comuns.

### Como o fluxo funciona na prática

1. O frontend chama uma rota da API, por exemplo `GET /api/inventario`.
2. O controller recebe a requisição e delega para o service.
3. O service usa `PrismaService` para consultar ou alterar o PostgreSQL.
4. O resultado é retornado em JSON para o frontend.

Exemplo real no projeto:
- [backend/src/inventario/inventario.controller.ts](../backend/src/inventario/inventario.controller.ts)
- [backend/src/inventario/inventario.service.ts](../backend/src/inventario/inventario.service.ts)

A relação é: controller recebe a rota, service executa a regra, Prisma acessa o banco.

## Base URL

- Local: `http://localhost:3001/api`
- Health check: `GET /health`

## Bootstrap e configuração

- Inicialização: [backend/src/main.ts](../backend/src/main.ts)
- Prefixo global: `/api`
- Validação global: `ValidationPipe` com `whitelist`, `transform`, `forbidNonWhitelisted`
- CORS:
  - aceita origens de `CORS_ORIGIN`
  - aceita localhost/rede privada

## Módulos e endpoints

### Health

Arquivo: [health.controller.ts](../backend/src/health/health.controller.ts)

- `GET /health`

### Inventário

Arquivos:
- [inventario.controller.ts](../backend/src/inventario/inventario.controller.ts)
- [inventario.service.ts](../backend/src/inventario/inventario.service.ts)

Endpoints:
- `GET /inventario`
- `GET /inventario/:id`
- `POST /inventario`
- `PATCH /inventario/:id`
- `DELETE /inventario/:id`
- `POST /inventario/unidades`
- `PATCH /inventario/unidades/:id`
- `DELETE /inventario/unidades/:id`

Regras:
- Retorna unidades ordenadas por `id`
- `status` de unidade padrão: `disponivel`
- `findOne` inexistente gera `NotFoundException`

### Kits

Arquivos:
- [kits.controller.ts](../backend/src/kits/kits.controller.ts)
- [kits.service.ts](../backend/src/kits/kits.service.ts)

Endpoints:
- `GET /kits`
- `GET /kits/:id`
- `POST /kits`
- `PATCH /kits/:id`
- `DELETE /kits/:id`
- `POST /kits/itens`
- `PATCH /kits/itens/:id`
- `DELETE /kits/itens/:id`

Regras:
- Não permite editar/remover kit com movimentação ativa (`dataDevolucao = null`)
- Validação de ID inteiro e positivo
- Itens incluem dados do inventário e unidades

### Movimentações (domínio principal)

Arquivos:
- [movimentacoes.controller.ts](../backend/src/movimentacoes/movimentacoes.controller.ts)
- [movimentacoes.service.ts](../backend/src/movimentacoes/movimentacoes.service.ts)

Endpoints:
- `GET /movimentacoes`
- `GET /movimentacoes/:id`
- `POST /movimentacoes`
- `PATCH /movimentacoes/:id`
- `PATCH /movimentacoes/:id/devolucao`
- `DELETE /movimentacoes/:id`
- `POST /movimentacoes/itens`
- `PATCH /movimentacoes/itens/:id`
- `DELETE /movimentacoes/itens/:id`

Regras importantes:
- Saída de kit já em uso é bloqueada
- Ao criar saída ativa, marca kit como `usando: true`
- Ao finalizar devolução, marca kit como `usando: false`
- Mantém histórico em `Movimentacaohistorico` para saída e entrada

### Movements (visão agregada)

Arquivos:
- [movements.controller.ts](../backend/src/movements/movements.controller.ts)
- [movements.service.ts](../backend/src/movements/movements.service.ts)

Endpoint:
- `GET /movements?type=&status=&search=`

Uso:
- Camada de leitura para histórico filtrável no frontend
- Filtra por tipo (`saida|saída|entrada`), status e busca textual
- Limita retorno a 500 registros

## DTOs e validação

Os DTOs ficam em `backend/src/**/dto/*.ts` e aplicam:
- `@IsString`, `@Length` para campos textuais
- `@IsInt`, `@Min(1)` para IDs e quantidades
- `@IsDateString` e regex para horários `HH:mm`/`HH:mm:ss`
- `PartialType` para updates parciais

## Persistência

- Prisma Service: [prisma.service.ts](../backend/src/prisma/prisma.service.ts)
- Conecta no `onModuleInit` e desconecta no `onModuleDestroy`
