import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePropietarioDto } from './dto/create-propietario.dto';
import { UpdatePropietarioDto } from './dto/update-propietario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Propietario } from './entities/propietario.entity';
import { DataSource, Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Role } from 'src/common/enums/rol.enum';
import * as bcrypt from 'bcryptjs';
import { PaginacionDto } from './dto/paginacionDto.dto';

@Injectable()
export class PropietariosService {
  constructor(
    @InjectRepository(Propietario)
    private readonly propietarioRepository: Repository<Propietario>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createPropietarioDto: CreatePropietarioDto,
    user: UserActiveInterface,
  ) {
    let empresa: Empresa;
    empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const existingPropietarioEmail = await this.propietarioRepository.findOne({
      where: { email: createPropietarioDto.email },
    });

    if (existingPropietarioEmail) {
      throw new BadRequestException('Ya existe un propietario con ese email');
    }

    let usuario: User | null = null;

    if (createPropietarioDto.aplicaEnUsuario) {
      if (!createPropietarioDto.name || !createPropietarioDto.password) {
        throw new BadRequestException(
          'Se requiere nombre de usuario y contraseña si aplicaEnUsuario es verdadero',
        );
      }

      const usuarioExistente = await this.userRepository.findOneBy({
        email: createPropietarioDto.email,
      });

      if (usuarioExistente) {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }

      const nombreUsuarioExistente = await this.userRepository.findOneBy({
        name: createPropietarioDto.name,
      });

      if (nombreUsuarioExistente) {
        throw new BadRequestException('Ya existe un usuario con ese nombre');
      }

      const hashedPassword = await bcrypt.hash(
        createPropietarioDto.password,
        10,
      );

      usuario = this.userRepository.create({
        name: createPropietarioDto.name,
        email: createPropietarioDto.email,
        password: hashedPassword,
        empresa,
        role: Role.PROPIETARIO,
      });
    }

    return this.dataSource.transaction(async (manager) => {
      let usuarioGuardado: User | null = null;

      if (usuario) {
        usuarioGuardado = await manager.save(User, usuario);
      }

      const propietario = manager.create(Propietario, {
        ...createPropietarioDto,
        userEmail: user.email,
        user: usuarioGuardado,
        id_usuario: usuarioGuardado?.id,
        empresa,
        role: Role.PROPIETARIO,
      });

      return await manager.save(Propietario, propietario);
    });
  }

  async findAll(user: UserActiveInterface, paginacion: PaginacionDto) {
    const { paginaActual, limite } = paginacion;

    if (!paginaActual || !limite) {
      const data = await this.propietarioRepository.find({
        where: {
          empresa: { id_empresa: user.id_empresa },
        },
        relations: ['empresa', 'user'],
        order: { id_propietario: 'DESC' },
      });

      const total = data.length;

      return {
        data,
        paginacion: {
          paginaActual: 1,
          limite: total,
          totalRegistros: total,
          totalPaginas: 1,
          tienePaginaAnterior: false,
          tienePaginaSiguiente: false,
        },
      };
    }

    const page = paginaActual;
    const take = limite;
    const skip = (page - 1) * take;

    const [data, totalRegistros] =
      await this.propietarioRepository.findAndCount({
        where: {
          empresa: { id_empresa: user.id_empresa },
        },
        relations: ['empresa', 'user'],
        take,
        skip,
        order: { id_propietario: 'DESC' },
      });

    const totalPaginas = Math.ceil(totalRegistros / take);

    return {
      data,
      paginacion: {
        paginaActual: page,
        limite: take,
        totalRegistros,
        totalPaginas,
        tienePaginaAnterior: page > 1,
        tienePaginaSiguiente: page < totalPaginas,
      },
    };
  }

  async findOne(id: number, user: UserActiveInterface) {
    const propietario = await this.propietarioRepository.findOne({
      where: {
        id_propietario: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empresa', 'user'],
    });

    if (!propietario) {
      throw new BadRequestException('Propietario no encontrado');
    }

    return propietario;
  }

  async update(
    id: number,
    updatePropietarioDto: UpdatePropietarioDto,
    user: UserActiveInterface,
  ) {
    const propietario = await this.propietarioRepository.findOne({
      where: {
        id_propietario: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empresa', 'user'],
    });

    if (!propietario) {
      throw new BadRequestException('Propietario no encontrado');
    }

    if (
      updatePropietarioDto.email &&
      updatePropietarioDto.email !== propietario.email
    ) {
      const existingPropietario = await this.propietarioRepository.findOne({
        where: { email: updatePropietarioDto.email },
      });

      if (existingPropietario) {
        throw new BadRequestException('Ya existe un propietario con ese email');
      }
    }

    return this.dataSource.transaction(async (manager) => {
      if (updatePropietarioDto.aplicaEnUsuario && !propietario.user) {
        if (!updatePropietarioDto.name || !updatePropietarioDto.password) {
          throw new BadRequestException(
            'Para crear el usuario, se requiere nombre de usuario y contraseña',
          );
        }

        const existingUser = await this.userRepository.findOneBy({
          email: updatePropietarioDto.email || propietario.email,
        });

        if (existingUser) {
          throw new BadRequestException('Ya existe un usuario con ese email');
        }

        const existingUserName = await this.userRepository.findOneBy({
          name: updatePropietarioDto.name,
        });

        if (existingUserName) {
          throw new BadRequestException('Ya existe un usuario con ese nombre');
        }

        const hashedPassword = await bcrypt.hash(
          updatePropietarioDto.password,
          10,
        );

        const newUser = manager.create(User, {
          name: updatePropietarioDto.name,
          email: updatePropietarioDto.email || propietario.email,
          password: hashedPassword,
          empresa: propietario.empresa,
          role: Role.PROPIETARIO,
        });

        propietario.user = await manager.save(User, newUser);
      } else if (propietario.user) {
        if (updatePropietarioDto.password) {
          propietario.user.password = await bcrypt.hash(
            updatePropietarioDto.password,
            10,
          );
        }

        if (updatePropietarioDto.name) {
          const existingUserName = await this.userRepository.findOneBy({
            name: updatePropietarioDto.name,
          });

          if (existingUserName && existingUserName.id !== propietario.user.id) {
            throw new BadRequestException(
              'Ya existe otro usuario con ese nombre',
            );
          }

          propietario.user.name = updatePropietarioDto.name;
        }

        if (updatePropietarioDto.email) {
          const existingUser = await this.userRepository.findOneBy({
            email: updatePropietarioDto.email,
          });

          if (existingUser && existingUser.id !== propietario.user.id) {
            throw new BadRequestException(
              'Ya existe otro usuario con ese email',
            );
          }

          propietario.user.email = updatePropietarioDto.email;
        }

        await manager.save(propietario.user);
      }

      const { aplicaEnUsuario, password, name, ...propietarioData } =
        updatePropietarioDto;
      Object.assign(propietario, propietarioData);
      propietario.aplicaEnUsuario =
        aplicaEnUsuario ?? propietario.aplicaEnUsuario;

      return await manager.save(propietario);
    });
  }

  async remove(id: number, user: UserActiveInterface) {
    const propietario = await this.propietarioRepository.findOne({
      where: {
        id_propietario: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empresa', 'user'],
    });

    if (!propietario) {
      throw new BadRequestException('Propietario no encontrado');
    }

    return this.propietarioRepository.remove(propietario);
  }
}
