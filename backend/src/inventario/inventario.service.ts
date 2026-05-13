import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateInventarioDto } from "./dto/create-inventario.dto";
import { CreateStandaloneUnidadeInventarioDto } from "./dto/create-unidade-inventario.dto";
import { UpdateInventarioDto } from "./dto/update-inventario.dto";
import { UpdateUnidadeInventarioDto } from "./dto/update-unidade-inventario.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class InventarioService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.inventario.findMany({
      include: { unidades: { orderBy: { id: "asc" } } },
      orderBy: { id: "asc" },
    });
  }

  async findOne(id: number) {
    const inventario = await this.prisma.inventario.findUnique({
      where: { id },
      include: { unidades: { orderBy: { id: "asc" } } },
    });

    if (!inventario) {
      throw new NotFoundException(`Inventario ${id} nao encontrado.`);
    }

    return inventario;
  }

  async create(dto: CreateInventarioDto) {
    return this.prisma.inventario.create({
      data: {
        nome: dto.nome,
        categoria: dto.categoria,
        observacao: dto.observacao,
        unidades: dto.unidades?.length
          ? {
              create: dto.unidades.map((unidade) => ({
                patrimonio: unidade.patrimonio,
                status: unidade.status ?? "disponivel",
                observacao: unidade.observacao,
              })),
            }
          : undefined,
      },
      include: { unidades: { orderBy: { id: "asc" } } },
    });
  }

  async update(id: number, dto: UpdateInventarioDto) {
    const inventario = await this.findOne(id);
    return this.prisma.inventario.update({
      where: { id: inventario.id },
      data: {
        nome: dto.nome ?? inventario.nome,
        categoria: dto.categoria ?? inventario.categoria,
        observacao: dto.observacao ?? inventario.observacao,
      },
      include: { unidades: { orderBy: { id: "asc" } } },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.inventario.delete({ where: { id } });
    return { deleted: true };
  }

  async createUnidade(dto: CreateStandaloneUnidadeInventarioDto) {
    await this.findOne(dto.inventarioId);
    return this.prisma.unidadeinventario.create({
      data: {
        inventarioId: dto.inventarioId,
        patrimonio: dto.patrimonio,
        status: dto.status ?? "disponivel",
        observacao: dto.observacao,
      },
    });
  }

  async updateUnidade(id: number, dto: UpdateUnidadeInventarioDto) {
    const unidade = await this.prisma.unidadeinventario.findUnique({ where: { id } });

    if (!unidade) {
      throw new NotFoundException(`UnidadeInventario ${id} nao encontrada.`);
    }

    return this.prisma.unidadeinventario.update({
      where: { id: unidade.id },
      data: {
        inventarioId: dto.inventarioId ?? unidade.inventarioId,
        patrimonio: dto.patrimonio ?? unidade.patrimonio,
        status: dto.status ?? unidade.status,
        observacao: dto.observacao ?? unidade.observacao,
      },
    });
  }

  async removeUnidade(id: number) {
    const unidade = await this.prisma.unidadeinventario.findUnique({ where: { id } });

    if (!unidade) {
      throw new NotFoundException(`UnidadeInventario ${id} nao encontrada.`);
    }

    await this.prisma.unidadeinventario.delete({ where: { id: unidade.id } });
    return { deleted: true };
  }
}
