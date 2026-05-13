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
import { CreateKitDto } from "./dto/create-kit.dto";
import { CreateStandaloneKitItemDto } from "./dto/create-kit-item.dto";
import { UpdateKitDto } from "./dto/update-kit.dto";
import { UpdateKitItemDto } from "./dto/update-kit-item.dto";
import { KitsService } from "./kits.service";

@Controller("kits")
export class KitsController {
  constructor(
    @Inject(KitsService)
    private readonly kitsService: KitsService,
  ) {}

  @Get()
  findAll() {
    return this.kitsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.kitsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateKitDto) {
    return this.kitsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateKitDto) {
    return this.kitsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.kitsService.remove(id);
  }

  @Post("itens")
  createItem(@Body() dto: CreateStandaloneKitItemDto) {
    return this.kitsService.createItem(dto);
  }

  @Patch("itens/:id")
  updateItem(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateKitItemDto) {
    return this.kitsService.updateItem(id, dto);
  }

  @Delete("itens/:id")
  removeItem(@Param("id", ParseIntPipe) id: number) {
    return this.kitsService.removeItem(id);
  }
}
