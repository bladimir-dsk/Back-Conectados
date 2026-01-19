import { NivelEducativo } from 'src/common/enums/nivel-educativo.enum';
import { TipoEscuela } from 'src/common/enums/tipo-escuela.enum';
import { TurnoEscuela } from 'src/common/enums/turno-escuela.enum';
import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('escuelas')
export class School {
  @PrimaryGeneratedColumn()
  id_school: number;

  @Column()
  name: string;

  @Column({ unique: true })
  cct: string;

  @Column({ type: 'enum', enum: NivelEducativo })
  nivel: NivelEducativo;

  @Column('decimal', { precision: 10, scale: 6 })
  latitud: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitud: number;

  @Column({ type: 'enum', enum: TipoEscuela })
  tipo: TipoEscuela;

  @Column({ type: 'enum', enum: TurnoEscuela })
  turno: TurnoEscuela;

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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
export { NivelEducativo, TipoEscuela, TurnoEscuela };
