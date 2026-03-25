import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { User } from 'src/users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('favoritos')
export class Favorito {
  @PrimaryGeneratedColumn()
  id_favorito: number;

  @ManyToOne(() => Alojamiento, (alojamiento) => alojamiento.favoritos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_alojamiento' })
  alojamiento: Alojamiento;

  @ManyToOne(() => User, (user) => user.favoritos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
