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

  @Column({ type: "int" })
  kitId!: number;

  @Column({ type: "date" })
  dataSaida!: string;

  @Column({ type: "time", nullable: true })
  horaSaida?: string | null;

  @Column({ type: "date", nullable: true })
  dataDevolucao?: string | null;

  @Column({ type: "time", nullable: true })
  horaDevolucao?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  responsavelSaida?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  responsavelRetorno?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  observacao?: string | null;

  @ManyToOne(() => Kit, (kit) => kit.movimentacoes)
  @JoinColumn({ name: "kitId" })
  kit!: Kit;

  @OneToMany(
    () => MovimentacaoItem,
    (movimentacaoItem) => movimentacaoItem.movimentacao,
    { cascade: true },
  )
  itens!: MovimentacaoItem[];
}
