import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlojamientoService } from './alojamiento.service';
import { CreateAlojamientoDto } from './dto/create-alojamiento.dto';
import { UpdateAlojamientoDto } from './dto/update-alojamiento.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
@Controller('alojamientos')
export class AlojamientoController {
  constructor(private readonly alojamientoService: AlojamientoService) {}

  @Post()
  create(@Body() createAlojamientoDto: CreateAlojamientoDto) {
    return this.alojamientoService.create(createAlojamientoDto);
  }

  @Get()
  findAll() {
    return this.alojamientoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alojamientoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlojamientoDto: UpdateAlojamientoDto) {
    return this.alojamientoService.update(+id, updateAlojamientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alojamientoService.remove(+id);
  }
}
