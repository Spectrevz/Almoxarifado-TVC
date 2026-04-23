import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Kit } from "../../kits/entities/kit.entity";
import { MovimentacaoItem } from "./movimentacao-item.entity";

@Entity({ name: "Movimentacao" })
export class Movimentacao {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", name: "kitid" })
  kitId!: number;

  @Column({ type: "date", name: "datasaida" })
  dataSaida!: string;

  @Column({ type: "time", nullable: true, name: "horasaida" })
  horaSaida?: string | null;

  @Column({ type: "date", nullable: true, name: "datadevolucao" })
  dataDevolucao?: string | null;

  @Column({ type: "time", nullable: true, name: "horadevolucao" })
  horaDevolucao?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true, name: "responsavelsaida" })
  responsavelSaida?: string | null;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    name: "responsavelretorno",
  })
  responsavelRetorno?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  observacao?: string | null;

  @ManyToOne(() => Kit, (kit) => kit.movimentacoes)
  @JoinColumn({ name: "kitid" })
  kit!: Kit;

  @OneToMany(
    () => MovimentacaoItem,
    (movimentacaoItem) => movimentacaoItem.movimentacao,
    { cascade: true },
  )
  itens!: MovimentacaoItem[];
}
