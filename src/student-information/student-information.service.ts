import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateStudentInformationDto } from './dto/create-student-information.dto';
import { UpdateStudentInformationDto } from './dto/update-student-information.dto';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentInformation } from './entities/student-information.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Injectable()
export class StudentInformationService {
  constructor(
    @InjectRepository(StudentInformation)
    private studentInformationRepository: Repository<StudentInformation>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @Inject('SUPABASE') private readonly supabase,
  ) {}

  async create(
    createStudentInformationDto: CreateStudentInformationDto,
    file: Express.Multer.File,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: {
        id_empresa: user.id_empresa,
      },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const existingStudentInformation =
      await this.studentInformationRepository.findOne({
        where: {
          user: { id: user.id },
        },
      });

    if (existingStudentInformation) {
      throw new BadRequestException('Informacion ya existente');
    }

    const ext = file.originalname.split('.').pop();

    const filePath = `student_information/${user.email}/${Date.now()}.${ext}`;

    const { error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const { data } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    const studentInformation = this.studentInformationRepository.create({
      ...createStudentInformationDto,
      imgUrl: data.publicUrl,
      empresa,
      userEmail: user.email,
      /*user: {
        id: user.id,
      },*/
    });

    return await this.studentInformationRepository.save(studentInformation);
  }

  async findAll(user: UserActiveInterface) {
    const studentInformations = await this.studentInformationRepository.find({
      where: {
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
      relations: ['user'],
    });
    return {
      datosDireccion: studentInformations,
      datosPersonales: studentInformations[0]?.user,
    };
  }

  findOne(id: number, user: UserActiveInterface) {
    return `This action returns a #${id} studentInformation`;
  }

  async update(
    id: number,
    updateStudentInformationDto: UpdateStudentInformationDto,
    user: UserActiveInterface,
    file?: Express.Multer.File,
  ) {
    const studentInformation = await this.studentInformationRepository.findOne({
      where: {
        id_student_information: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!studentInformation) {
      throw new BadRequestException('Informacion no encontrada');
    }

    if (file) {
      if (studentInformation.imgUrl) {
        const oldPath = studentInformation.imgUrl
          .split('/object/public/')[1]
          ?.split('/')
          .slice(1)
          .join('/');

        if (oldPath) {
          const { error: removeError } = await this.supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .remove([oldPath]);
          if (removeError) {
            console.log('Error al remover la foto', removeError.message);
          }
        }
      }

      const ext = file.originalname.split('.').pop()?.toLowerCase();

      // tuve un error con un formato de imagen no soportado
      // para diferentes formatos de fotos y evitar errores a futuro
      const mimeMap = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
      };

      const contentType =
        file.mimetype !== 'application/octet-stream'
          ? file.mimetype
          : mimeMap[ext];

      if (!contentType) {
        throw new BadRequestException('archivo no soportado');
      }

      const filePath = `student_information/${user.email}/${Date.now()}.${ext}`;

      const { error } = await this.supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(filePath, file.buffer, {
          contentType,
        });

      if (error) {
        throw new BadRequestException(error.message);
      }

      const { data } = await this.supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(filePath);

      studentInformation.imgUrl = data.publicUrl;
    }

    Object.assign(studentInformation, updateStudentInformationDto);

    return await this.studentInformationRepository.save(studentInformation);
  }

  async remove(id: number, user: UserActiveInterface) {
    const studentInformation = await this.studentInformationRepository.findOne({
      where: {
        id_student_information: id,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!studentInformation) {
      throw new BadRequestException('Informacion no encontrada');
    }
    return this.studentInformationRepository.remove(studentInformation);
  }
}
