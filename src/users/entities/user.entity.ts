//no usemos el src/../commo.....-- usaremos de manejar puras rutas relativas usando el ../../coommon
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Role } from '../../common/enums/rol.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { School } from 'src/school/entities/school.entity';
import { Documentacion } from 'src/documentacion/entities/documentacion.entity';
import { Alcance } from 'src/alcance/entities/alcance.entity';
import { TerminosCondicione } from 'src/terminos-condiciones/entities/terminos-condicione.entity';
import { Politica } from 'src/politica/entities/politica.entity';
import { Estatus } from 'src/common/enums/estatus.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  //el unique en el amail tiene que ser unico
  // el nullable quiere decir que ese campo no puede estar vacio
  @Column({ unique: true, nullable: false })
  email: string;

  //select: false es para que no se muestre en la respuesta de la peticion, en este caso no devuelve el resultado del password
  @Column({ nullable: false, select: false })
  password: string;

  //es de tipo enum
  //el rol por defecto lo va a guardar como user
  @Column({ type: 'enum', default: Role.ESTUDIANTE, enum: Role }) //tipamos enum para que solo pueda resivir los tipos de roles del enum
  role: Role;

  //el estatus por defecto lo va a guardar como activo
  @Column({ type: 'enum', default: Estatus.ACTIVO, enum: Estatus })
  estatus: Estatus;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  //deletedatecolumn es para hacer eliminaciones logicas y no fisicas en la base de datos
  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Empresa, (empresa) => empresa.users, {
    cascade: true, // Permite que al guardar un empleado también se guarde el contacto automáticamente
  })
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @ManyToOne(() => School, { nullable: true })
  @JoinColumn({ name: 'id_school' })
  School?: School;

  @OneToMany(() => Documentacion, (doc) => doc.user)
  documentaciones: Documentacion[];

  @OneToOne(() => Alcance, (alcance) => alcance.user)
  alcance: Alcance;

  @OneToMany(
    () => TerminosCondicione,
    (terminoscondiciones) => terminoscondiciones.user,
  )
  terminoscondiciones: TerminosCondicione[];

  @OneToMany(() => Politica, (politica) => politica.user)
  politica: Politica[];
}
