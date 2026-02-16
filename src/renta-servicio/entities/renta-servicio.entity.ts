import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Servicio } from 'src/servicios/entities/servicio.entity';
import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Renta } from 'src/renta/entities/renta.entity';

@Entity('renta_servicios')
export class RentaServicio {
  @PrimaryGeneratedColumn()
  id_rentaServicio: number;

  // 🔹 Relación con Renta
  @ManyToOne(() => Renta, (renta) => renta.rentaServicios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_renta' })
  renta: Renta;

  @Column()
  id_renta: number;

  // 🔹 Relación con Servicio
  @ManyToOne(() => Servicio)
  @JoinColumn({ name: 'id_servicio' })
  servicio: Servicio;

  @Column()
  id_servicio: number;

  // 🔥 Precio del servicio en el momento de la renta
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  // 🔹 Usuario
  @Column()
  userEmail: string;

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  // 🔹 Empresa
  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column()
  id_empresa: number;
}
