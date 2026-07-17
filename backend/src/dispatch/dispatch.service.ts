import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Parcel } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationStoreService } from 'src/realtime/location-store.service';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class DispatchService {
  constructor(
    private prisma: PrismaService,
    private locationStore: LocationStoreService,
    private realtime: RealtimeGateway,
  ) {}

  async assignNearestRider(params: {
    parcelNumber: string;
    idempotencyKey: string;
    handlerType?: 'pickupman' | 'deliveryman';
  }): Promise<Parcel> {
    const { parcelNumber, idempotencyKey, handlerType = 'deliveryman' } =
      params;

    const existing = await this.prisma.parcel.findUnique({
      where: { assignmentIdempotencyKey: idempotencyKey },
    });
    if (existing) {
      return existing;
    }

    const parcel = await this.prisma.parcel.findUnique({
      where: { parcelNumber },
      include: {
        parcelPickUp: true,
        parcelDeliveryArea: true,
      },
    });
    if (!parcel) {
      throw new NotFoundException(`Parcel ${parcelNumber} not found`);
    }
    if (parcel.fieldPackageHandlerId) {
      throw new BadRequestException('Parcel already assigned');
    }

    const targetLat =
      handlerType === 'pickupman'
        ? parcel.parcelPickUp?.latitude ?? parcel.customerLatitude
        : parcel.customerLatitude ?? parcel.parcelDeliveryArea?.latitude;
    const targetLng =
      handlerType === 'pickupman'
        ? parcel.parcelPickUp?.longitude ?? parcel.customerLongitude
        : parcel.customerLongitude ?? parcel.parcelDeliveryArea?.longitude;

    if (targetLat == null || targetLng == null) {
      throw new BadRequestException(
        'Parcel missing coordinates for dispatch; set customer or area lat/lng first',
      );
    }

    const onlineHandlers = await this.prisma.fieldPackageHandler.findMany({
      where: { isOnline: true },
      include: { User: true },
    });

    if (!onlineHandlers.length) {
      throw new BadRequestException('No online riders available');
    }

    const ranked = onlineHandlers
      .map((handler) => {
        const live = this.locationStore.getRiderLocation(handler.id);
        const lat = live?.latitude ?? handler.lastLat ?? handler.latitude;
        const lng = live?.longitude ?? handler.lastLng ?? handler.longitude;
        if (lat == null || lng == null) {
          return null;
        }
        return {
          handler,
          distanceKm: haversineKm(targetLat, targetLng, lat, lng),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.distanceKm - b!.distanceKm) as Array<{
      handler: (typeof onlineHandlers)[0];
      distanceKm: number;
    }>;

    if (!ranked.length) {
      throw new BadRequestException(
        'Online riders found but none have usable coordinates',
      );
    }

    const nearest = ranked[0];
    const statusName =
      handlerType === 'deliveryman' ? 'in-transit' : 'picking-up';
    const message =
      handlerType === 'deliveryman'
        ? `Auto-dispatched to ${nearest.handler.User.name} (${nearest.distanceKm.toFixed(
            2,
          )} km)`
        : `Auto-assigned pickup to ${nearest.handler.User.name}`;

    const updated = await this.prisma.parcel.update({
      where: { parcelNumber },
      data: {
        assignmentIdempotencyKey: idempotencyKey,
        FieldPackageHandler: { connect: { id: nearest.handler.id } },
        parcelStatus: { connect: { name: statusName } },
        ParcelTimeline: {
          create: {
            message,
            parcelStatus: { connect: { name: statusName } },
          },
        },
      },
    });

    this.realtime.emitParcelStatus(parcelNumber, {
      status: statusName,
      fieldPackageHandlerId: nearest.handler.id,
      distanceKm: nearest.distanceKm,
      message,
      createdAt: new Date().toISOString(),
    });

    return updated;
  }
}
