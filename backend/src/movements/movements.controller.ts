import { Controller, Get, Inject, Query } from "@nestjs/common";
import { MovementsQueryDto } from "./dto/movements-query.dto";
import { MovementsService } from "./movements.service";

@Controller("movements")
export class MovementsController {
  constructor(
    @Inject(MovementsService)
    private readonly movementsService: MovementsService,
  ) {}

  @Get()
  findAll(@Query() query: MovementsQueryDto) {
    return this.movementsService.findAll(query);
  }
}
