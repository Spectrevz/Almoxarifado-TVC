import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class CreateStandaloneMovimentacaoItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  movimentacaoId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  kitItemId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  unidadeInventarioId!: number;
}
