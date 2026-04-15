import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MovimentacoesController } from "./movimentacoes.controller";
import { MovimentacoesService } from "./movimentacoes.service";
import { MovimentacaoItem } from "./entities/movimentacao-item.entity";
import { Movimentacao } from "./entities/movimentacao.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Movimentacao, MovimentacaoItem])],
  controllers: [MovimentacoesController],
  providers: [MovimentacoesService],
  exports: [MovimentacoesService, TypeOrmModule],
})
export class MovimentacoesModule {}
