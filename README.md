<h1 align="center">Almoxarifado TV Cultura</h1>

Aplicação para gerenciamento de inventário, kits e movimentações de equipamentos.

## Stack

- Frontend: React 19 + React Router 7 + TypeScript + Tailwind
- Backend: NestJS + Prisma
- Banco: PostgreSQL

## Onboarding rápido (clone + execução)

1. Clone o projeto:

```bash
git clone https://github.com/Spectrevz/Almoxarifado-TVC.git
cd Almoxarifado-TVC
```

2. Instale dependências:

```bash
npm install
```

3. Configure o banco nos arquivos:
- [`.env`](.env)
- [`backend/.env`](backend/.env)

4. Gere client Prisma + rode migração + seed:

```bash
npm run setup:db
npm run prisma:seed
```

5. Suba backend e frontend:

```bash
npm run backend
npm run dev:frontend
```

Ou tudo junto:

```bash
npm run dev:full
```

## Documentação por categoria

- [01 - Clone e setup local](docs/01-clone-e-setup.md)
- [02 - Arquitetura e organização](docs/02-arquitetura-e-organizacao.md)
- [03 - Backend e API](docs/03-backend-e-api.md)
- [04 - Frontend e telas](docs/04-frontend-e-telas.md)
- [05 - Banco de dados (Prisma/Postgres)](docs/05-banco-de-dados.md)
- [06 - Scripts e operação diária](docs/06-scripts-e-operacao.md)

## Backlog

- [TODO.md](TODO.md)
