import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Inventario } from "../../inventario/entities/inventario.entity";
import { MovimentacaoItem } from "../../movimentacoes/entities/movimentacao-item.entity";
import { Kit } from "./kit.entity";

@Entity({ name: "Kititem" })
export class KitItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  kitId!: number;

  @Column({ type: "int" })
  inventarioId!: number;

  @Column({ type: "int", default: 1 })
  quantidade!: number;

  @ManyToOne(() => Kit, (kit) => kit.itens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "kitId" })
  kit!: Kit;

  @ManyToOne(() => Inventario, (inventario) => inventario.kitItens)
  @JoinColumn({ name: "inventarioId" })
  inventario!: Inventario;

  @OneToMany(
    () => MovimentacaoItem,
    (movimentacaoItem) => movimentacaoItem.kitItem,
  )
  movimentacaoItens!: MovimentacaoItem[];
}
