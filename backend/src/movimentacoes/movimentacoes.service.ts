import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateMovimentacaoDto } from "./dto/create-movimentacao.dto";
import { CreateStandaloneMovimentacaoItemDto } from "./dto/create-movimentacao-item.dto";
import { FinalizarMovimentacaoDto } from "./dto/finalizar-movimentacao.dto";
import { UpdateMovimentacaoDto } from "./dto/update-movimentacao.dto";
import { UpdateMovimentacaoItemDto } from "./dto/update-movimentacao-item.dto";
import { PrismaService } from "../prisma/prisma.service";

function dateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function timeOnly(value: string) {
  const normalized = value.length === 5 ? `${value}:00` : value;
  return new Date(`1970-01-01T${normalized}.000Z`);
}

function formatDate(value?: Date | null) {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function formatTime(value?: Date | null) {
  if (!value) return null;
  return value.toISOString().slice(11, 19);
}

@Injectable()
export class MovimentacoesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  listHistorico() {
    return this.prisma.movimentacaohistorico.findMany({
      orderBy: [{ data: "desc" }, { hora: "desc" }, { id: "desc" }],
    }).then((items) =>
      items.map((item) => ({
        ...item,
        data: formatDate(item.data) ?? "",
        hora: formatTime(item.hora),
        dataDevolucao: formatDate(item.dataDevolucao),
      })),
    );
  }

  findAll() {
    return this.prisma.movimentacao.findMany({
      include: {
        kit: true,
        itens: {
          include: {
            kitItem: { include: { inventario: true } },
            unidadeInventario: { include: { inventario: true } },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "desc" },
    }).then((items) =>
      items.map((item) => ({
        ...item,
        dataSaida: formatDate(item.dataSaida) ?? "",
        horaSaida: formatTime(item.horaSaida),
        dataDevolucao: formatDate(item.dataDevolucao),
        horaDevolucao: formatTime(item.horaDevolucao),
      })),
    );
  }

  async findOne(id: number) {
    const movimentacao = await this.prisma.movimentacao.findUnique({
      where: { id },
      include: {
        kit: true,
        itens: {
          include: {
            kitItem: { include: { inventario: true } },
            unidadeInventario: { include: { inventario: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!movimentacao) {
      throw new NotFoundException(`Movimentacao ${id} nao encontrada.`);
    }

    return {
      ...movimentacao,
      dataSaida: formatDate(movimentacao.dataSaida) ?? "",
      horaSaida: formatTime(movimentacao.horaSaida),
      dataDevolucao: formatDate(movimentacao.dataDevolucao),
      horaDevolucao: formatTime(movimentacao.horaDevolucao),
    };
  }

  async create(dto: CreateMovimentacaoDto) {
    const kit = await this.prisma.kit.findUnique({ where: { id: dto.kitId } });
    const activeMovement = await this.prisma.movimentacao.findFirst({
      where: {
        kitId: dto.kitId,
        dataDevolucao: null,
      },
      select: { id: true },
    });

    if (kit?.usando || activeMovement) {
      throw new BadRequestException(`Kit ${dto.kitId} ja esta fora.`);
    }

    const saved = await this.prisma.movimentacao.create({
      data: {
        kitId: dto.kitId,
        kitNome: kit?.nome ?? null,
        dataSaida: dateOnly(dto.dataSaida),
        horaSaida: dto.horaSaida ? timeOnly(dto.horaSaida) : null,
        dataDevolucao: dto.dataDevolucao ? dateOnly(dto.dataDevolucao) : null,
        horaDevolucao: dto.horaDevolucao ? timeOnly(dto.horaDevolucao) : null,
        responsavelSaida: dto.responsavelSaida,
        responsavelRetorno: dto.responsavelRetorno,
        observacao: dto.observacao,
        itens: dto.itens?.length
          ? {
              create: dto.itens.map((item) => ({
                kitItemId: item.kitItemId,
                unidadeInventarioId: item.unidadeInventarioId,
              })),
            }
          : undefined,
      },
    });

    await this.prisma.movimentacaohistorico.create({
      data: {
        movimentacaoId: saved.id,
        kitId: saved.kitId,
        kitNome: kit?.nome ?? null,
        tipo: "saída",
        data: saved.dataSaida,
        hora: saved.horaSaida ?? null,
        status: saved.dataDevolucao ? "concluída" : "ativa",
        responsavel: saved.responsavelSaida ?? null,
        dataDevolucao: saved.dataDevolucao ?? null,
        observacao: saved.observacao ?? null,
      },
    });

    if (!saved.dataDevolucao) {
      await this.prisma.kit.update({
        where: { id: saved.kitId },
        data: { usando: true },
      });
    }

    return {
      ...saved,
      dataSaida: formatDate(saved.dataSaida) ?? "",
      horaSaida: formatTime(saved.horaSaida),
      dataDevolucao: formatDate(saved.dataDevolucao),
      horaDevolucao: formatTime(saved.horaDevolucao),
    };
  }

  async update(id: number, dto: UpdateMovimentacaoDto) {
    const movimentacao = await this.findOne(id);
    const saved = await this.prisma.movimentacao.update({
      where: { id: movimentacao.id },
      data: {
        kitId: dto.kitId ?? movimentacao.kitId,
        dataSaida: dto.dataSaida ? dateOnly(dto.dataSaida) : dateOnly(movimentacao.dataSaida),
        horaSaida: dto.horaSaida ? timeOnly(dto.horaSaida) : movimentacao.horaSaida ? timeOnly(movimentacao.horaSaida) : null,
        dataDevolucao: dto.dataDevolucao ? dateOnly(dto.dataDevolucao) : movimentacao.dataDevolucao ? dateOnly(movimentacao.dataDevolucao) : null,
        horaDevolucao: dto.horaDevolucao ? timeOnly(dto.horaDevolucao) : movimentacao.horaDevolucao ? timeOnly(movimentacao.horaDevolucao) : null,
        responsavelSaida: dto.responsavelSaida ?? movimentacao.responsavelSaida,
        responsavelRetorno: dto.responsavelRetorno ?? movimentacao.responsavelRetorno,
        observacao: dto.observacao ?? movimentacao.observacao,
      },
    });

    return {
      ...saved,
      dataSaida: formatDate(saved.dataSaida) ?? "",
      horaSaida: formatTime(saved.horaSaida),
      dataDevolucao: formatDate(saved.dataDevolucao),
      horaDevolucao: formatTime(saved.horaDevolucao),
    };
  }

  async finalize(id: number, dto: FinalizarMovimentacaoDto) {
    const movimentacao = await this.findOne(id);
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const currentDate = localDate.toISOString().slice(0, 10);
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    const dataDevolucao = dto.dataDevolucao ?? currentDate;
    const horaDevolucao = dto.horaDevolucao ?? currentTime;
    const responsavelRetorno = dto.responsavelRetorno ?? movimentacao.responsavelRetorno;

    const saved = await this.prisma.movimentacao.update({
      where: { id: movimentacao.id },
      data: {
        dataDevolucao: dateOnly(dataDevolucao),
        horaDevolucao: timeOnly(horaDevolucao),
        responsavelRetorno,
      },
      include: { kit: true },
    });

    const saidaHistorico = await this.prisma.movimentacaohistorico.findFirst({
      where: { movimentacaoId: saved.id, tipo: "saída" },
    });

    if (saidaHistorico) {
      saidaHistorico.status = "concluída";
      saidaHistorico.dataDevolucao = saved.dataDevolucao ?? null;
      saidaHistorico.hora = saidaHistorico.hora ?? saved.horaSaida ?? null;
      await this.prisma.movimentacaohistorico.update({
        where: { id: saidaHistorico.id },
        data: {
          status: "concluída",
          dataDevolucao: saved.dataDevolucao ?? null,
          hora: saidaHistorico.hora ?? saved.horaSaida ?? null,
        },
      });
    }

    await this.prisma.movimentacaohistorico.create({
      data: {
        movimentacaoId: saved.id,
        kitId: saved.kitId,
        kitNome: saved.kitNome ?? saved.kit?.nome ?? null,
        tipo: "entrada",
        data: saved.dataDevolucao ?? saved.dataSaida,
        hora: saved.horaDevolucao ?? null,
        status: "concluída",
        responsavel: saved.responsavelRetorno ?? saved.responsavelSaida ?? null,
        dataDevolucao: saved.dataDevolucao ?? null,
        observacao: saved.observacao ?? null,
      },
    });

    await this.prisma.kit.update({
      where: { id: saved.kitId },
      data: { usando: false },
    });

    return {
      ...saved,
      dataSaida: formatDate(saved.dataSaida) ?? "",
      horaSaida: formatTime(saved.horaSaida),
      dataDevolucao: formatDate(saved.dataDevolucao),
      horaDevolucao: formatTime(saved.horaDevolucao),
    };
  }

  async remove(id: number) {
    const movimentacao = await this.findOne(id);
    await this.prisma.movimentacao.delete({ where: { id: movimentacao.id } });
    return { deleted: true };
  }

  async createItem(dto: CreateStandaloneMovimentacaoItemDto) {
    await this.findOne(dto.movimentacaoId);
    return this.prisma.movimentacaoitem.create({
      data: {
        movimentacaoId: dto.movimentacaoId,
        kitItemId: dto.kitItemId,
        unidadeInventarioId: dto.unidadeInventarioId,
      },
      include: {
        kitItem: { include: { inventario: true } },
        unidadeInventario: { include: { inventario: true } },
      },
    });
  }

  async updateItem(id: number, dto: UpdateMovimentacaoItemDto) {
    const item = await this.prisma.movimentacaoitem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException(`MovimentacaoItem ${id} nao encontrado.`);
    }

    return this.prisma.movimentacaoitem.update({
      where: { id: item.id },
      data: {
        movimentacaoId: dto.movimentacaoId ?? item.movimentacaoId,
        kitItemId: dto.kitItemId ?? item.kitItemId,
        unidadeInventarioId: dto.unidadeInventarioId ?? item.unidadeInventarioId,
      },
      include: {
        kitItem: { include: { inventario: true } },
        unidadeInventario: { include: { inventario: true } },
      },
    });
  }

  async removeItem(id: number) {
    const item = await this.prisma.movimentacaoitem.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundException(`MovimentacaoItem ${id} nao encontrado.`);
    }

    await this.prisma.movimentacaoitem.delete({ where: { id: item.id } });
    return { deleted: true };
  }
}
