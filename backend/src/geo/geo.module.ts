import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeoController } from './geo.controller';

@Module({
  controllers: [GeoController],
  providers: [PrismaService],
})
export class GeoModule {}
