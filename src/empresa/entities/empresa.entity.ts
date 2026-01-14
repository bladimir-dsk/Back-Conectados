import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Empresa {
  @PrimaryGeneratedColumn()
  id_empresa: number;

  @Column({ nullable: false, default: 'sin name' })
  name: string;

  @Column({ nullable: true })
  rfc: string;

  @OneToMany(() => User, (user) => user.empresa)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;
}
