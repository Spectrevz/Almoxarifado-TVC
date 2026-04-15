import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";

export class CreateStandaloneKitItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  kitId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  inventarioId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantidade!: number;
}
