# 01 - Clone e setup local

## Pré-requisitos

- Node.js instalado
- npm instalado
- PostgreSQL rodando localmente

## 1) Clonar e entrar no projeto

```bash
git clone https://github.com/Spectrevz/Almoxarifado-TVC.git
cd Almoxarifado-TVC
```

## 2) Instalar dependências

```bash
npm install
```

## 3) Configurar ambiente

Preencha os dois arquivos de ambiente:

- [`.env`](../.env)
- [`backend/.env`](../backend/.env)

## 4) Preparar banco (Prisma)

```bash
npm run setup:db
npm run prisma:seed
```

Isso executa:
- `prisma generate`
- `prisma migrate deploy`
- `prisma db seed`

## 5) Subir aplicação

Em terminais separados:

```bash
npm run backend
npm run dev:frontend
```

Ou tudo junto:

```bash
npm run dev:full
```

## 6) Verificação rápida

- Health backend: `http://localhost:3001/api/health`
- Frontend: porta exibida pelo Vite/React Router dev

## Problemas comuns

### Erro `P1000` (Prisma auth failed)

Causa: usuário/senha incorretos na `DATABASE_URL`.

Solução:
1. Corrigir credenciais em [`.env`](../.env) e [`backend/.env`](../backend/.env)
2. Rodar novamente:

```bash
npm run setup:db
```
