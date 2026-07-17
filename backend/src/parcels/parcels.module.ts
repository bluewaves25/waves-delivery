import { Module } from '@nestjs/common';
import { FiledPackageHandlersService } from 'src/filed-package-handlers/filed-package-handlers.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { ParcelsController } from './parcels.controller';
import { ParcelsService } from './parcels.service';

@Module({
  imports: [NotificationsModule, RealtimeModule, PaymentsModule],
  providers: [ParcelsService, PrismaService, FiledPackageHandlersService],
  controllers: [ParcelsController],
  exports: [ParcelsService],
})
export class ParcelsModule {}
