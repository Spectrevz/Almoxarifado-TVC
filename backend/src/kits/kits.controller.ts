import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { IdParamDto } from "../common/dto/id-param.dto";
import { CreateKitDto } from "./dto/create-kit.dto";
import { CreateStandaloneKitItemDto } from "./dto/create-kit-item.dto";
import { UpdateKitDto } from "./dto/update-kit.dto";
import { UpdateKitItemDto } from "./dto/update-kit-item.dto";
import { KitsService } from "./kits.service";

@Controller("kits")
export class KitsController {
  constructor(private readonly kitsService: KitsService) {}

  @Get()
  findAll() {
    return this.kitsService.findAll();
  }

  @Get(":id")
  findOne(@Param() params: IdParamDto) {
    return this.kitsService.findOne(params.id);
  }

  @Post()
  create(@Body() dto: CreateKitDto) {
    return this.kitsService.create(dto);
  }

  @Patch(":id")
  update(@Param() params: IdParamDto, @Body() dto: UpdateKitDto) {
    return this.kitsService.update(params.id, dto);
  }

  @Delete(":id")
  remove(@Param() params: IdParamDto) {
    return this.kitsService.remove(params.id);
  }

  @Post("itens")
  createItem(@Body() dto: CreateStandaloneKitItemDto) {
    return this.kitsService.createItem(dto);
  }

  @Patch("itens/:id")
  updateItem(@Param() params: IdParamDto, @Body() dto: UpdateKitItemDto) {
    return this.kitsService.updateItem(params.id, dto);
  }

  @Delete("itens/:id")
  removeItem(@Param() params: IdParamDto) {
    return this.kitsService.removeItem(params.id);
  }
}
