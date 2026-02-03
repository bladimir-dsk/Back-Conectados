import { create } from 'domain';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('alojamientos')
export class Alojamiento {
  @PrimaryGeneratedColumn()
  id_alojamiento: number;

  @Column({ length: 150 })
  name: string;

  @Column()
  url: string;

  @Column({ length: 150 })
  type: string;

  @Column({ length: 150 })
  gender: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  qualification: number;

  @ManyToMany(() => Servicio, (servicio) => servicio.alojamientos)
  @JoinTable({
    name: 'alojamiento_servicio',
    joinColumn: {
      name: 'id_alojamiento',
      referencedColumnName: 'id_alojamiento',
    },
    inverseJoinColumn: {
      name: 'id_servicio',
      referencedColumnName: 'id_servicio',
    },
  })
  servicios: Servicio[];

  @ManyToOne(() => PlanVigencia, (planVigencia) => planVigencia.id_PlanVigencia)
  @JoinColumn({ name: 'id_PlanVigencia' })
  planVigencia: PlanVigencia;

  @ManyToOne(() => Empresa, (empresa) => empresa.users)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column({ nullable: true })
  userEmail: string;

  // @Column()
  // id_empresas: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
