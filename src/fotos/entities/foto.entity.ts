import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Foto {
  @PrimaryGeneratedColumn()
  id_foto: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: false })
  esPrincipal: boolean;

  @ManyToOne(() => Alojamiento, (alojamiento) => alojamiento.fotos)
  @JoinColumn({ name: 'id_alojamiento' })
  alojamiento: Alojamiento;

  @ManyToOne(() => Empresa, (empresa) => empresa.users)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column({ nullable: true })
  userEmail: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;
}
