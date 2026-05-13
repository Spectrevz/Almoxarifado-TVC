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
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.inventarioService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInventarioDto) {
    return this.inventarioService.create(dto);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateInventarioDto) {
    return this.inventarioService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.inventarioService.remove(id);
  }

  @Post("unidades")
  createUnidade(@Body() dto: CreateStandaloneUnidadeInventarioDto) {
    return this.inventarioService.createUnidade(dto);
  }

  @Patch("unidades/:id")
  updateUnidade(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateUnidadeInventarioDto,
  ) {
    return this.inventarioService.updateUnidade(id, dto);
  }

  @Delete("unidades/:id")
  removeUnidade(@Param("id", ParseIntPipe) id: number) {
    return this.inventarioService.removeUnidade(id);
  }
}
