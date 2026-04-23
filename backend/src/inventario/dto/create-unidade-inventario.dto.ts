import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreateStandaloneUnidadeInventarioDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  inventarioId!: number;

  @IsString()
  @Length(1, 100)
  patrimonio!: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  status?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  observacao?: string;
}
