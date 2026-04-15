import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { IdParamDto } from "../common/dto/id-param.dto";
import { CreateMovimentacaoDto } from "./dto/create-movimentacao.dto";
import { CreateStandaloneMovimentacaoItemDto } from "./dto/create-movimentacao-item.dto";
import { FinalizarMovimentacaoDto } from "./dto/finalizar-movimentacao.dto";
import { UpdateMovimentacaoDto } from "./dto/update-movimentacao.dto";
import { UpdateMovimentacaoItemDto } from "./dto/update-movimentacao-item.dto";
import { MovimentacoesService } from "./movimentacoes.service";

@Controller("movimentacoes")
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Get()
  findAll() {
    return this.movimentacoesService.findAll();
  }

  @Get(":id")
  findOne(@Param() params: IdParamDto) {
    return this.movimentacoesService.findOne(params.id);
  }

  @Post()
  create(@Body() dto: CreateMovimentacaoDto) {
    return this.movimentacoesService.create(dto);
  }

  @Patch(":id")
  update(@Param() params: IdParamDto, @Body() dto: UpdateMovimentacaoDto) {
    return this.movimentacoesService.update(params.id, dto);
  }

  @Patch(":id/devolucao")
  finalize(
    @Param() params: IdParamDto,
    @Body() dto: FinalizarMovimentacaoDto,
  ) {
    return this.movimentacoesService.finalize(params.id, dto);
  }

  @Delete(":id")
  remove(@Param() params: IdParamDto) {
    return this.movimentacoesService.remove(params.id);
  }

  @Post("itens")
  createItem(@Body() dto: CreateStandaloneMovimentacaoItemDto) {
    return this.movimentacoesService.createItem(dto);
  }

  @Patch("itens/:id")
  updateItem(
    @Param() params: IdParamDto,
    @Body() dto: UpdateMovimentacaoItemDto,
  ) {
    return this.movimentacoesService.updateItem(params.id, dto);
  }

  @Delete("itens/:id")
  removeItem(@Param() params: IdParamDto) {
    return this.movimentacoesService.removeItem(params.id);
  }
}
