import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { RidersController } from './riders.controller';

@Module({
  imports: [RealtimeModule],
  controllers: [RidersController],
  providers: [PrismaService],
})
export class RidersModule {}
