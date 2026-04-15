import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HealthModule } from "./health/health.module";
import { InventarioModule } from "./inventario/inventario.module";
import { KitsModule } from "./kits/kits.module";
import { MovementsModule } from "./movements/movements.module";
import { MovimentacoesModule } from "./movimentacoes/movimentacoes.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST ?? process.env.PGHOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? process.env.PGPORT ?? 5432),
      username: process.env.DB_USER ?? process.env.PGUSER ?? "postgres",
      password: process.env.DB_PASSWORD ?? process.env.PGPASSWORD ?? "",
      database:
        process.env.DB_NAME ?? process.env.PGDATABASE ?? "almoxarifado",
      autoLoadEntities: true,
      synchronize: false,
      logging:
        process.env.DB_LOGGING === "true" ||
        process.env.TYPEORM_LOGGING === "true",
    }),
    HealthModule,
    InventarioModule,
    KitsModule,
    MovementsModule,
    MovimentacoesModule,
  ],
})
export class AppModule {}
