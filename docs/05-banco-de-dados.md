# 05 - Banco de dados (Prisma/Postgres)

## Fonte de verdade do modelo

- Schema Prisma: [backend/prisma/schema.prisma](../backend/prisma/schema.prisma)
- Migrações: [backend/prisma/migrations/](../backend/prisma/migrations)

## Entidades principais

- `Inventario`: item base (nome, categoria, observação)
- `Unidadeinventario`: unidade física individual (patrimônio, status)
- `Kit`: agrupamento de equipamentos
- `Kititem`: composição do kit (quantidade por inventário)
- `Movimentacao`: saída/devolução do kit
- `Movimentacaoitem`: unidades associadas a uma movimentação
- `Movimentacaohistorico`: trilha de eventos de saída/entrada

## Relacionamentos

- `Inventario 1:N Unidadeinventario`
- `Kit 1:N Kititem`
- `Inventario 1:N Kititem`
- `Movimentacao 1:N Movimentacaoitem`
- `Kititem 1:N Movimentacaoitem` (opcional)
- `Unidadeinventario 1:N Movimentacaoitem`

## Regras de negócio refletidas no banco

- `Kit.usando` indica se o kit está fora
- `Movimentacao.dataDevolucao = null` indica movimentação ativa
- Histórico de eventos é registrado em `Movimentacaohistorico`

## Comandos Prisma mais usados

Da raiz do projeto:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:dev
npm run prisma:seed
npm run prisma:studio
```

## Fluxo recomendado para ambiente novo

```bash
npm run setup:db
npm run prisma:seed
```

## Observação sobre variáveis de ambiente

`DATABASE_URL` é obrigatória e lida no startup do backend e nas execuções do Prisma.
