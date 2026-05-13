import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function timeOnly(value: string) {
  return new Date(`1970-01-01T${value.length === 5 ? `${value}:00` : value}.000Z`);
}

async function main() {
  const inventarioCount = await prisma.inventario.count();
  if (inventarioCount > 0) {
    return;
  }

  const camera = await prisma.inventario.create({
    data: {
      nome: "Sony A7 III",
      categoria: "Cameras",
      observacao: "Camera principal",
      unidades: {
        create: [
          { patrimonio: "PAT-0001", status: "disponivel", observacao: "Corpo A" },
        ],
      },
    },
  });

  const bateria = await prisma.inventario.create({
    data: {
      nome: "Bateria NP-F970",
      categoria: "Baterias",
      observacao: "Lote A",
      unidades: {
        create: [
          { patrimonio: "PAT-0002", status: "disponivel", observacao: "Bateria 1" },
          { patrimonio: "PAT-0003", status: "disponivel", observacao: "Bateria 2" },
        ],
      },
    },
  });

  const kit = await prisma.kit.create({
    data: {
      nome: "Kit Teste",
      descricao: "Kit criado para validacao",
      usando: false,
      itens: {
        create: [
          { inventarioId: camera.id, quantidade: 1 },
          { inventarioId: bateria.id, quantidade: 2 },
        ],
      },
    },
  });

  const movimentacao = await prisma.movimentacao.create({
    data: {
      kitId: kit.id,
      kitNome: kit.nome,
      dataSaida: dateOnly("2026-05-13"),
      horaSaida: timeOnly("09:30"),
      responsavelSaida: "Operador 1",
      observacao: "Saida teste",
    },
  });

  await prisma.movimentacaohistorico.create({
    data: {
      movimentacaoId: movimentacao.id,
      kitId: kit.id,
      kitNome: kit.nome,
      tipo: "saída",
      data: dateOnly("2026-05-13"),
      hora: timeOnly("09:30"),
      status: "ativa",
      responsavel: "Operador 1",
      observacao: "Saida teste",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
