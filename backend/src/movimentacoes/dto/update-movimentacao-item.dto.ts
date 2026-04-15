import { PartialType } from "@nestjs/mapped-types";
import { CreateStandaloneMovimentacaoItemDto } from "./create-movimentacao-item.dto";

export class UpdateMovimentacaoItemDto extends PartialType(
  CreateStandaloneMovimentacaoItemDto,
) {}
