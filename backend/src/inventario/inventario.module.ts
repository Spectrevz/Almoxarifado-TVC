import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InventarioController } from "./inventario.controller";
import { InventarioService } from "./inventario.service";
import { Inventario } from "./entities/inventario.entity";
import { UnidadeInventario } from "./entities/unidade-inventario.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Inventario, UnidadeInventario])],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [TypeOrmModule],
})
export class InventarioModule {}
