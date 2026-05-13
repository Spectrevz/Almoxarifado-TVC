import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { InventarioModule } from "./inventario/inventario.module";
import { KitsModule } from "./kits/kits.module";
import { MovementsModule } from "./movements/movements.module";
import { MovimentacoesModule } from "./movimentacoes/movimentacoes.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    InventarioModule,
    KitsModule,
    MovementsModule,
    MovimentacoesModule,
  ],
})
export class AppModule {}
