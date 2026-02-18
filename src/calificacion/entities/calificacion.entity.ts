import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity()
@Unique(['alojamiento', 'user'])
export class Calificacion {
  @PrimaryGeneratedColumn()
  id_calificacion: number;

  @Column({ type: 'int' })
  puntuacion: number;

  @Column({ nullable: true })
  comentario: string | null;

  @ManyToOne(() => Alojamiento, (alojamiento) => alojamiento.calificacion)
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
