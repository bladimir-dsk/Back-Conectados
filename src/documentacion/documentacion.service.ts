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
import { EstadoDocumento } from 'src/common/enums/estadoDocumento.enum';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { TypeDocuments } from 'src/common/enums/typeDocuments.enum';

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
    if (!file) throw new BadRequestException('Archivo no enviado');

    const user = await this.userRepository.findOne({
      where: { email: userPayload.email },
      relations: ['empresa'],
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const existingDocument = await this.documentacionRepository.findOne({
      where: {
        user: { id: user.id },
        typeDocument: body.typeDocument,
      },
    });

    // 👇 SI YA EXISTE → UPDATE
    if (existingDocument) {
      return this.update(
        existingDocument.id_documentacion,
        body,
        userPayload,
        file,
      );
    }

    // 👇 SI NO EXISTE → CREATE
    const filePath = `estudiantes/${user.email}/${Date.now()}-${file.originalname}`;

    const { error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw new Error(error.message);

    const { data } = this.supabase.storage
      .from(process.env.SUPABASE_BUCKET)
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
      status: EstadoDocumento.PENDIENTE,
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
    //eliminar el archivo anterior de supabase
    const oldFilePath = documentacion.documentUrl?.split(
      '/object/public/documentacion/',
    )[1];

    if (oldFilePath) {
      await this.supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .remove(oldFilePath);
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

    ///si el documento se actualiza el status deve pasar a pendiente
    if (documentacion.status !== EstadoDocumento.PENDIENTE) {
      documentacion.status = EstadoDocumento.PENDIENTE;
    }

    documentacion.name = file.originalname;
    documentacion.type = file.mimetype;
    documentacion.size = file.size;
    documentacion.documentUrl = data.publicUrl;
    documentacion.observation = updateDocumentacionDto.observation;
    documentacion.status = EstadoDocumento.PENDIENTE;
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

  ///update de estado para que lo cambie el admin
  async updateEstado(
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

    //si el estado es aprovado la observacion es null de nuevo
    if (updateDocumentacionDto.status === EstadoDocumento.APROBADO) {
      updateDocumentacionDto.observation = null;
    }

    documentacion.name = file.originalname;
    documentacion.type = file.mimetype;
    documentacion.size = file.size;
    documentacion.documentUrl = data.publicUrl;
    documentacion.observation = updateDocumentacionDto.observation;
    documentacion.status = updateDocumentacionDto.status;
    Object.assign(documentacion, updateDocumentacionDto);
    return this.documentacionRepository.save(documentacion);
  }

  /// metodo para ver si los tipos de documentos de mi usuario estan aprobados
  async documentAprovate(user: UserActiveInterface) {
    const requiredDocuments = [
      TypeDocuments.INE_DELANTERA,
      TypeDocuments.INE_TRASERA,
      TypeDocuments.PASAPORTE,
      TypeDocuments.CFE,
    ];

    const documents = await this.documentacionRepository.find({
      where: {
        userEmail: user.email,
      },
    });

    // Mapa rápido para validar por tipo
    const documentsMap = new Map(
      documents.map((doc) => [doc.typeDocument, doc.status]),
    );

    const missingDocuments = [];
    const rejectedDocuments = [];
    const pendingDocuments = [];

    for (const type of requiredDocuments) {
      if (!documentsMap.has(type)) {
        missingDocuments.push(type);
        continue;
      }

      const status = documentsMap.get(type);

      if (status === EstadoDocumento.RECHAZADO) {
        rejectedDocuments.push(type);
      }

      if (status === EstadoDocumento.PENDIENTE) {
        pendingDocuments.push(type);
      }
    }

    //No cumple
    if (
      missingDocuments.length ||
      rejectedDocuments.length ||
      pendingDocuments.length
    ) {
      return {
        approved: false,
        message: 'Documentación incompleta o no aprobada',
        detail: {
          missingDocuments,
          rejectedDocuments,
          pendingDocuments,
        },
      };
    }

    // Todo aprobado
    return {
      approved: true,
      message: 'Todos los documentos han sido aprobados',
    };
  }
}
