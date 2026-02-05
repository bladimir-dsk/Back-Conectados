import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Entity('alojamiento_servicios')
export class AlojamientoServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Alojamiento, (a) => a.servicios)
  @JoinColumn({ name: 'alojamiento_id' })
  alojamiento: Alojamiento;

  @ManyToOne(() => Servicio)
  @JoinColumn({ name: 'servicio_id' })
  servicio: Servicio;

  @Column({ type: 'decimal', nullable: true })
  costo: number | null;

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
