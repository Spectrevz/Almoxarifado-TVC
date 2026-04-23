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

  @Column({ type: "int", name: "mmovimentacaoid" })
  movimentacaoId!: number;

  @Column({ type: "int", name: "kititemid" })
  kitItemId!: number;

  @Column({ type: "int", name: "unidadeinventarioid" })
  unidadeInventarioId!: number;

  @ManyToOne(() => Movimentacao, (movimentacao) => movimentacao.itens, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "mmovimentacaoid" })
  movimentacao!: Movimentacao;

  @ManyToOne(() => KitItem, (kitItem) => kitItem.movimentacaoItens)
  @JoinColumn({ name: "kititemid" })
  kitItem!: KitItem;

  @ManyToOne(
    () => UnidadeInventario,
    (unidadeInventario) => unidadeInventario.movimentacaoItens,
  )
  @JoinColumn({ name: "unidadeinventarioid" })
  unidadeInventario!: UnidadeInventario;
}
