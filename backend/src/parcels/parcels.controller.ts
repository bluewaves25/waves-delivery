import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { FiledPackageHandlersService } from 'src/filed-package-handlers/filed-package-handlers.service';
import { RolesGuard } from 'src/guard/roles.guard';
import { CreateParcelDto, GuestCreateParcelDto, UpdateParcelDto } from './dto/parcels.dto';
import { ParcelShopGuard } from './guard/parcelShop.guard';
import { ParcelsService } from './parcels.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { IsOptional, IsString } from 'class-validator';

class DeliverParcelDto {
  @IsOptional()
  @IsString()
  proofPhotoUrl?: string;

  @IsOptional()
  @IsString()
  proofSignature?: string;

  @IsOptional()
  @IsString()
  deliveryOtp?: string;
}

@Controller('parcels')
export class ParcelsController {
  constructor(
    private parcelsService: ParcelsService,
    private filedPackageHandlersService: FiledPackageHandlersService,
    private notificationsService: NotificationsService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  // GET /parcels
  @Get()
  @UseGuards(JwtAuthGuard)
  async parcel(
    @Request() req,
    @Query('pickup', new DefaultValuePipe(false), ParseBoolPipe)
    pickup: boolean,
    @Query('shop', new DefaultValuePipe(false), ParseBoolPipe)
    shop: boolean,
    @Query('deliveryArea', new DefaultValuePipe(false), ParseBoolPipe)
    deliveryArea: boolean,
  ) {
    const parcels = await this.parcelsService.parcels(
      {
        where: {
          parcelUserId: req.user.id,
        },
      },
      {
        include: {
          parcelPickUp: pickup,
          shop,
          parcelDeliveryArea: deliveryArea && {
            include: {
              district: {
                include: {
                  division: deliveryArea,
                },
              },
            },
          },
          parcelStatus: true,
        },
      },
    );

    return { data: parcels };
  }

  // GET /parcels/all
  @Get('all')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async allParcel(
    @Query('pickup', new DefaultValuePipe(false), ParseBoolPipe)
    pickup: boolean,
    @Query('shop', new DefaultValuePipe(false), ParseBoolPipe)
    shop: boolean,
    @Query('deliveryArea', new DefaultValuePipe(false), ParseBoolPipe)
    deliveryArea: boolean,
    @Query('parcelUser', new DefaultValuePipe(false), ParseBoolPipe)
    parcelUser: boolean,
  ) {
    const parcels = await this.parcelsService.parcels(
      {},
      {
        include: {
          parcelPickUp: pickup && {
            include: {
              area: true,
            },
          },
          shop,
          parcelUser: parcelUser,
          parcelDeliveryArea: deliveryArea && {
            include: {
              district: {
                include: {
                  division: deliveryArea,
                },
              },
            },
          },
          parcelStatus: true,
        },
      },
    );

    return { data: parcels };
  }

  // GET /parcels/pricing
  // Get all parcel pricing
  @Get('pricing')
  async parcelPricing(
    @Query('district', new DefaultValuePipe(false), ParseBoolPipe)
    district: boolean,
  ) {
    const prices = await this.parcelsService.parcelPricing(
      {},
      {
        include: {
          areas: {
            include: {
              district,
            },
          },
          pricing: true,
        },
      },
    );
    return { data: prices };
  }

  // POST /parcels/guest — public door-to-door booking (no login)
  @Post('guest')
  async createGuestParcel(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    body: GuestCreateParcelDto,
  ) {
    const result = await this.parcelsService.createGuestParcel(body);
    return {
      message: 'Booking created',
      data: {
        ...result,
        trackPath: `/track/${result.trackingToken}`,
      },
    };
  }

  // GET /parcels/1
  @Get(':parcelNumber')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async parcelByNumber(
    @Query('pickup', new DefaultValuePipe(false), ParseBoolPipe)
    pickup: boolean,
    @Query('shop', new DefaultValuePipe(false), ParseBoolPipe)
    shop: boolean,
    @Query('deliveryArea', new DefaultValuePipe(false), ParseBoolPipe)
    deliveryArea: boolean,
    @Query('parcelUser', new DefaultValuePipe(false), ParseBoolPipe)
    parcelUser: boolean,
    @Param('parcelNumber') parcelNumber: string,
  ) {
    const parcels = await this.parcelsService.parcel(
      { parcelNumber },
      {
        include: {
          parcelPickUp: pickup && {
            include: {
              area: true,
            },
          },
          shop,
          parcelUser,
          parcelDeliveryArea: deliveryArea && {
            include: {
              district: {
                include: {
                  division: deliveryArea,
                },
              },
            },
          },
          parcelStatus: true,
        },
      },
    );

    if (!parcels) {
      throw new NotFoundException(
        `Parcel with number ${parcelNumber} not found`,
      );
    }

    return parcels;
  }

  // POST /parcels
  // Create parcel
  @Post()
  @UseGuards(JwtAuthGuard, ParcelShopGuard)
  async createParcel(
    @Request() req,
    @Body(ValidationPipe) createParcelDto: CreateParcelDto,
  ) {
    // extract input data
    const {
      parcelProductCategoriesId,
      shopsId,
      parcelPickUpId,
      parcelStatusId,
      parcelDeliveryAreaId,
      ...restBody
    } = createParcelDto;
    // extract user id from request
    const parcelUserId = req.user.id;
    // create parcel
    const newParcel = await this.parcelsService.createParcel({
      ...restBody,
      parcelProductCategory: {
        connect: {
          id: parcelProductCategoriesId,
        },
      },
      shop: {
        connect: {
          id: shopsId,
        },
      },
      parcelUser: {
        connect: {
          id: parcelUserId,
        },
      },
      parcelPickUp: {
        connect: {
          id: parcelPickUpId,
        },
      },
      parcelStatus: {
        connect: {
          id: parcelStatusId,
        },
      },
      parcelDeliveryArea: {
        connect: {
          id: parcelDeliveryAreaId,
        },
      },
      ParcelTimeline: {
        create: {
          message: 'The merchant has requested the parcel to be picked up',
          parcelStatusId: parcelStatusId,
        },
      },
    });

    return {
      data: newParcel,
    };
  }

  // PATCH /parcels/1
  // Update parcel
  @Patch(':parcelNumber')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateParcel(
    @Param('parcelNumber') parcelNumber: string,
    @Body(ValidationPipe) updateParcelDto: UpdateParcelDto,
  ) {
    try {
      const updatedParcel = await this.parcelsService.updateParcel({
        where: {
          parcelNumber,
        },
        data: updateParcelDto,
      });
      return updatedParcel;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // DELETE /parcels/1
  // Cancel parcel
  @Delete(':parcelNumber')
  @UseGuards(JwtAuthGuard)
  async cancelParcel(
    @Request() req,
    @Param('parcelNumber') parcelNumber: string,
  ) {
    try {
      const parcel = await this.parcelsService.parcel({
        parcelNumber,
      });
      if (!parcel) {
        throw new NotFoundException(
          `Parcel with number ${parcelNumber} not found`,
        );
      }
      if (parcel.parcelUserId !== req.user.id) {
        throw new UnauthorizedException(
          `You are not authorized to cancel this parcel`,
        );
      }
      const updatedParcel = await this.parcelsService.updateParcel({
        where: {
          parcelNumber,
        },
        data: {
          parcelStatus: {
            connect: {
              name: 'cancelled',
            },
          },
          ParcelTimeline: {
            create: {
              message: 'Parcel has been cancelled',
              parcelStatus: {
                connect: {
                  name: 'cancelled',
                },
              },
            },
          },
        },
      });
      return updatedParcel;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // PATCH /parcels?parcelNumber=1&handlerType=deliveryman&handlerId=1
  // Assign parcel to a field package handler
  @Patch()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async assignParcelFieldPackageHandler(
    @Query('parcelNumber') parcelNumber: string,
    @Query('handlerType') handlerType: string,
    @Query('handlerId', ParseIntPipe) handlerId: number,
  ) {
    try {
      const handlerInfo: any =
        await this.filedPackageHandlersService.fieldPackageHandler(
          {
            id: handlerId,
          },
          {
            include: {
              User: true,
            },
          },
        );
      const message =
        handlerType === 'deliveryman'
          ? `Delivery Agent ${handlerInfo?.User?.name}(${handlerInfo?.User?.phone}) is out for delivery`
          : 'Parcel assigned to a pickupman';
      const result = await this.parcelsService.updateParcel({
        where: {
          parcelNumber,
        },
        data: {
          FieldPackageHandler: {
            connect: {
              id: handlerId,
            },
          },
          ParcelTimeline: {
            create: {
              message,
              parcelStatus: {
                connect: {
                  name:
                    handlerType === 'deliveryman'
                      ? 'in-transit'
                      : handlerType === 'pickupman'
                      ? 'picking-up'
                      : 'pending',
                },
              },
            },
          },
          parcelStatus: {
            connect: {
              name:
                handlerType === 'deliveryman'
                  ? 'in-transit'
                  : handlerType === 'pickupman'
                  ? 'picking-up'
                  : 'pending',
            },
          },
        },
      });
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // PATCH /parcels/admin/receive
  // Receive parcel
  @Patch('admin/receive/:parcelNumber')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async receiveParcel(@Param('parcelNumber') parcelNumber: string) {
    try {
      const result = await this.parcelsService.updateParcel({
        where: {
          parcelNumber,
        },
        data: {
          ParcelTimeline: {
            create: {
              message: 'Parcel has been received by us. We are processing it.',
              parcelStatus: {
                connect: {
                  name: 'processing',
                },
              },
            },
          },
          parcelStatus: {
            connect: {
              name: 'processing',
            },
          },
          FieldPackageHandler: {
            disconnect: true,
          },
        },
      });
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // GET /parcels/packagehandler/to-pickup
  // Get parcels assigned to a pickupman
  @Get('packagehandler/to-pickup')
  @UseGuards(JwtAuthGuard)
  async parcelsAssignedToPickupman(
    @Request() req,
    @Query('pickup', new DefaultValuePipe(false), ParseBoolPipe)
    pickup: boolean,
    @Query('shop', new DefaultValuePipe(false), ParseBoolPipe)
    shop: boolean,
    @Query('deliveryArea', new DefaultValuePipe(false), ParseBoolPipe)
    deliveryArea: boolean,
    @Query('parcelUser', new DefaultValuePipe(false), ParseBoolPipe)
    parcelUser: boolean,
  ) {
    try {
      const pickupmanId = req.user.id;
      // console.log(pickupmanId);
      const parcels = await this.parcelsService.parcels(
        {
          where: {
            AND: [
              {
                FieldPackageHandler: {
                  userId: pickupmanId,
                },
              },
              {
                parcelStatus: {
                  name: 'picking-up',
                },
              },
            ],
          },
        },
        {
          include: {
            parcelPickUp: pickup && {
              include: {
                area: true,
              },
            },
            shop,
            parcelUser: parcelUser,
            parcelDeliveryArea: deliveryArea && {
              include: {
                district: {
                  include: {
                    division: deliveryArea,
                  },
                },
              },
            },
            parcelStatus: true,
          },
        },
      );
      return { data: parcels };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // GET /parcels/packagehandler/to-deliver
  // Get parcels assigned to a deliveryman
  @Get('packagehandler/to-deliver')
  @UseGuards(JwtAuthGuard)
  async parcelsAssignedToDeliveryman(
    @Request() req,
    @Query('pickup', new DefaultValuePipe(false), ParseBoolPipe)
    pickup: boolean,
    @Query('shop', new DefaultValuePipe(false), ParseBoolPipe)
    shop: boolean,
    @Query('deliveryArea', new DefaultValuePipe(false), ParseBoolPipe)
    deliveryArea: boolean,
    @Query('parcelUser', new DefaultValuePipe(false), ParseBoolPipe)
    parcelUser: boolean,
  ) {
    try {
      const deliverymanId = req.user.id;
      const parcels = await this.parcelsService.parcels(
        {
          where: {
            AND: [
              {
                FieldPackageHandler: {
                  userId: deliverymanId,
                },
              },
              {
                parcelStatus: {
                  name: 'in-transit',
                },
              },
            ],
          },
        },
        {
          include: {
            parcelPickUp: pickup && {
              include: {
                area: true,
              },
            },
            shop,
            parcelUser: parcelUser,
            parcelDeliveryArea: deliveryArea && {
              include: {
                district: {
                  include: {
                    division: deliveryArea,
                  },
                },
              },
            },
            parcelStatus: true,
          },
        },
      );
      return { data: parcels };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // PATCH /parcels/packagehandler/picked-up/:parcelNumber
  // Confirm merchant pickup completed
  @Patch('packagehandler/picked-up/:parcelNumber')
  @UseGuards(JwtAuthGuard)
  async confirmPickup(
    @Request() req,
    @Param('parcelNumber') parcelNumber: string,
  ) {
    try {
      const existing: any = await this.parcelsService.parcel(
        { parcelNumber },
        {
          include: {
            FieldPackageHandler: true,
            parcelPickUp: true,
          },
        },
      );
      if (!existing) {
        throw new NotFoundException(
          `Parcel with number ${parcelNumber} not found`,
        );
      }
      if (
        existing.FieldPackageHandler &&
        existing.FieldPackageHandler.userId !== req.user.id
      ) {
        throw new UnauthorizedException(
          'You are not assigned to pick up this parcel',
        );
      }

      const result = await this.parcelsService.updateParcel({
        where: { parcelNumber },
        data: {
          ParcelTimeline: {
            create: {
              message: 'Parcel picked up from merchant location',
              parcelStatus: { connect: { name: 'processing' } },
            },
          },
          parcelStatus: { connect: { name: 'processing' } },
          FieldPackageHandler: { disconnect: true },
        },
      });

      this.realtimeGateway.emitParcelStatus(parcelNumber, {
        status: 'processing',
        message: 'Parcel picked up',
      });

      await this.notificationsService.notifyParcelStatusChange({
        customerPhone: existing.customerPhone,
        merchantUserId: existing.parcelUserId,
        parcelNumber,
        statusName: 'processing',
        message: 'Your parcel has been picked up.',
      });

      return { data: result };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // PATCH /parcels/packagehandler/delivered/:parcelNumber
  // Mark parcel delivered with optional proof of delivery
  @Patch('packagehandler/delivered/:parcelNumber')
  @UseGuards(JwtAuthGuard)
  async parcelsDeliveredByDeliveryman(
    @Param('parcelNumber') parcelNumber: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    body: DeliverParcelDto = {},
  ) {
    try {
      const existing = await this.parcelsService.parcel({ parcelNumber });
      if (!existing) {
        throw new NotFoundException(
          `Parcel with number ${parcelNumber} not found`,
        );
      }

      const otpVerified = Boolean(body.deliveryOtp);
      const result = await this.parcelsService.updateParcel({
        where: {
          parcelNumber,
        },
        data: {
          ParcelTimeline: {
            create: {
              message:
                'Parcel has been delivered. Thank you for using our service.',
              proofPhotoUrl: body.proofPhotoUrl,
              proofSignature: body.proofSignature,
              deliveryOtp: body.deliveryOtp,
              otpVerified,
              parcelStatus: {
                connect: {
                  name: 'delivered',
                },
              },
            },
          },
          parcelStatus: {
            connect: {
              name: 'delivered',
            },
          },
          FieldPackageHandler: {
            disconnect: true,
          },
        },
      });

      this.realtimeGateway.emitParcelStatus(parcelNumber, {
        status: 'delivered',
        proofPhotoUrl: body.proofPhotoUrl,
        otpVerified,
      });

      await this.notificationsService.notifyParcelStatusChange({
        customerPhone: existing.customerPhone,
        merchantUserId: existing.parcelUserId,
        parcelNumber,
        statusName: 'delivered',
        message: 'Your parcel has been delivered.',
      });

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
