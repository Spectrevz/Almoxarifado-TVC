import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateKitDto } from "./dto/create-kit.dto";
import { CreateStandaloneKitItemDto } from "./dto/create-kit-item.dto";
import { UpdateKitDto } from "./dto/update-kit.dto";
import { UpdateKitItemDto } from "./dto/update-kit-item.dto";
import { KitItem } from "./entities/kit-item.entity";
import { Kit } from "./entities/kit.entity";

@Injectable()
export class KitsService {
  constructor(
    @InjectRepository(Kit)
    private readonly kitRepository: Repository<Kit>,
    @InjectRepository(KitItem)
    private readonly kitItemRepository: Repository<KitItem>,
  ) {}

  findAll() {
    return this.kitRepository.find({
      relations: { itens: { inventario: true } },
      order: { id: "ASC", itens: { id: "ASC" } },
    });
  }

  async findOne(id: number) {
    const kit = await this.kitRepository.findOne({
      where: { id },
      relations: { itens: { inventario: true } },
      order: { itens: { id: "ASC" } },
    });

    if (!kit) {
      throw new NotFoundException(`Kit ${id} nao encontrado.`);
    }

    return kit;
  }

  async create(dto: CreateKitDto) {
    const entity = this.kitRepository.create({
      nome: dto.nome,
      descricao: dto.descricao,
      usando: dto.usando ?? false,
      itens: dto.itens?.map((item) =>
        this.kitItemRepository.create({
          inventarioId: item.inventarioId,
          quantidade: item.quantidade ?? 1,
        }),
      ),
    });

    return this.kitRepository.save(entity);
  }

  async update(id: number, dto: UpdateKitDto) {
    const kit = await this.findOne(id);
    this.kitRepository.merge(kit, dto);
    return this.kitRepository.save(kit);
  }

  async remove(id: number) {
    const kit = await this.findOne(id);
    await this.kitRepository.remove(kit);
    return { deleted: true };
  }

  async createItem(dto: CreateStandaloneKitItemDto) {
    await this.findOne(dto.kitId);
    const entity = this.kitItemRepository.create(dto);
    return this.kitItemRepository.save(entity);
  }

  async updateItem(id: number, dto: UpdateKitItemDto) {
    const item = await this.kitItemRepository.findOneBy({ id });

    if (!item) {
      throw new NotFoundException(`KitItem ${id} nao encontrado.`);
    }

    this.kitItemRepository.merge(item, dto);
    return this.kitItemRepository.save(item);
  }

  async removeItem(id: number) {
    const item = await this.kitItemRepository.findOneBy({ id });

    if (!item) {
      throw new NotFoundException(`KitItem ${id} nao encontrado.`);
    }

    await this.kitItemRepository.remove(item);
    return { deleted: true };
  }
}
