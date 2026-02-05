import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocumentacionDto } from './dto/create-documentacion.dto';
import { UpdateDocumentacionDto } from './dto/update-documentacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Documentacion } from './entities/documentacion.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/common/enums/rol.enum';

@Injectable()
export class DocumentacionService {
  constructor(
    @InjectRepository(Documentacion)
    private readonly documentacionRepository: Repository<Documentacion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('SUPABASE') private readonly supabase,
  ) {}

  async upload(
    file: Express.Multer.File,
    userPayload: any,
    body: CreateDocumentacionDto,
  ) {
    console.log('FILE:', file);
    console.log('USER PAYLOAD:', userPayload);
    console.log('BODY:', body);
    if (!file) {
      throw new Error('Archivo no enviado');
    }

    const user = await this.userRepository.findOne({
      where: { email: userPayload.email },
      relations: ['empresa'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const filePath = `estudiantes/${user.email}/${Date.now()}-${file.originalname}`;

    const allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `mime type ${file.mimetype} is not supported`,
      );
    }

    const { error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });
    if (error) {
      throw new Error(error.message);
    }
    const { data } = this.supabase.storage
      .from('documentacion')
      .getPublicUrl(filePath);

    const documentacion = this.documentacionRepository.create({
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      typeDocument: body.typeDocument,
      documentUrl: data.publicUrl,
      userEmail: user.email,
      user,
      empresa: user.empresa,
    });
    return this.documentacionRepository.save(documentacion);
  }

  async uploadForUser(
    file: Express.Multer.File,
    userId: number,
    createDocumentacionDto: CreateDocumentacionDto,
  ) {
    if (!file) throw new BadRequestException('Archivo no enviado');
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['empresa'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    console.log('FILE ADMIN ===>', file);

    return this.upload(file, { email: user.email }, createDocumentacionDto);
  }

  async findAll(userPayload: any) {
    if (!userPayload) {
      throw new BadRequestException('Usuario no autenticado');
    }
    if (userPayload.role === Role.ADMIN) {
      return this.documentacionRepository.find({
        relations: ['user', 'empresa'],
      });
    }
    return this.documentacionRepository.find({
      where: { userEmail: userPayload.email },
      relations: ['user', 'empresa'],
    });
  }

  async findOne(id: number, user: any) {
    const documentacion = await this.documentacionRepository.findOne({
      where: { id_documentacion: id },
      relations: ['user'],
    });
    if (!documentacion)
      throw new NotFoundException('Documentacion no encontrada');
    if (user.role !== Role.ADMIN && documentacion.user.email !== user.email) {
      throw new NotFoundException('permiso no autorizado');
    }
    return documentacion;
  }

  async update(
    id: number,
    updateDocumentacionDto: UpdateDocumentacionDto,
    userPayload: any,
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo no enviado');
    }

    const documentacion = await this.findOne(id, userPayload);

    const allowedMimeTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `mime type ${file.mimetype} is not supported`,
      );
    }

    const filePath = `estudiantes/${userPayload.email}/${Date.now()}-${file.originalname}`;

    const { error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    documentacion.name = file.originalname;
    documentacion.type = file.mimetype;
    documentacion.size = file.size;
    documentacion.documentUrl = data.publicUrl;
    Object.assign(documentacion, updateDocumentacionDto);
    return this.documentacionRepository.save(documentacion);
  }

  async remove(id: number, user: any) {
    const documentacion = await this.findOne(id, user);

    const filePath = documentacion.documentUrl.split(
      '/object/public/documentacion/',
    )[1];

    await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([filePath]);

    await this.documentacionRepository.remove(documentacion);

    return { message: 'Documentacion eliminada exitosamente' };
  }
}
