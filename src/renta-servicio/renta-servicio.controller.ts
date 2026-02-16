import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RentaServicioService } from './renta-servicio.service';
import { CreateRentaServicioDto } from './dto/create-renta-servicio.dto';
import { UpdateRentaServicioDto } from './dto/update-renta-servicio.dto';

@Controller('renta-servicio')
export class RentaServicioController {
  constructor(private readonly rentaServicioService: RentaServicioService) {}

  @Post()
  create(@Body() createRentaServicioDto: CreateRentaServicioDto) {
    return this.rentaServicioService.create(createRentaServicioDto);
  }

  @Get()
  findAll() {
    return this.rentaServicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentaServicioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRentaServicioDto: UpdateRentaServicioDto) {
    return this.rentaServicioService.update(+id, updateRentaServicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentaServicioService.remove(+id);
  }
}
