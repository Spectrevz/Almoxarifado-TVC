import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateKitItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  inventarioId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantidade?: number;
}

export class CreateKitDto {
  @IsString()
  @Length(1, 255)
  nome!: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  usando?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateKitItemDto)
  itens?: CreateKitItemDto[];
}
