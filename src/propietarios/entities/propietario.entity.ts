import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { EstadoPropietario } from 'src/common/enums/estadoPropietario.enum';
import { Role } from 'src/common/enums/rol.enum';
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

@Entity()
export class Propietario {
  @PrimaryGeneratedColumn()
  id_propietario: number;

  @Column()
  namePersonal: string;

  @Column()
  emailPersonal: string;

  @Column()
  lastName: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ type: 'enum', default: Role.PROPIETARIO, enum: Role })
  role: Role;

  @Column({ nullable: true })
  code: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ default: false })
  aplicaEnUsuario: boolean;

  @Column({
    type: 'enum',
    default: EstadoPropietario.PENDIENTE,
    enum: EstadoPropietario,
  })
  estatus: EstadoPropietario;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'id_usuario' })
  user: User;

  @Column({ nullable: true })
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @OneToMany(() => Alojamiento, (alojamiento) => alojamiento.propietario)
  alojamientos: Alojamiento[];
}
