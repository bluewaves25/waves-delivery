import {
  Body,
  Controller,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationStoreService } from 'src/realtime/location-store.service';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

class RiderLocationDto {
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsOptional()
  parcelNumber?: string;
}

class RiderOnlineDto {
  @IsNotEmpty()
  @IsBoolean()
  isOnline: boolean;
}

@Controller('riders')
export class RidersController {
  constructor(
    private prisma: PrismaService,
    private locationStore: LocationStoreService,
    private realtime: RealtimeGateway,
  ) {}

  @Patch('me/online')
  @UseGuards(JwtAuthGuard)
  async setOnline(@Request() req, @Body(ValidationPipe) body: RiderOnlineDto) {
    const handler = await this.prisma.fieldPackageHandler.findUnique({
      where: { userId: req.user.id },
    });
    if (!handler) {
      throw new UnauthorizedException('Not a package handler');
    }
    const updated = await this.prisma.fieldPackageHandler.update({
      where: { id: handler.id },
      data: { isOnline: body.isOnline },
    });
    return { data: updated };
  }

  @Post('me/location')
  @UseGuards(JwtAuthGuard)
  async pingLocation(
    @Request() req,
    @Body(ValidationPipe) body: RiderLocationDto,
  ) {
    const handler = await this.prisma.fieldPackageHandler.findUnique({
      where: { userId: req.user.id },
    });
    if (!handler) {
      throw new UnauthorizedException('Not a package handler');
    }

    const updated = await this.prisma.fieldPackageHandler.update({
      where: { id: handler.id },
      data: {
        lastLat: body.latitude,
        lastLng: body.longitude,
        lastLocationAt: new Date(),
        latitude: body.latitude,
        longitude: body.longitude,
      },
    });

    await this.prisma.riderLocation.create({
      data: {
        fieldPackageHandlerId: handler.id,
        latitude: body.latitude,
        longitude: body.longitude,
      },
    });

    const live = this.locationStore.setRiderLocation({
      fieldPackageHandlerId: handler.id,
      userId: req.user.id,
      latitude: body.latitude,
      longitude: body.longitude,
      updatedAt: new Date().toISOString(),
    });

    this.realtime.server?.emit('rider:location:update', live);
    if (body.parcelNumber) {
      this.realtime.server
        ?.to(`parcel:${body.parcelNumber}`)
        .emit('parcel:rider:location', {
          parcelNumber: body.parcelNumber,
          ...live,
        });
    }

    return { data: updated };
  }
}
