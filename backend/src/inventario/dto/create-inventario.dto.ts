import { Type } from "class-transformer";
import {
  IsArray,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from "class-validator";

export class CreateUnidadeInventarioDto {
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

export class CreateInventarioDto {
  @IsString()
  @Length(1, 255)
  nome!: string;

  @IsString()
  @Length(1, 255)
  categoria!: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  observacao?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUnidadeInventarioDto)
  unidades?: CreateUnidadeInventarioDto[];
}
