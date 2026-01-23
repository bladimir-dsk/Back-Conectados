import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Plan } from 'src/plan/entities/plan.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import e from 'express';

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

  @Column()
  userEmail: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  //Relaciones
  @ManyToOne(() => Alojamiento, (alojamiento) => alojamiento.planesVigencia, {
    onDelete: 'CASCADE',
  })
  alojamiento: Alojamiento;

  @ManyToOne(() => Plan)
  plan: Plan;

  @ManyToOne(() => Empresa)
  empresa: Empresa;
}
