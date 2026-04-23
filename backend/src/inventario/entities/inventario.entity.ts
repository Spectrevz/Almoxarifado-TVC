import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { KitItem } from "../../kits/entities/kit-item.entity";
import { UnidadeInventario } from "./unidade-inventario.entity";

@Entity({ name: "Inventario" })
export class Inventario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  nome!: string;

  @Column({ type: "varchar", length: 255 })
  categoria!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  observacao?: string | null;

  @OneToMany(() => UnidadeInventario, (unidade) => unidade.inventario, {
    cascade: true,
  })
  unidades!: UnidadeInventario[];

  @OneToMany(() => KitItem, (kitItem) => kitItem.inventario)
  kitItens!: KitItem[];
}
