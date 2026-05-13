import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateMovimentacaoDto } from "./dto/create-movimentacao.dto";
import { CreateStandaloneMovimentacaoItemDto } from "./dto/create-movimentacao-item.dto";
import { FinalizarMovimentacaoDto } from "./dto/finalizar-movimentacao.dto";
import { UpdateMovimentacaoDto } from "./dto/update-movimentacao.dto";
import { UpdateMovimentacaoItemDto } from "./dto/update-movimentacao-item.dto";
import { MovimentacoesService } from "./movimentacoes.service";

@Controller("movimentacoes")
export class MovimentacoesController {
  constructor(
    @Inject(MovimentacoesService)
    private readonly movimentacoesService: MovimentacoesService,
  ) {}

  @Get()
  findAll() {
    return this.movimentacoesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.movimentacoesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMovimentacaoDto) {
    return this.movimentacoesService.create(dto);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateMovimentacaoDto) {
    return this.movimentacoesService.update(id, dto);
  }

  @Patch(":id/devolucao")
  finalize(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: FinalizarMovimentacaoDto,
  ) {
    return this.movimentacoesService.finalize(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.movimentacoesService.remove(id);
  }

  @Post("itens")
  createItem(@Body() dto: CreateStandaloneMovimentacaoItemDto) {
    return this.movimentacoesService.createItem(dto);
  }

  @Patch("itens/:id")
  updateItem(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateMovimentacaoItemDto,
  ) {
    return this.movimentacoesService.updateItem(id, dto);
  }

  @Delete("itens/:id")
  removeItem(@Param("id", ParseIntPipe) id: number) {
    return this.movimentacoesService.removeItem(id);
  }
}
