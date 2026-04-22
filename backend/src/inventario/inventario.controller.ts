import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { IdParamDto } from "../common/dto/id-param.dto";
import { CreateInventarioDto } from "./dto/create-inventario.dto";
import { CreateStandaloneUnidadeInventarioDto } from "./dto/create-unidade-inventario.dto";
import { UpdateInventarioDto } from "./dto/update-inventario.dto";
import { UpdateUnidadeInventarioDto } from "./dto/update-unidade-inventario.dto";
import { InventarioService } from "./inventario.service";

@Controller("inventario")
export class InventarioController {
  constructor(
    @Inject(InventarioService)
    private readonly inventarioService: InventarioService,
  ) {}

  @Get()
  findAll() {
    return this.inventarioService.findAll();
  }

  @Get(":id")
  findOne(@Param() params: IdParamDto) {
    return this.inventarioService.findOne(params.id);
  }

  @Post()
  create(@Body() dto: CreateInventarioDto) {
    return this.inventarioService.create(dto);
  }

  @Patch(":id")
  update(@Param() params: IdParamDto, @Body() dto: UpdateInventarioDto) {
    return this.inventarioService.update(params.id, dto);
  }

  @Delete(":id")
  remove(@Param() params: IdParamDto) {
    return this.inventarioService.remove(params.id);
  }

  @Post("unidades")
  createUnidade(@Body() dto: CreateStandaloneUnidadeInventarioDto) {
    return this.inventarioService.createUnidade(dto);
  }

  @Patch("unidades/:id")
  updateUnidade(
    @Param() params: IdParamDto,
    @Body() dto: UpdateUnidadeInventarioDto,
  ) {
    return this.inventarioService.updateUnidade(params.id, dto);
  }

  @Delete("unidades/:id")
  removeUnidade(@Param() params: IdParamDto) {
    return this.inventarioService.removeUnidade(params.id);
  }
}
