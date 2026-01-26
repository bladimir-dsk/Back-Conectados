import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Entity('planes')
export class Plan {
  @PrimaryGeneratedColumn()
  id_plan: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column({ nullable: true })
  userEmail: string;
}
