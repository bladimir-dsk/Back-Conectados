import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Repository } from 'typeorm';
import { Renta } from 'src/renta/entities/renta.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Renta)
    private rentaRepository: Repository<Renta>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) {}

  async getGananciasByMonth(user: UserActiveInterface) {
    const query = `
    SELECT
      m.month,
      COALESCE(SUM(p.monto), 0) as total
    FROM generate_series(1, 12) AS m(month)
    LEFT JOIN pago p
      ON EXTRACT(MONTH FROM p.fecha_pago) = m.month
      AND p.estado = 'COMPLETADO'::pago_estado_enum -- 👈 CAST
      AND p.id_empresa = $1
    GROUP BY m.month
    ORDER BY m.month
  `;

    const result = await this.pagoRepository.query(query, [user.id_empresa]);

    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return result.map((item: any) => ({
      month: meses[item.month - 1],
      total: Number(item.total),
    }));
  }
}
