Boa — você já instalou o **PostgreSQL**, agora faltam alguns passos pra deixar ele rodando e utilizável.

Vou te guiar no fluxo básico 👇

---

## ✅ 1. Verificar se o serviço está rodando

No Linux (Ubuntu/Debian):

```bash
sudo systemctl status postgresql
```

Se não estiver ativo:

```bash
sudo systemctl start postgresql
```

E opcional (iniciar sempre com o sistema):

```bash
sudo systemctl enable postgresql
```

---

## ✅ 2. Acessar o PostgreSQL

O Postgres cria um usuário padrão chamado `postgres`.

Entre nele:

```bash
sudo -i -u postgres
```

Depois abra o terminal do banco:

```bash
psql
```

Se deu certo, vai aparecer algo tipo:

```
postgres=#
```

---

## ✅ 3. Criar um banco de dados

Dentro do `psql`:

```sql
CREATE DATABASE meu_banco;
```

---

## ✅ 4. Criar um usuário (recomendado)

```sql
CREATE USER meu_usuario WITH PASSWORD 'minha_senha';
```

Dar permissão:

```sql
ALTER ROLE meu_usuario SET client_encoding TO 'utf8';
ALTER ROLE meu_usuario SET default_transaction_isolation TO 'read committed';
ALTER ROLE meu_usuario SET timezone TO 'UTC';
```

E acesso ao banco:

```sql
GRANT ALL PRIVILEGES ON DATABASE meu_banco TO meu_usuario;
```

---

## ✅ 5. Sair

```sql
\q
```

E sair do usuário postgres:

```bash
exit
```

---

## ✅ 6. Testar conexão

```bash
psql -U meu_usuario -d meu_banco -h localhost -W
```

---

## 🔥 Dica importante

Se der erro de autenticação (`peer authentication failed`), provavelmente você vai precisar editar:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

E trocar:

```
peer
```

por:

```
md5
```

Depois reinicia:

```bash
sudo systemctl restart postgresql
```

---

## Se quiser ir além

Posso te ajudar a:

* conectar com Node.js / Prisma / Sequelize
* usar com Docker
* acessar via GUI (tipo pgAdmin)
* criar tabelas e schema inicial

Só me fala o que você quer fazer com o Postgres 👍
