import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateMovimentacaoDto } from "./dto/create-movimentacao.dto";
import { CreateStandaloneMovimentacaoItemDto } from "./dto/create-movimentacao-item.dto";
import { FinalizarMovimentacaoDto } from "./dto/finalizar-movimentacao.dto";
import { UpdateMovimentacaoDto } from "./dto/update-movimentacao.dto";
import { UpdateMovimentacaoItemDto } from "./dto/update-movimentacao-item.dto";
import { MovimentacaoItem } from "./entities/movimentacao-item.entity";
import { Movimentacao } from "./entities/movimentacao.entity";

@Injectable()
export class MovimentacoesService {
  constructor(
    @InjectRepository(Movimentacao)
    private readonly movimentacaoRepository: Repository<Movimentacao>,
    @InjectRepository(MovimentacaoItem)
    private readonly movimentacaoItemRepository: Repository<MovimentacaoItem>,
  ) {}

  findAll() {
    return this.movimentacaoRepository.find({
      relations: {
        kit: true,
        itens: {
          kitItem: { inventario: true },
          unidadeInventario: { inventario: true },
        },
      },
      order: { id: "DESC", itens: { id: "ASC" } },
    });
  }

  async findOne(id: number) {
    const movimentacao = await this.movimentacaoRepository.findOne({
      where: { id },
      relations: {
        kit: true,
        itens: {
          kitItem: { inventario: true },
          unidadeInventario: { inventario: true },
        },
      },
      order: { itens: { id: "ASC" } },
    });

    if (!movimentacao) {
      throw new NotFoundException(`Movimentacao ${id} nao encontrada.`);
    }

    return movimentacao;
  }

  async create(dto: CreateMovimentacaoDto) {
    const entity = this.movimentacaoRepository.create({
      kitId: dto.kitId,
      dataSaida: dto.dataSaida,
      horaSaida: dto.horaSaida,
      dataDevolucao: dto.dataDevolucao,
      horaDevolucao: dto.horaDevolucao,
      responsavelSaida: dto.responsavelSaida,
      responsavelRetorno: dto.responsavelRetorno,
      observacao: dto.observacao,
      itens: dto.itens?.map((item) =>
        this.movimentacaoItemRepository.create({
          kitItemId: item.kitItemId,
          unidadeInventarioId: item.unidadeInventarioId,
        }),
      ),
    });

    return this.movimentacaoRepository.save(entity);
  }

  async update(id: number, dto: UpdateMovimentacaoDto) {
    const movimentacao = await this.findOne(id);
    this.movimentacaoRepository.merge(movimentacao, dto);
    return this.movimentacaoRepository.save(movimentacao);
  }

  async finalize(id: number, dto: FinalizarMovimentacaoDto) {
    const movimentacao = await this.findOne(id);
    const now = new Date();

    movimentacao.dataDevolucao =
      dto.dataDevolucao ??
      new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
    movimentacao.horaDevolucao =
      dto.horaDevolucao ??
      `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`;
    movimentacao.responsavelRetorno =
      dto.responsavelRetorno ?? movimentacao.responsavelRetorno;

    return this.movimentacaoRepository.save(movimentacao);
  }

  async remove(id: number) {
    const movimentacao = await this.findOne(id);
    await this.movimentacaoRepository.remove(movimentacao);
    return { deleted: true };
  }

  async createItem(dto: CreateStandaloneMovimentacaoItemDto) {
    await this.findOne(dto.movimentacaoId);

    const entity = this.movimentacaoItemRepository.create({
      movimentacaoId: dto.movimentacaoId,
      kitItemId: dto.kitItemId,
      unidadeInventarioId: dto.unidadeInventarioId,
    });

    return this.movimentacaoItemRepository.save(entity);
  }

  async updateItem(id: number, dto: UpdateMovimentacaoItemDto) {
    const item = await this.movimentacaoItemRepository.findOneBy({ id });

    if (!item) {
      throw new NotFoundException(`MovimentacaoItem ${id} nao encontrado.`);
    }

    if (dto.movimentacaoId !== undefined) item.movimentacaoId = dto.movimentacaoId;
    if (dto.kitItemId !== undefined) item.kitItemId = dto.kitItemId;
    if (dto.unidadeInventarioId !== undefined) {
      item.unidadeInventarioId = dto.unidadeInventarioId;
    }

    return this.movimentacaoItemRepository.save(item);
  }

  async removeItem(id: number) {
    const item = await this.movimentacaoItemRepository.findOneBy({ id });

    if (!item) {
      throw new NotFoundException(`MovimentacaoItem ${id} nao encontrado.`);
    }

    await this.movimentacaoItemRepository.remove(item);
    return { deleted: true };
  }
}
