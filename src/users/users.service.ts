import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Role } from 'src/common/enums/rol.enum';
import * as bcryptjs from 'bcryptjs';
import { School } from 'src/school/entities/school.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(School)
    private readonly schoolRepository: Repository<School>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }

  //creamos un metodo para que me busque el usuario en la base de datos
  findOneByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }
  //buscar por email con password
  //metodo que busca el email para que me traiga los daemas datos del usuario
  finByEmailWithPassword(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role'],
      relations: ['empresa'],
    });
  }

  findAll() {
    return this.usersRepository.find({ relations: ['empresa'] });
  }

  findUsuariosEmpresa() {
    return this.usersRepository.find({
      where: {
        role: Role.ADMIN,
      },
      relations: ['empresa'],
    });
  }

  findUsuariosEmpleado() {
    return this.usersRepository.find({
      where: {
        role: Role.PROPIETARIO,
      },
      relations: ['empresa'],
    });
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  async miUsuario(user: UserActiveInterface) {
    return await this.usersRepository.findOne({
      where: { email: user.email },
      relations: ['empresa'], // Asegurar que empresa.pago está en las relaciones
    });
  }

  // Primero, actualiza el método update en UsersService
  async update(id: number, updateUserDto: UpdateUserDto) {
    // Debug log

    // Verificar si el usuario existe
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['empresa', 'perfil, School'], // Agregamos la relación perfil para manejarla
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (updateUserDto.id_school !== undefined) {
      if (user.role !== Role.ESTUDIANTE) {
        throw new BadRequestException(
          'Solo los  Estudiante pueden acceder a esta escuela',
        );
      }
      const School = await this.schoolRepository.findOne({
        where: { id_school: updateUserDto.id_school },
      });
      if (!School) {
        throw new BadRequestException('Escuela no encontrada');
      }
      user.School = School;
    }
    // Crear objeto para actualizar
    const updateData: any = {};

    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (
      updateUserDto.email &&
      updateUserDto.email.trim() !== '' &&
      updateUserDto.email !== user.email
    ) {
      const existingUser = await this.findOneByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(
          'El email ya está registrado por otro usuario',
        );
      }
      updateData.email = updateUserDto.email.trim();
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      updateData.password = await bcryptjs.hash(updateUserDto.password, 10);
      console.log('Contraseña hasheada correctamente'); // Debug log
    }

    // Agregar otros campos si están presentes
    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.role !== undefined) {
      updateData.role = updateUserDto.role;
    }

    // Usar QueryRunner para manejar la transacción y evitar problemas de FK
    const queryRunner =
      this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Actualizar los datos del usuario usando el queryRunner
      if (Object.keys(updateData).length > 0) {
        // Usar el queryRunner para la actualización
        await queryRunner.manager.update('User', { id }, updateData);
        console.log('Usuario actualizado en la base de datos'); // Debug log
      } else {
        console.log('No hay datos para actualizar'); // Debug log
      }

      await queryRunner.commitTransaction();

      // Guardar relación School si se asignó
      if (user.School) {
        await this.usersRepository.save(user);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error durante la actualización:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Retornar el usuario actualizado
    return await this.usersRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });
  }

  // Método alternativo más seguro que actualiza campos individualmente
  async updateSafe(id: number, updateUserDto: UpdateUserDto) {
    // Verificar si el usuario existe - IMPORTANTE: incluir password en el select
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['empresa'],
      select: ['id', 'email', 'password', 'name', 'role'], // Especificar explícitamente los campos incluyendo password
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Actualizar campo por campo para evitar conflictos de FK
    let hasChanges = false;

    // Actualizar name si es diferente
    if (updateUserDto.name !== undefined && updateUserDto.name !== user.name) {
      user.name = updateUserDto.name;
      hasChanges = true;
      console.log('Nombre actualizado');
    }

    // Actualizar contraseña si es diferente
    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      // Verificar que user.password existe antes de comparar
      if (user.password) {
        const isSamePassword = await bcryptjs.compare(
          updateUserDto.password,
          user.password,
        );
        if (!isSamePassword) {
          user.password = await bcryptjs.hash(updateUserDto.password, 10);
          hasChanges = true;
        } else {
        }
      } else {
        // Si no hay contraseña actual, establecer la nueva
        user.password = await bcryptjs.hash(updateUserDto.password, 10);
        hasChanges = true;
      }
    }

    // Actualizar email si es diferente (esto se hace al final y con más cuidado)
    if (
      updateUserDto.email &&
      updateUserDto.email.trim() !== '' &&
      updateUserDto.email !== user.email
    ) {
      const existingUser = await this.findOneByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(
          'El email ya está registrado por otro usuario',
        );
      }
      user.email = updateUserDto.email.trim();
      hasChanges = true;
      console.log('Email actualizado');
    }

    if (updateUserDto.role !== undefined && updateUserDto.role !== user.role) {
      user.role = updateUserDto.role;
      hasChanges = true;
      console.log('Rol actualizado');
    }

    if (hasChanges) {
      try {
        const updatedUser = await this.usersRepository.save(user);
        console.log('Usuario guardado exitosamente');

        // Retornar el usuario sin la contraseña por seguridad
        const { password, ...userWithoutPassword } = updatedUser;
        return { ...userWithoutPassword, empresa: updatedUser.empresa };
      } catch (error) {
        console.error('Error al guardar usuario:', error);
        if (error.code === '23503') {
          // Foreign key constraint violation
          throw new BadRequestException(
            'No se puede actualizar el usuario debido a restricciones de datos relacionados',
          );
        }
        throw error;
      }
    }

    console.log('No hay cambios para actualizar');
    // Retornar el usuario sin la contraseña por seguridad
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, empresa: user.empresa };
  }

  // Método adicional para actualizar el perfil del usuario autenticado (usando método seguro)
  async updateProfile(user: UserActiveInterface, updateUserDto: UpdateUserDto) {
    const currentUser = await this.usersRepository.findOne({
      where: { email: user.email },
      relations: ['empresa'],
    });

    if (!currentUser) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Usar el método seguro para actualizar
    return await this.updateSafe(currentUser.id, updateUserDto);
  }
}
