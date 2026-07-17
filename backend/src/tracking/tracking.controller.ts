import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LocationStoreService } from 'src/realtime/location-store.service';

@Controller('track')
export class TrackingController {
  constructor(
    private prisma: PrismaService,
    private locationStore: LocationStoreService,
  ) {}

  @Get(':token')
  async trackByToken(@Param('token') token: string) {
    const parcel = await this.prisma.parcel.findFirst({
      where: {
        OR: [{ trackingToken: token }, { parcelNumber: token }],
      },
      select: {
        id: true,
        parcelNumber: true,
        trackingToken: true,
        customerName: true,
        customerAddress: true,
        customerLatitude: true,
        customerLongitude: true,
        parcelStatus: true,
        fieldPackageHandlerId: true,
        ParcelTimeline: {
          include: { parcelStatus: true },
          orderBy: { createdAt: 'desc' },
        },
        FieldPackageHandler: {
          select: {
            id: true,
            lastLat: true,
            lastLng: true,
            lastLocationAt: true,
            isOnline: true,
            User: { select: { name: true, phone: true } },
          },
        },
      },
    });

    if (!parcel) {
      throw new NotFoundException('Tracking token not found');
    }

    const liveRider =
      parcel.fieldPackageHandlerId != null
        ? this.locationStore.getRiderLocation(parcel.fieldPackageHandlerId)
        : null;

    return {
      data: {
        parcelNumber: parcel.parcelNumber,
        trackingToken: parcel.trackingToken,
        customerName: parcel.customerName,
        customerAddress: parcel.customerAddress,
        customerLatitude: parcel.customerLatitude,
        customerLongitude: parcel.customerLongitude,
        status: parcel.parcelStatus,
        timeline: parcel.ParcelTimeline,
        rider: parcel.FieldPackageHandler
          ? {
              name: parcel.FieldPackageHandler.User.name,
              phone: parcel.FieldPackageHandler.User.phone,
              isOnline: parcel.FieldPackageHandler.isOnline,
              latitude:
                liveRider?.latitude ?? parcel.FieldPackageHandler.lastLat,
              longitude:
                liveRider?.longitude ?? parcel.FieldPackageHandler.lastLng,
              updatedAt:
                liveRider?.updatedAt ??
                parcel.FieldPackageHandler.lastLocationAt,
            }
          : null,
      },
    };
  }
}
