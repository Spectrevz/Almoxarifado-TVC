import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KitItem } from "./entities/kit-item.entity";
import { Kit } from "./entities/kit.entity";
import { KitsController } from "./kits.controller";
import { KitsService } from "./kits.service";

@Module({
  imports: [TypeOrmModule.forFeature([Kit, KitItem])],
  controllers: [KitsController],
  providers: [KitsService],
  exports: [TypeOrmModule],
})
export class KitsModule {}
