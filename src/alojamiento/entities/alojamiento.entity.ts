import { create } from 'domain';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('alojamientos')
export class Alojamiento {
  @PrimaryGeneratedColumn()
  id_alojamiento: number;

  @Column({ length: 150 })
  name: string;

  @Column({ unique: true })
  url: string;

  @Column({ length: 150 })
  type: string;

  @Column({ length: 150 })
  gender: string;

  @Column({ type: 'json' })
  FreeService: string[];

  @Column({ type: 'json' })
  PaidService: string[];

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  qualification: number;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
