import { Inject, Injectable, NotAcceptableException } from '@nestjs/common';
import { UpdateFotoDto } from './dto/update-foto.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Foto } from './entities/foto.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Alojamiento } from 'src/alojamiento/entities/alojamiento.entity';
import { Repository } from 'typeorm';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class FotosService {
  constructor(
    @InjectRepository(Foto)
    private readonly fotosRepository: Repository<Foto>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Alojamiento)
    private readonly alojamientoRepository: Repository<Alojamiento>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('SUPABASE') private readonly supabase,
  ) {}

  async create(
    user: UserActiveInterface,
    id_alojamiento: number,
    descripcion: string,
    esPrincipal: boolean,
    files: Express.Multer.File[],
  ) {
    const alojamiento = await this.alojamientoRepository.findOne({
      where: {
        id_alojamiento,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empresa'],
    });

    if (!alojamiento) {
      throw new NotAcceptableException('Alojamiento no encontrado');
    }

    const fotos: Foto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const filePacth = `alojamientos/${id_alojamiento}/imagenes/${Date.now()}-${file.originalname}`;

      const { error } = await this.supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(filePacth, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        throw new NotAcceptableException(error.message);
      }

      const { data } = await this.supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(filePacth);

      fotos.push(
        this.fotosRepository.create({
          descripcion,
          url: data.publicUrl,
          esPrincipal: i === 0 ? esPrincipal : false,
          alojamiento,
          empresa: alojamiento.empresa,
          userEmail: user.email,
        }),
      );
    }
    return await this.fotosRepository.save(fotos);
  }

  async findAll(user: UserActiveInterface) {
    return this.fotosRepository.find({
      where: {
        alojamiento: {
          empresa: {
            id_empresa: user.id_empresa,
          },
        },
      },
      relations: ['alojamiento'],
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const foto = await this.fotosRepository.findOne({
      where: {
        id_foto: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
      relations: ['alojamiento'],
    });
    if (!foto) {
      throw new NotAcceptableException('Foto no encontrada');
    }
    return foto;
  }

  async update(
    id: number,
    updateFotoDto: UpdateFotoDto,
    user: UserActiveInterface,
    file?: Express.Multer.File,
  ) {
    const foto = await this.findOne(id, user);

    if (file) {
      // Extraer path correcto
      const oldPath = foto.url.split(
        `/object/public/${process.env.SUPABASE_BUCKET}/`,
      )[1];

      if (oldPath) {
        const { error: removeError } = await this.supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .remove([oldPath]);
        if (removeError) {
          console.log('rError al remplazar la foto', removeError.message);
        }
      }

      const newPath = `alojamientos/${foto.alojamiento.id_alojamiento}/imagenes/${Date.now()}-${file.originalname}`;

      const { error } = await this.supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(newPath, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        throw new NotAcceptableException(error.message);
      }

      const { data } = await this.supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(newPath);

      foto.url = data.publicUrl;
    }
    Object.assign(foto, {
      descripcion: updateFotoDto.descripcion ?? foto.descripcion,
      esPrincipal: updateFotoDto.esPrincipal ?? foto.esPrincipal,
      userEmail: user.email,
    });
    return this.fotosRepository.save(foto);
  }

  async remove(id: number, user: UserActiveInterface) {
    const foto = await this.findOne(id, user);

    // Extrae el path del archivo de la URL
    const filePath = foto.url.split(
      `/object/public/${process.env.SUPABASE_BUCKET}/`,
    )[1];

    if (filePath) {
      await this.supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .remove([filePath]);
    }

    await this.fotosRepository.remove(foto);

    return { message: 'Foto eliminada exitosamente' };
  }
}
