import { PartialType } from "@nestjs/mapped-types";
import { CreateStandaloneKitItemDto } from "./create-kit-item.dto";

export class UpdateKitItemDto extends PartialType(CreateStandaloneKitItemDto) {}
