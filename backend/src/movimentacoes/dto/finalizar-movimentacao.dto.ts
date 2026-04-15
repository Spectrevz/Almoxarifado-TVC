import { IsDateString, IsOptional, IsString, Length, Matches } from "class-validator";

export class FinalizarMovimentacaoDto {
  @IsOptional()
  @IsDateString()
  dataDevolucao?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  horaDevolucao?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  responsavelRetorno?: string;
}
