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

### Explicação de cada comando

#### `npm run prisma:generate`

Executa:

```bash
prisma generate
```

Esse comando lê o schema em [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) e gera o Prisma Client para TypeScript/Node. Em outras palavras, ele cria a API do Prisma que o backend usa para consultar e alterar dados no banco.

Quando usar:
- após alterar o schema Prisma;
- após criar ou modificar modelos, campos ou relações.

Se você mudar o schema e não rodar esse comando, o código pode não enxergar os tipos novos e os métodos do client.

#### `npm run prisma:migrate`

Executa:

```bash
prisma migrate deploy
```

Esse comando aplica as migrações já existentes no banco PostgreSQL. Ele não cria migração nova manualmente; ele só executa as que já estão no projeto.

É o comando usado para setup automatizado ou ambiente de produção/CI.

#### `npm run prisma:migrate:dev`

Executa:

```bash
prisma migrate dev
```

Esse comando compara o schema atual com o banco e cria uma nova migration quando há diferenças. Em desenvolvimento local, ele é o mais comum para evoluir o banco sem precisar escrever SQL manualmente.

Quando usar:
- criando nova tabela;
- alterando colunas;
- ajustando nomes de campos ou relações;
- quando você quer que o Prisma gere a migration automaticamente.

#### `npm run prisma:seed`

Executa:

```bash
prisma db seed
```

Esse comando roda o script de seed definido em [backend/package.json](../backend/package.json). O seed normalmente está em [backend/prisma/seed.ts](../backend/prisma/seed.ts) e é usado para inserir dados iniciais no banco, como itens base, configurações ou registros de apoio.

#### `npm run prisma:studio`

Executa:

```bash
prisma studio
```

Abre uma interface visual para inspecionar o banco e os dados cadastrados. É útil para verificar se as tabelas e registros foram criados corretamente.

## Diferença entre `generate` e `migrate`

- `generate` = gera o cliente Prisma e atualiza a API usada pelo código.
- `migrate` = altera a estrutura do banco PostgreSQL.

Esses comandos atuam em camadas diferentes, mas normalmente são usados juntos:

```bash
prisma generate
prisma migrate dev
```

ou em ambiente já pronto:

```bash
prisma generate
prisma migrate deploy
```

## Fluxo recomendado para ambiente novo

No projeto, o setup do banco já foi organizado assim:

```bash
npm run setup:db
npm run prisma:seed
```

E o script `setup:db` em [backend/package.json](../backend/package.json) faz exatamente:

```bash
npm run prisma:generate && npm run prisma:migrate
```

Ou seja:

1. gera o Prisma Client;
2. aplica as migrações existentes no banco;
3. depois o seed popula os dados iniciais.

## O que significa a linha de setup do README

A linha do README:

```bash
npm run setup:db
npm run prisma:seed
```

significa:

- `setup:db`: prepara o banco para uso do backend;
- `prisma:seed`: insere os registros iniciais necessários para a aplicação funcionar corretamente.

## Observação sobre variáveis de ambiente

`DATABASE_URL` é obrigatória e lida no startup do backend e nas execuções do Prisma.

Sem essa variável configurada corretamente, o Prisma não conseguirá conectar ao PostgreSQL e nenhuma migration ou seed conseguirá funcionar.
