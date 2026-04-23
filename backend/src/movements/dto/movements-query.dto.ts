import { IsIn, IsOptional, IsString } from "class-validator";

export class MovementsQueryDto {
  @IsOptional()
  @IsIn(["saida", "saída", "entrada"])
  type?: string;

  @IsOptional()
  @IsIn(["ativa", "concluida", "concluída"])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
