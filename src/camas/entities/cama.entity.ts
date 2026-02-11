import { EstadoAlojamiento } from 'src/common/enums/estadoAlojamiento.enum';
import { Cuarto } from 'src/cuartos/entities/cuarto.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Renta } from 'src/renta/entities/renta.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('camas')
export class Cama {
  @PrimaryGeneratedColumn()
  id_cama: number;

  @Column()
  name: string;

  @Column()
  identification: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EstadoAlojamiento,
    default: EstadoAlojamiento.ACTIVO,
  })
  estatus: EstadoAlojamiento;

  @ManyToOne(() => Cuarto, (cuarto) => cuarto.camas)
  @JoinColumn({ name: 'id_cuarto' })
  cuarto: Cuarto;

  @Column()
  id_cuarto: number;

  @OneToMany(() => Renta, (renta) => renta.cama)
  rentas: Renta[];

  @ManyToOne(() => Empresa, (empresa) => empresa.users)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column({ nullable: true })
  userEmail: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;
}
