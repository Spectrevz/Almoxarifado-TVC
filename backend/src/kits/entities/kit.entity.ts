import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Movimentacao } from "../../movimentacoes/entities/movimentacao.entity";
import { KitItem } from "./kit-item.entity";

@Entity({ name: "Kit" })
export class Kit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  nome!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  descricao?: string | null;

  @Column({ type: "boolean", default: false })
  usando!: boolean;

  @OneToMany(() => KitItem, (kitItem) => kitItem.kit, { cascade: true })
  itens!: KitItem[];

  @OneToMany(() => Movimentacao, (movimentacao) => movimentacao.kit)
  movimentacoes!: Movimentacao[];
}
