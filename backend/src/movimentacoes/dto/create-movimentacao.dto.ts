import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateMovimentacaoItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  kitItemId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  unidadeInventarioId!: number;
}

export class CreateMovimentacaoDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  kitId!: number;

  @IsDateString()
  dataSaida!: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horaSaida?: string;

  @IsOptional()
  @IsDateString()
  dataDevolucao?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horaDevolucao?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  responsavelSaida?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  responsavelRetorno?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  observacao?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMovimentacaoItemDto)
  itens?: CreateMovimentacaoItemDto[];
}
