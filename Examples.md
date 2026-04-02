# Exemplos de Insert

### 📦 Inventário

```sql
INSERT INTO inventario (nome, patrimonio) VALUES
('Câmera Panasonic', 'PAT 100'),
('Microfone', 'PAT 200'),
('Microfone', 'PAT 201'),
('Bateria', 'PAT 300'),
('Bateria', 'PAT 301'),
('Bateria', 'PAT 302'),
('LED', 'PAT 400'),
('LED', 'PAT 401'),
('LED', 'PAT 402'),
('LED', 'PAT 403');
```

### 🎒 Kit
```sql
INSERT INTO kits (nome)
VALUES ('Kit 23');
```

### 📋 Estrutura do kit
```sql
INSERT INTO kit_itens (kit_id, nome_item, quantidade, editavel)
VALUES
(1, 'Câmera', 1, FALSE),
(1, 'Microfone', 2, FALSE),
(1, 'Bateria', 3, TRUE),
(1, 'LED', 4, FALSE);
```

### 🚚 Criar movimentação
```sql
INSERT INTO movimentacoes (
kit_id,
data_saida,
hora_saida,
responsavel_saida
) VALUES (
1,
CURRENT_DATE,
CURRENT_TIME,
'João'
);
```

### 🔗 Itens que saíram (REAL)
```sql
INSERT INTO movimentacao_itens (movimentacao_id, kit_item_id, inventario_id)
VALUES
-- câmera
(1, 1, 1),

-- microfones
(1, 2, 2),
(1, 2, 3),

-- baterias (editável)
(1, 3, 4),
(1, 3, 5),
(1, 3, 6),

-- leds
(1, 4, 7),
(1, 4, 8),
(1, 4, 9),
(1, 4, 10);
```

# Consultas Úteis

### 📋 Ver tudo que saiu no kit

```sql
SELECT
m.id,
ki.nome_item,
i.patrimonio
FROM movimentacao_itens mi
JOIN movimentacoes m ON m.id = mi.movimentacao_id
JOIN inventario i ON i.id = mi.inventario_id
JOIN kit_itens ki ON ki.id = mi.kit_item_id
WHERE m.id = 1;
```

### 🚫 Itens ainda fora (não devolvidos)

```sql
SELECT *
FROM movimentacoes
WHERE data_devolucao IS NULL;
```
