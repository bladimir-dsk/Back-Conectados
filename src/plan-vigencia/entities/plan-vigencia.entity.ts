import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Plan } from 'src/plan/entities/plan.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Entity('plan_vigencia')
export class PlanVigencia {
  @PrimaryGeneratedColumn()
  id_PlanVigencia: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  duration: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  //Relaciones

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'id_plan' })
  plan: Plan;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column({ nullable: true })
  userEmail: string;

  // @OneToMany(() => Alojamiento, (alojamiento) => alojamiento.planVigencia)
  // alojamientos: Alojamiento[];
}
