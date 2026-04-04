# TODO

⭐ = Importante, 📆 = Implementar Futuramente, ⚠️ = Testar, ❗ = Aviso

### Ordem

- 1 - Fazer análise de dados
- 2 - Estrutura do site
- 3 - Tarefas
- 4 - Funcionalidades
- 5 - Revisar
- 6 - Estilizar
- 7 - Testar
- 8 - Feedback

## Kits

- [ ] Kit 1 ()
- [ ] Kit 2 ()

## Tarefas Principais

- [ ] ⭐ Adicionar todos equipamentos
- [ ] 📆 Criar página para a portaria visualizar o que saiu
- [ ] 📆 Testar o leitor para cadastro
- [ ] ⭐ Gerar PDF

## Funcionalidades

- [ ] ⭐ Campo da bateria editável
- [ ] 📆 Equipamento: implementar preenchimento automático com código 22 (Dropbox)

## Avisos

- [ ] ❗ Horário de saída é apenas do equipamento (remover horário do carro)
- [ ] ❗ Exibir número do kit
- [ ] ❗ O horário é variado

## Tabelas

### Inventário
```sql
CREATE TABLE inventario (
id SERIAL PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
patrimonio VARCHAR(100) NOT NULL,
observacao TEXT,
ativo BOOLEAN DEFAULT TRUE
);
```

### Kits - Estrutura do Kit
```sql
CREATE TABLE kits (
id SERIAL PRIMARY KEY,
nome VARCHAR(100) NOT NULL,
descricao TEXT
usando BOOLEAN DEFAULT FALSE,
);
```

### Itens dos Kits
```sql
CREATE TABLE kit_itens (
id SERIAL PRIMARY KEY,
kit_id INTEGER NOT NULL,

nome_item VARCHAR(100) NOT NULL, -- "Câmera", "Bateria"
quantidade INTEGER DEFAULT 1,
editavel BOOLEAN DEFAULT FALSE,

FOREIGN KEY (kit_id) REFERENCES kits(id) ON DELETE CASCADE
);
```

### Movimentações - A folha em si
```sql
CREATE TABLE movimentacoes (
id SERIAL PRIMARY KEY,

kit_id INTEGER NOT NULL,

data_saida DATE NOT NULL,
hora_saida TIME,

data_devolucao DATE,
hora_devolucao TIME,

responsavel_saida VARCHAR(100),
responsavel_retorno VARCHAR(100),

observacao TEXT,

FOREIGN KEY (kit_id) REFERENCES kits(id)

);
```

### Movimentação Itens - Os itens movimentados
```sql
CREATE TABLE movimentacao_itens (
id SERIAL PRIMARY KEY,

movimentacao_id INTEGER NOT NULL,
kit_item_id INTEGER NOT NULL,

inventario_id INTEGER NOT NULL,


FOREIGN KEY (movimentacao_id) REFERENCES movimentacoes(id) ON DELETE CASCADE,
FOREIGN KEY (kit_item_id) REFERENCES kit_itens(id),
FOREIGN KEY (inventario_id) REFERENCES inventario(id)

);
```
### 🎯 Resumo

- Kits → nome do kit
- Kit_itens → estrutura (o que deve ter no kit)
- Inventario → guarda todos os equipamentos
- Movimentacoes → a folha
- Movimentacao_itens → o que saiu de verdade

#### [Exemplos de insert](examples.md)
## Fluxo do Sistema - Protótipo 1

### 🖥️ 1. Usuário escolhe:

Exemplo:

    Kit 23



### ⚙️ 2. Backend roda:

Exemplo:

```sql
SELECT * FROM kit_itens WHERE kit_id = 1;
```

---

### 🎯 3. Front monta a tela:

Exemplo:

    1 campo de câmera

    2 de microfone

    3 de bateria (editáveis)

    4 de LED

    Campos vazios são mostrados normalmente para não quebrar a tabela.

---

### ✏️ 4. Usuário seleciona patrimônios

Exemplo:

    bateria → PAT 300, 301, 302

---

### 💾 5. Você salva em movimentacao_itens
