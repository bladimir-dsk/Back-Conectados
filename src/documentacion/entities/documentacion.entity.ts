import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import {
  ManyToOne,
  JoinColumn,
  Column,
  PrimaryGeneratedColumn,
  Entity,
} from 'typeorm';
import { TypeDocuments } from 'src/common/enums/typeDocuments.enum';
import { EstadoDocumento } from 'src/common/enums/estadoDocumento.enum';

@Entity('documentacion')
export class Documentacion {
  @PrimaryGeneratedColumn()
  id_documentacion: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  size: number;

  @Column()
  documentUrl: string;

  @Column({ type: 'enum', enum: TypeDocuments })
  typeDocument: TypeDocuments;

  @Column({
    type: 'enum',
    enum: EstadoDocumento,
    default: EstadoDocumento.PENDIENTE,
    nullable: true,
  })
  status: EstadoDocumento;

  @Column({ nullable: true })
  observation: string;

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
}
