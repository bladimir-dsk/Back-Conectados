import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Cama } from 'src/camas/entities/cama.entity';
import { EstadoAlojamiento } from 'src/common/enums/estadoAlojamiento.enum';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cuartos')
export class Cuarto {
  @PrimaryGeneratedColumn()
  id_cuarto: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  identification: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EstadoAlojamiento,
    default: EstadoAlojamiento.ACTIVO,
  })
  estatus: EstadoAlojamiento;

  @ManyToOne(() => Alojamiento, (alojamiento) => alojamiento.cuartos)
  @JoinColumn({ name: 'id_alojamiento' })
  alojamiento: Alojamiento;

  @OneToMany(() => Cama, (cama) => cama.cuarto)
  camas: Cama[];

  @ManyToOne(() => Empresa, (empresa) => empresa.users)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column({ nullable: true })
  userEmail: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;
}
