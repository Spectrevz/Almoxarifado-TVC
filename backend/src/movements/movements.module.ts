import { Module } from "@nestjs/common";
import { MovimentacoesModule } from "../movimentacoes/movimentacoes.module";
import { MovementsController } from "./movements.controller";
import { MovementsService } from "./movements.service";

@Module({
  imports: [MovimentacoesModule],
  controllers: [MovementsController],
  providers: [MovementsService],
})
export class MovementsModule {}
