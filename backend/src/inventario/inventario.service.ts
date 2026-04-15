import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateInventarioDto } from "./dto/create-inventario.dto";
import { CreateStandaloneUnidadeInventarioDto } from "./dto/create-unidade-inventario.dto";
import { UpdateInventarioDto } from "./dto/update-inventario.dto";
import { UpdateUnidadeInventarioDto } from "./dto/update-unidade-inventario.dto";
import { Inventario } from "./entities/inventario.entity";
import { UnidadeInventario } from "./entities/unidade-inventario.entity";

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventarioRepository: Repository<Inventario>,
    @InjectRepository(UnidadeInventario)
    private readonly unidadeRepository: Repository<UnidadeInventario>,
  ) {}

  findAll() {
    return this.inventarioRepository.find({
      relations: { unidades: true },
      order: { id: "ASC", unidades: { id: "ASC" } },
    });
  }

  async findOne(id: number) {
    const inventario = await this.inventarioRepository.findOne({
      where: { id },
      relations: { unidades: true },
      order: { unidades: { id: "ASC" } },
    });

    if (!inventario) {
      throw new NotFoundException(`Inventario ${id} nao encontrado.`);
    }

    return inventario;
  }

  async create(dto: CreateInventarioDto) {
    const entity = this.inventarioRepository.create({
      nome: dto.nome,
      categoria: dto.categoria,
      observacao: dto.observacao,
      unidades: dto.unidades?.map((unidade) =>
        this.unidadeRepository.create({
          patrimonio: unidade.patrimonio,
          status: unidade.status ?? "disponivel",
          observacao: unidade.observacao,
        }),
      ),
    });

    return this.inventarioRepository.save(entity);
  }

  async update(id: number, dto: UpdateInventarioDto) {
    const inventario = await this.findOne(id);
    this.inventarioRepository.merge(inventario, dto);
    return this.inventarioRepository.save(inventario);
  }

  async remove(id: number) {
    const inventario = await this.findOne(id);
    await this.inventarioRepository.remove(inventario);
    return { deleted: true };
  }

  async createUnidade(dto: CreateStandaloneUnidadeInventarioDto) {
    await this.findOne(dto.inventarioId);

    const entity = this.unidadeRepository.create({
      inventarioId: dto.inventarioId,
      patrimonio: dto.patrimonio,
      status: dto.status ?? "disponivel",
      observacao: dto.observacao,
    });

    return this.unidadeRepository.save(entity);
  }

  async updateUnidade(id: number, dto: UpdateUnidadeInventarioDto) {
    const unidade = await this.unidadeRepository.findOneBy({ id });

    if (!unidade) {
      throw new NotFoundException(`UnidadeInventario ${id} nao encontrada.`);
    }

    this.unidadeRepository.merge(unidade, dto);
    return this.unidadeRepository.save(unidade);
  }

  async removeUnidade(id: number) {
    const unidade = await this.unidadeRepository.findOneBy({ id });

    if (!unidade) {
      throw new NotFoundException(`UnidadeInventario ${id} nao encontrada.`);
    }

    await this.unidadeRepository.remove(unidade);
    return { deleted: true };
  }
}
