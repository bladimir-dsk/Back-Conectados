import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TipoRenta } from 'src/common/enums/tipoRenta.enum';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Cuarto } from 'src/cuartos/entities/cuarto.entity';
import { Cama } from 'src/camas/entities/cama.entity';
import { EstadoRenta } from 'src/common/enums/estadoRenta.enum';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Pago } from 'src/pago/entities/pago.entity';
import { RentaServicio } from 'src/renta-servicio/entities/renta-servicio.entity';

@Entity('rentas')
export class Renta {
  @PrimaryGeneratedColumn()
  id_renta: number;

  @Column({ type: 'enum', enum: TipoRenta })
  tipo_renta: TipoRenta;

  @ManyToOne(() => Alojamiento, { nullable: true })
  @JoinColumn({ name: 'id_alojamiento' })
  alojamiento: Alojamiento;

  @Column({ nullable: true })
  id_alojamiento: number;

  @ManyToOne(() => Cuarto, { nullable: true })
  @JoinColumn({ name: 'id_cuarto' })
  cuarto: Cuarto;

  @Column({ nullable: true })
  id_cuarto: number;

  @ManyToOne(() => Cama, { nullable: true })
  @JoinColumn({ name: 'id_cama' })
  cama: Cama;

  @Column({ nullable: true })
  id_cama: number;

  // Usuario que renta
  @Column()
  id_usuario: number;

  // Fechas
  @Column({ type: 'date' })
  fecha_entrada: Date;

  @Column({ type: 'date' })
  fecha_salida: Date;

  @Column({ type: 'int' })
  meses_pagados: number; // Cuántos meses pagó

  // Montos
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_mensual: number; // Precio por mes según tipo

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto_total: number; // precio_mensual * meses_pagados

  @Column({ type: 'enum', enum: EstadoRenta, default: EstadoRenta.PENDIENTE })
  estado: EstadoRenta;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Empresa, (empresa) => empresa.users)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column({ nullable: true })
  userEmail: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  @OneToMany(() => Pago, (pago) => pago.renta)
  pagos: Pago[];

  @OneToMany(() => RentaServicio, (rentaServicio) => rentaServicio.renta)
  rentaServicios: RentaServicio[];
}
