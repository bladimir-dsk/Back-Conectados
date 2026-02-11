import { EstadoPago } from 'src/common/enums/estadoPago.enum';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Renta } from 'src/renta/entities/renta.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Renta, (renta) => renta.pagos)
  @JoinColumn({ name: 'id_renta' })
  renta: Renta;

  @Column()
  id_renta: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE })
  estado: EstadoPago;

  @Column({ type: 'varchar', nullable: true })
  metodo_pago: string; // tarjeta, transferencia, etc.

  @Column({ type: 'varchar', nullable: true })
  transaccion_id: string;

  @CreateDateColumn()
  fecha_pago: Date;

  @ManyToOne(() => Empresa, (empresa) => empresa.users)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column({ nullable: true })
  userEmail: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;
}
