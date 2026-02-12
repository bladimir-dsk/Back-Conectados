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
  OneToMany,
} from 'typeorm';
import { AlojamientoServicio } from 'src/alojamiento_servicios/entities/alojamiento_servicio.entity';
import { Propietario } from 'src/propietarios/entities/propietario.entity';
import { EstadoAlojamiento } from 'src/common/enums/estadoAlojamiento.enum';
import { Cuarto } from 'src/cuartos/entities/cuarto.entity';
import { Renta } from 'src/renta/entities/renta.entity';
import { TipoRenta } from 'src/common/enums/tipoRenta.enum';
import { Foto } from 'src/fotos/entities/foto.entity';
@Entity('alojamientos')
export class Alojamiento {
  @PrimaryGeneratedColumn()
  id_alojamiento: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio_completo: number; // 2000 por mes

  @Column({ length: 150 })
  typeProperty: string;

  @Column({ length: 150 })
  gender: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  codePostal: string;

  @Column()
  address: string;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column({ type: 'enum', enum: TipoRenta })
  typeIncome: TipoRenta;

  @OneToMany(() => Cuarto, (cuarto) => cuarto.alojamiento)
  cuartos: Cuarto[];

  @OneToMany(() => Renta, (renta) => renta.alojamiento)
  rentas: Renta[];

  @Column({
    type: 'enum',
    enum: EstadoAlojamiento,
    default: EstadoAlojamiento.ACTIVO,
  })
  estatus: EstadoAlojamiento;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Propietario, (propietario) => propietario.alojamientos)
  @JoinColumn({ name: 'id_propietario' })
  propietario: Propietario;

  @OneToMany(() => AlojamientoServicio, (as) => as.alojamiento)
  servicios: AlojamientoServicio[];

  // @ManyToOne(() => PlanVigencia, (planVigencia) => planVigencia.id_PlanVigencia)
  // @JoinColumn({ name: 'id_PlanVigencia' })
  // planVigencia: PlanVigencia;

  @ManyToOne(() => Empresa, (empresa) => empresa.users)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column({ nullable: true })
  userEmail: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  @OneToMany(() => Foto, (foto) => foto.alojamiento)
  fotos: Foto[];

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
