import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Genero } from 'src/common/enums/genero.enum';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Entity()
export class StudentInformation {
  @PrimaryGeneratedColumn()
  id_student_information: number;

  @Column()
  curp: string;

  @Column()
  codigoPostal: string;

  @Column()
  estado: string;

  @Column()
  localidad: string;

  @Column()
  direccion: string;

  @Column({ type: 'enum', enum: Genero })
  genero: Genero;

  @Column()
  imgUrl: string;

  @ManyToOne(() => User, (user) => user.studentInformations)
  // @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  @JoinColumn({ name: 'id_user', referencedColumnName: 'id' })
  user: User;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  id_user: number;

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
