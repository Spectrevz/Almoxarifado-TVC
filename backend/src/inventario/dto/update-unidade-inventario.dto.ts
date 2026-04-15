import { PartialType } from "@nestjs/mapped-types";
import { CreateStandaloneUnidadeInventarioDto } from "./create-unidade-inventario.dto";

export class UpdateUnidadeInventarioDto extends PartialType(
  CreateStandaloneUnidadeInventarioDto,
) {}
