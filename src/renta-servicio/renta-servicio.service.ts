import { Injectable } from '@nestjs/common';
import { CreateRentaServicioDto } from './dto/create-renta-servicio.dto';
import { UpdateRentaServicioDto } from './dto/update-renta-servicio.dto';

@Injectable()
export class RentaServicioService {
  create(createRentaServicioDto: CreateRentaServicioDto) {
    return 'This action adds a new rentaServicio';
  }

  findAll() {
    return `This action returns all rentaServicio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rentaServicio`;
  }

  update(id: number, updateRentaServicioDto: UpdateRentaServicioDto) {
    return `This action updates a #${id} rentaServicio`;
  }

  remove(id: number) {
    return `This action removes a #${id} rentaServicio`;
  }
}
