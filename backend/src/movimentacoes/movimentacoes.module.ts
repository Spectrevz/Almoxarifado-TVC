import { Module } from "@nestjs/common";
import { MovimentacoesController } from "./movimentacoes.controller";
import { MovimentacoesService } from "./movimentacoes.service";

@Module({
  controllers: [MovimentacoesController],
  providers: [MovimentacoesService],
  exports: [MovimentacoesService],
})
export class MovimentacoesModule {}
