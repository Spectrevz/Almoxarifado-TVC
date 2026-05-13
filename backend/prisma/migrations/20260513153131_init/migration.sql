-- CreateTable
CREATE TABLE "Inventario" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(255) NOT NULL,
    "observacao" VARCHAR(255),

    CONSTRAINT "Inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unidadeinventario" (
    "id" SERIAL NOT NULL,
    "inventarioid" INTEGER NOT NULL,
    "patrimonio" VARCHAR(100) NOT NULL,
    "status" VARCHAR(255) NOT NULL DEFAULT 'disponivel',
    "observacao" VARCHAR(255),

    CONSTRAINT "Unidadeinventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kit" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descricao" VARCHAR(255),
    "usando" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Kit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kititem" (
    "id" SERIAL NOT NULL,
    "kitid" INTEGER NOT NULL,
    "inventarioid" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Kititem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" SERIAL NOT NULL,
    "kitid" INTEGER NOT NULL,
    "kitnome" VARCHAR(255),
    "datasaida" DATE NOT NULL,
    "horasaida" TIME,
    "datadevolucao" DATE,
    "horadevolucao" TIME,
    "responsavelsaida" VARCHAR(255),
    "responsavelretorno" VARCHAR(255),
    "observacao" VARCHAR(255),

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacaoitem" (
    "id" SERIAL NOT NULL,
    "mmovimentacaoid" INTEGER NOT NULL,
    "kititemid" INTEGER,
    "unidadeinventarioid" INTEGER NOT NULL,

    CONSTRAINT "Movimentacaoitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacaohistorico" (
    "id" SERIAL NOT NULL,
    "movimentacaoid" INTEGER NOT NULL,
    "kitid" INTEGER NOT NULL,
    "kitnome" VARCHAR(255),
    "tipo" VARCHAR(20) NOT NULL,
    "data" DATE NOT NULL,
    "hora" TIME,
    "status" VARCHAR(20) NOT NULL,
    "responsavel" VARCHAR(255),
    "datadevolucao" DATE,
    "observacao" VARCHAR(255),

    CONSTRAINT "Movimentacaohistorico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Unidadeinventario" ADD CONSTRAINT "Unidadeinventario_inventarioid_fkey" FOREIGN KEY ("inventarioid") REFERENCES "Inventario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kititem" ADD CONSTRAINT "Kititem_kitid_fkey" FOREIGN KEY ("kitid") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kititem" ADD CONSTRAINT "Kititem_inventarioid_fkey" FOREIGN KEY ("inventarioid") REFERENCES "Inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_kitid_fkey" FOREIGN KEY ("kitid") REFERENCES "Kit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacaoitem" ADD CONSTRAINT "Movimentacaoitem_mmovimentacaoid_fkey" FOREIGN KEY ("mmovimentacaoid") REFERENCES "Movimentacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacaoitem" ADD CONSTRAINT "Movimentacaoitem_kititemid_fkey" FOREIGN KEY ("kititemid") REFERENCES "Kititem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacaoitem" ADD CONSTRAINT "Movimentacaoitem_unidadeinventarioid_fkey" FOREIGN KEY ("unidadeinventarioid") REFERENCES "Unidadeinventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
