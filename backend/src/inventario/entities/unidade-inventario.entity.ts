import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MovimentacaoItem } from "../../movimentacoes/entities/movimentacao-item.entity";
import { Inventario } from "./inventario.entity";

@Entity({ name: "Unidadeinventario" })
export class UnidadeInventario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  inventarioId!: number;

  @Column({ type: "varchar", length: 100 })
  patrimonio!: string;

  @Column({ type: "varchar", length: 255, default: "disponivel" })
  status!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  observacao?: string | null;

  @ManyToOne(() => Inventario, (inventario) => inventario.unidades, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "inventarioId" })
  inventario!: Inventario;

  @OneToMany(
    () => MovimentacaoItem,
    (movimentacaoItem) => movimentacaoItem.unidadeInventario,
  )
  movimentacaoItens!: MovimentacaoItem[];
}
