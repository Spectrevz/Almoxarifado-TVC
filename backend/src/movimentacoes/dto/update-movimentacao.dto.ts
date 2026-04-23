import { PartialType } from "@nestjs/mapped-types";
import { CreateMovimentacaoDto } from "./create-movimentacao.dto";

export class UpdateMovimentacaoDto extends PartialType(CreateMovimentacaoDto) {}
