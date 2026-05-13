import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateKitDto } from "./dto/create-kit.dto";
import { CreateStandaloneKitItemDto } from "./dto/create-kit-item.dto";
import { UpdateKitDto } from "./dto/update-kit.dto";
import { UpdateKitItemDto } from "./dto/update-kit-item.dto";
import { PrismaService } from "../prisma/prisma.service";

function parseId(value: number | string, label = "id") {
  const id = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(id) || id < 1) {
    throw new BadRequestException(`${label} invalido.`);
  }

  return id;
}

@Injectable()
export class KitsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async ensureKitEditable(id: number | string) {
    const kitId = parseId(id, "kitId");
    const activeMovement = await this.prisma.movimentacao.findFirst({
      where: {
        kitId,
        dataDevolucao: null,
      },
      select: { id: true },
    });

    if (activeMovement) {
      throw new BadRequestException("Kit fora. Finalize a devolucao antes de editar.");
    }
  }

  findAll() {
    return this.prisma.kit.findMany({
      include: {
        itens: {
          include: { inventario: { include: { unidades: { orderBy: { id: "asc" } } } } },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });
  }

  async findOne(id: number | string) {
    const kitId = parseId(id);
    const kit = await this.prisma.kit.findUnique({
      where: { id: kitId },
      include: {
        itens: {
          include: { inventario: { include: { unidades: { orderBy: { id: "asc" } } } } },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!kit) {
      throw new NotFoundException(`Kit ${kitId} nao encontrado.`);
    }

    return kit;
  }

  async create(dto: CreateKitDto) {
    return this.prisma.kit.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        usando: dto.usando ?? false,
        itens: dto.itens?.length
          ? {
              create: dto.itens.map((item) => ({
                inventarioId: item.inventarioId,
                quantidade: item.quantidade ?? 1,
              })),
            }
          : undefined,
      },
      include: {
        itens: {
          include: { inventario: { include: { unidades: { orderBy: { id: "asc" } } } } },
          orderBy: { id: "asc" },
        },
      },
    });
  }

  async update(id: number | string, dto: UpdateKitDto) {
    const kit = await this.findOne(id);
    await this.ensureKitEditable(kit.id);
    return this.prisma.kit.update({
      where: { id: kit.id },
      data: {
        nome: dto.nome ?? kit.nome,
        descricao: dto.descricao ?? kit.descricao,
        usando: dto.usando ?? kit.usando,
      },
      include: {
        itens: {
          include: { inventario: { include: { unidades: { orderBy: { id: "asc" } } } } },
          orderBy: { id: "asc" },
        },
      },
    });
  }

  async remove(id: number | string) {
    const kit = await this.findOne(id);
    await this.ensureKitEditable(kit.id);
    await this.prisma.kit.delete({ where: { id: kit.id } });
    return { deleted: true };
  }

  async createItem(dto: CreateStandaloneKitItemDto) {
    await this.findOne(dto.kitId);
    await this.ensureKitEditable(dto.kitId);
    return this.prisma.kititem.create({
      data: {
        kitId: dto.kitId,
        inventarioId: dto.inventarioId,
        quantidade: dto.quantidade,
      },
      include: { inventario: { include: { unidades: { orderBy: { id: "asc" } } } } },
    });
  }

  async updateItem(id: number | string, dto: UpdateKitItemDto) {
    const itemId = parseId(id);
    const item = await this.prisma.kititem.findUnique({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException(`KitItem ${itemId} nao encontrado.`);
    }

    await this.ensureKitEditable(item.kitId);

    return this.prisma.kititem.update({
      where: { id: item.id },
      data: {
        kitId: dto.kitId ?? item.kitId,
        inventarioId: dto.inventarioId ?? item.inventarioId,
        quantidade: dto.quantidade ?? item.quantidade,
      },
      include: { inventario: { include: { unidades: { orderBy: { id: "asc" } } } } },
    });
  }

  async removeItem(id: number | string) {
    const itemId = parseId(id);
    const item = await this.prisma.kititem.findUnique({ where: { id: itemId } });

    if (!item) {
      throw new NotFoundException(`KitItem ${itemId} nao encontrado.`);
    }

    await this.ensureKitEditable(item.kitId);

    await this.prisma.kititem.delete({ where: { id: item.id } });
    return { deleted: true };
  }
}
