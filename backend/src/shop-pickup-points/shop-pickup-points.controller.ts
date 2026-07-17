import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Param,
  Get,
  Patch,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { PickUpPoints } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserShopGuard } from 'src/shops/guard/userShop.guard';
import {
  CreatePickUpPointsDto,
  UpdatePickUpPointsDto,
} from './dto/pickUpPoints.dto';
import { ShopPickupPointsService } from './shop-pickup-points.service';

@Controller('shops')
export class ShopPickupPointsController {
  constructor(private shopPickupPointsService: ShopPickupPointsService) {}

  // GET /shops/:shopId/pickup-points
  @Get(':shopId/pickup-points')
  @UseGuards(JwtAuthGuard, UserShopGuard)
  async getPickUpPoints(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query('areaTree', new DefaultValuePipe(true), ParseBoolPipe)
    areaTree: boolean,
    @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe)
    activeOnly: boolean,
  ): Promise<{ data: PickUpPoints[] }> {
    const pickupPoints = await this.shopPickupPointsService.pickUpPoints(
      {
        where: {
          shopsId: shopId,
          ...(activeOnly ? { isActive: true } : {}),
        },
        orderBy: { updatedAt: 'desc' },
      },
      {
        include: {
          area: areaTree
            ? {
                include: {
                  district: {
                    include: {
                      division: true,
                    },
                  },
                  zones: {
                    include: { pricing: true },
                  },
                },
              }
            : true,
        },
      },
    );
    return { data: pickupPoints };
  }

  // GET /shops/:shopId/pickup-points/:pickupPointId
  @Get(':shopId/pickup-points/:pickupPointId')
  @UseGuards(JwtAuthGuard, UserShopGuard)
  async getPickUpPoint(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('pickupPointId', ParseIntPipe) id: number,
    @Query('areaTree', new DefaultValuePipe(true), ParseBoolPipe)
    areaTree: boolean,
  ): Promise<{ data: PickUpPoints }> {
    const pickup = await this.shopPickupPointsService.pickUpPoint(
      shopId,
      { id },
      {
        include: {
          area: areaTree
            ? {
                include: {
                  district: {
                    include: {
                      division: true,
                    },
                  },
                  zones: {
                    include: { pricing: true },
                  },
                },
              }
            : true,
        },
      },
    );
    return { data: pickup };
  }

  // POST /shops/:shopId/pickup-points
  @Post(':shopId/pickup-points')
  @UseGuards(JwtAuthGuard, UserShopGuard)
  async createPickUpPoints(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    createPickUpPointsDto: CreatePickUpPointsDto,
    @Param('shopId', ParseIntPipe) shopId: number,
  ): Promise<{ data: PickUpPoints }> {
    const { areaId, latitude, longitude, ...data } = createPickUpPointsDto;
    const coords = await this.shopPickupPointsService.resolveCoordinates({
      areaId,
      latitude,
      longitude,
    });

    const created = await this.shopPickupPointsService.createPickUpPoint(
      {
        ...data,
        latitude: coords.latitude,
        longitude: coords.longitude,
        area: { connect: { id: areaId } },
        shops: { connect: { id: shopId } },
      },
      {
        include: {
          shops: true,
          area: {
            include: {
              district: { include: { division: true } },
            },
          },
        },
      },
    );
    return { data: created };
  }

  // PATCH /shops/:shopId/pickup-points/:pickupPointId
  @Patch(':shopId/pickup-points/:pickupPointId')
  @UseGuards(JwtAuthGuard, UserShopGuard)
  async updatePickUpPoints(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updatePickUpPointsDto: UpdatePickUpPointsDto,
    @Param('shopId', ParseIntPipe) shopId: number,
    @Param('pickupPointId', ParseIntPipe) pickupPointId: number,
  ): Promise<{ data: PickUpPoints }> {
    const { areaId, latitude, longitude, ...rest } = updatePickUpPointsDto;

    const existing = await this.shopPickupPointsService.pickUpPoint(shopId, {
      id: pickupPointId,
    });

    const nextAreaId = areaId ?? existing.areaId;
    const coords = await this.shopPickupPointsService.resolveCoordinates({
      areaId: nextAreaId,
      latitude: latitude !== undefined ? latitude : existing.latitude,
      longitude: longitude !== undefined ? longitude : existing.longitude,
    });

    const updated = await this.shopPickupPointsService.updatePickUpPoint(
      shopId,
      {
        where: { id: pickupPointId },
        data: {
          ...rest,
          latitude: coords.latitude,
          longitude: coords.longitude,
          ...(areaId != null
            ? { area: { connect: { id: areaId } } }
            : {}),
        },
      },
      {
        include: {
          shops: true,
          area: {
            include: {
              district: { include: { division: true } },
            },
          },
        },
      },
    );
    return { data: updated };
  }
}
