import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorito } from './entities/favorito.entity';
import { Repository } from 'typeorm';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class FavoritoService {
  constructor(
    @InjectRepository(Favorito)
    private favoritoRepo: Repository<Favorito>,
  ) {}

  async agregar(user: UserActiveInterface, id_alojamiento: number) {
    const existe = await this.favoritoRepo.findOne({
      where: {
        user: { id: user.id },
        alojamiento: { id_alojamiento },
      },
    });

    if (existe) throw new ConflictException('Ya está en favoritos');

    await this.favoritoRepo.insert({
      user: { id: user.id },
      alojamiento: { id_alojamiento },
    });

    return { message: 'Agregado a favoritos' };
  }

  async findAll(
    user: UserActiveInterface,
    query: { page?: number; limit?: number },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.favoritoRepo.findAndCount({
      where: { user: { id: user.id } },
      relations: ['alojamiento', 'alojamiento.fotos'],
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      meta: {
        totalItems: total,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async quitar(user: UserActiveInterface, id_alojamiento: number) {
    const existe = await this.favoritoRepo.findOne({
      where: {
        user: { id: user.id },
        alojamiento: { id_alojamiento },
      },
    });

    if (!existe) throw new ConflictException('No está en favoritos');

    await this.favoritoRepo.delete(existe.id_favorito);

    return { message: 'Removido de favoritos' };
  }
}
