import { Global, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe.controller';
import { RentaModule } from 'src/renta/renta.module';

@Global()
@Module({
  imports: [RentaModule],
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
