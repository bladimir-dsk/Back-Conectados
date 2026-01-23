import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('planes')
export class Plan {

  @PrimaryGeneratedColumn()
  id_plan: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;
}
