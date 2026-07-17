import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PickUpPoints, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShopPickupPointsService {
  constructor(private prisma: PrismaService) {}

  async pickUpPoint(
    shopId: number,
    pickUpPointsWhereUniqueInput: Prisma.PickUpPointsWhereUniqueInput,
    options?: Prisma.PickUpPointsArgs,
  ): Promise<PickUpPoints | null> {
    const pickupPoint = await this.prisma.pickUpPoints.findUnique({
      where: pickUpPointsWhereUniqueInput,
      ...options,
    });
    if (!pickupPoint) {
      throw new NotFoundException('Pickup point is not found');
    } else if (shopId !== pickupPoint.shopsId) {
      throw new UnauthorizedException(
        "You don't have access to this pickup point",
      );
    }
    return pickupPoint;
  }

  async pickUpPoints(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.PickUpPointsWhereUniqueInput;
      where?: Prisma.PickUpPointsWhereInput;
      orderBy?: Prisma.PickUpPointsOrderByWithRelationInput;
    },
    options?: Prisma.PickUpPointsArgs,
  ): Promise<PickUpPoints[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.pickUpPoints.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      ...options,
    });
  }

  /** Fill missing lat/lng from Ghana area coordinates when possible */
  async resolveCoordinates(input: {
    areaId: number;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<{ latitude: number | null; longitude: number | null }> {
    if (input.latitude != null && input.longitude != null) {
      return { latitude: input.latitude, longitude: input.longitude };
    }
    const area = await this.prisma.areas.findUnique({
      where: { id: input.areaId },
      select: { latitude: true, longitude: true, name: true },
    });
    if (!area) {
      throw new NotFoundException(`Area ${input.areaId} not found`);
    }
    return {
      latitude: input.latitude ?? area.latitude ?? null,
      longitude: input.longitude ?? area.longitude ?? null,
    };
  }

  async createPickUpPoint(
    data: Prisma.PickUpPointsCreateInput,
    options?: Prisma.PickUpPointsArgs,
  ): Promise<PickUpPoints> {
    return this.prisma.pickUpPoints.create({
      data,
      ...options,
    });
  }

  async updatePickUpPoint(
    shopId: number,
    params: {
      where: Prisma.PickUpPointsWhereUniqueInput;
      data: Prisma.PickUpPointsUpdateInput;
    },
    options?: Prisma.PickUpPointsArgs,
  ): Promise<PickUpPoints> {
    const { where, data } = params;
    const pickupPoint = await this.pickUpPoint(shopId, where);

    if (!pickupPoint) {
      throw new NotFoundException('Pickup point is not found');
    }
    return this.prisma.pickUpPoints.update({
      data,
      where,
      ...options,
    });
  }
}
