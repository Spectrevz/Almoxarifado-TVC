import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UnidadeInventario } from "../../inventario/entities/unidade-inventario.entity";
import { KitItem } from "../../kits/entities/kit-item.entity";
import { Movimentacao } from "./movimentacao.entity";

@Entity({ name: "Movimentacaoitem" })
export class MovimentacaoItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", name: "mmovimentacaoId" })
  movimentacaoId!: number;

  @Column({ type: "int" })
  kitItemId!: number;

  @Column({ type: "int" })
  unidadeInventarioId!: number;

  @ManyToOne(() => Movimentacao, (movimentacao) => movimentacao.itens, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "mmovimentacaoId" })
  movimentacao!: Movimentacao;

  @ManyToOne(() => KitItem, (kitItem) => kitItem.movimentacaoItens)
  @JoinColumn({ name: "kitItemId" })
  kitItem!: KitItem;

  @ManyToOne(
    () => UnidadeInventario,
    (unidadeInventario) => unidadeInventario.movimentacaoItens,
  )
  @JoinColumn({ name: "unidadeInventarioId" })
  unidadeInventario!: UnidadeInventario;
}
