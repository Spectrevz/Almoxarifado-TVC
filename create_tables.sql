-- SQL de criação das tabelas do banco PostgreSQL
-- Baseado no schema fornecido para Inventario, Unidadeinventario, Kit, Kititem, Movimentacao e Movimentacaoitem

DROP TABLE IF EXISTS "Movimentacaoitem" CASCADE;
DROP TABLE IF EXISTS "Movimentacao" CASCADE;
DROP TABLE IF EXISTS "Kititem" CASCADE;
DROP TABLE IF EXISTS "Kit" CASCADE;
DROP TABLE IF EXISTS "Unidadeinventario" CASCADE;
DROP TABLE IF EXISTS "Inventario" CASCADE;

CREATE TABLE "Inventario" (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(255) NOT NULL,
  observacao VARCHAR(255)
);

CREATE TABLE "Unidadeinventario" (
  id SERIAL PRIMARY KEY,
  inventarioid INT NOT NULL,
  patrimonio VARCHAR(100) NOT NULL,
  status VARCHAR(255) NOT NULL DEFAULT 'disponivel',
  observacao VARCHAR(255),
  CONSTRAINT fk_unidadeinventario_inventario FOREIGN KEY (inventarioid)
    REFERENCES "Inventario" (id) ON DELETE CASCADE
);

CREATE TABLE "Kit" (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao VARCHAR(255),
  usando BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE "Kititem" (
  id SERIAL PRIMARY KEY,
  kitid INT NOT NULL,
  inventarioid INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_kititem_kit FOREIGN KEY (kitid)
    REFERENCES "Kit" (id) ON DELETE CASCADE,
  CONSTRAINT fk_kititem_inventario FOREIGN KEY (inventarioid)
    REFERENCES "Inventario" (id)
);

CREATE TABLE "Movimentacao" (
  id SERIAL PRIMARY KEY,
  kitid INT NOT NULL,
  datasaida DATE NOT NULL,
  horasaida TIME,
  datadevolucao DATE,
  horadevolucao TIME,
  responsavelsaida VARCHAR(255),
  responsavelretorno VARCHAR(255),
  observacao VARCHAR(255),
  CONSTRAINT fk_movimentacao_kit FOREIGN KEY (kitid)
    REFERENCES "Kit" (id)
);

CREATE TABLE "Movimentacaoitem" (
  id SERIAL PRIMARY KEY,
  mmovimentacaoid INT NOT NULL,
  kititemid INT NOT NULL,
  unidadeinventarioid INT NOT NULL,
  CONSTRAINT fk_movimentacaoitem_movimentacao FOREIGN KEY (mmovimentacaoid)
    REFERENCES "Movimentacao" (id) ON DELETE CASCADE,
  CONSTRAINT fk_movimentacaoitem_kititem FOREIGN KEY (kititemid)
    REFERENCES "Kititem" (id),
  CONSTRAINT fk_movimentacaoitem_unidadeinventario FOREIGN KEY (unidadeinventarioid)
    REFERENCES "Unidadeinventario" (id)
);
