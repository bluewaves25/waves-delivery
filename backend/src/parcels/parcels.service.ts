import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Parcel, Prisma, Zones } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GuestCreateParcelDto } from './dto/parcels.dto';

const WALKIN_EMAIL = process.env.GUEST_SHOP_EMAIL || 'walkin@sendgh.com';
const DEMO_PASSWORD_HASH =
  '$2b$10$btodHpHti0d4gEB2zd1LdueFA1lJLISmdvNxOVuvQda5DfJDnHD1u';

function priceForWeight(
  pricing: {
    KG05_PRICE: number;
    KG1_PRICE: number;
    KG2_PRICE: number;
    KG3_PRICE: number;
    KG4_PRICE: number;
    KG5_PRICE: number;
  },
  weightGrams: number,
): number {
  if (weightGrams <= 500) return pricing.KG05_PRICE;
  if (weightGrams <= 1000) return pricing.KG1_PRICE;
  if (weightGrams <= 2000) return pricing.KG2_PRICE;
  if (weightGrams <= 3000) return pricing.KG3_PRICE;
  if (weightGrams <= 4000) return pricing.KG4_PRICE;
  if (weightGrams <= 5000) return pricing.KG5_PRICE;
  return Math.round((pricing.KG5_PRICE / 5000) * weightGrams);
}

@Injectable()
export class ParcelsService {
  constructor(private prisma: PrismaService) {}

  // Get a single parcel
  async parcel(
    userWhereUniqueInput: Prisma.ParcelWhereUniqueInput,
    options?: Prisma.ParcelArgs,
  ): Promise<Parcel | null> {
    return this.prisma.parcel.findUnique({
      where: userWhereUniqueInput,
      ...options,
    });
  }

  // Get all parcels
  async parcels(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ParcelWhereUniqueInput;
      where?: Prisma.ParcelWhereInput;
      orderBy?: Prisma.ParcelOrderByWithRelationInput;
    },
    options?: Prisma.ParcelArgs,
  ): Promise<Parcel[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.parcel.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      ...options,
    });
  }

  // Create a single parcel
  async createParcel(data: Prisma.ParcelCreateInput): Promise<Parcel> {
    return this.prisma.parcel.create({
      data,
    });
  }

  // Update a single parcel
  async updateParcel(params: {
    where: Prisma.ParcelWhereUniqueInput;
    data: Prisma.ParcelUpdateInput;
  }): Promise<Parcel> {
    const { where, data } = params;
    return this.prisma.parcel.update({
      data,
      where,
    });
  }

  // Delete a single parcel
  async deleteUser(where: Prisma.ParcelWhereUniqueInput): Promise<Parcel> {
    return this.prisma.parcel.delete({
      where,
    });
  }

  // Get parcel pricing
  async parcelPricing(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ZonesWhereUniqueInput;
      where?: Prisma.ZonesWhereInput;
      orderBy?: Prisma.ZonesOrderByWithRelationInput;
    },
    options?: Prisma.ZonesArgs,
  ): Promise<Zones[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.zones.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      ...options,
    });
  }

  /** Ensure SendGH Walk-in merchant + shop exist (idempotent). */
  async ensureWalkInShop() {
    const merchantRole = await this.prisma.roleDescription.findUnique({
      where: { name: 'merchant' },
    });
    if (!merchantRole) {
      throw new BadRequestException('Merchant role missing — run seed first');
    }

    const hubArea =
      (await this.prisma.areas.findFirst({ where: { name: 'Osu' } })) ||
      (await this.prisma.areas.findFirst());
    if (!hubArea) {
      throw new BadRequestException('No delivery areas — run location seed first');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: WALKIN_EMAIL },
      include: { shops: { include: { pickUpPoints: true } } },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: WALKIN_EMAIL,
          name: 'SendGH Walk-in',
          phone: '0300000000',
          password: DEMO_PASSWORD_HASH,
          roles: {
            create: { role: { connect: { id: merchantRole.id } } },
          },
          shops: {
            create: {
              name: 'SendGH Walk-in',
              email: WALKIN_EMAIL,
              address: `${hubArea.name}, Accra, Ghana`,
              productType: 'General',
              productSubType: 'Walk-in',
              pickUpPoints: {
                create: {
                  name: 'SendGH Accra Hub',
                  address: `${hubArea.name}, Accra, Ghana`,
                  areaId: hubArea.id,
                  phone: '0300000000',
                  isActive: true,
                },
              },
            },
          },
        },
        include: { shops: { include: { pickUpPoints: true } } },
      });
    }

    let shop = user.shops[0];
    if (!shop) {
      shop = await this.prisma.shops.create({
        data: {
          name: 'SendGH Walk-in',
          email: WALKIN_EMAIL,
          address: `${hubArea.name}, Accra, Ghana`,
          productType: 'General',
          productSubType: 'Walk-in',
          userId: user.id,
          pickUpPoints: {
            create: {
              name: 'SendGH Accra Hub',
              address: `${hubArea.name}, Accra, Ghana`,
              areaId: hubArea.id,
              phone: '0300000000',
              isActive: true,
            },
          },
        },
        include: { pickUpPoints: true },
      });
    }

    return { user, shop, hubArea };
  }

  async createGuestParcel(dto: GuestCreateParcelDto) {
    const senderArea = await this.prisma.areas.findUnique({
      where: { id: dto.senderAreaId },
    });
    if (!senderArea) {
      throw new NotFoundException('Pickup area not found');
    }

    const deliveryArea = await this.prisma.areas.findUnique({
      where: { id: dto.parcelDeliveryAreaId },
      include: { zones: { include: { pricing: true } } },
    });
    if (!deliveryArea?.zones?.pricing) {
      throw new NotFoundException('Delivery area or pricing not found');
    }

    const status =
      (await this.prisma.parcelStatus.findFirst({
        where: { name: 'pending' },
      })) || (await this.prisma.parcelStatus.findFirst());
    if (!status) {
      throw new BadRequestException('Parcel statuses missing — run seed');
    }

    const category = await this.prisma.parcelProductCategories.findFirst();
    if (!category) {
      throw new BadRequestException('Parcel categories missing — run seed');
    }

    const { user, shop } = await this.ensureWalkInShop();

    const cash = Number(dto.parcelCashCollection ?? 0) || 0;
    const weight = Math.max(1, Math.round(Number(dto.parcelWeight)));
    const deliveryCharge = priceForWeight(deliveryArea.zones.pricing, weight);
    const codFee = cash > 0 ? cash / 100 : 0;
    const parcelCharge = deliveryCharge + codFee;
    // parcelPrice = goods value for COD (cash to collect); charge is courier fee
    const parcelPrice = cash > 0 ? cash : deliveryCharge;

    const pickup = await this.prisma.pickUpPoints.create({
      data: {
        name: dto.senderName.trim(),
        address: dto.senderAddress.trim(),
        phone: dto.senderPhone.trim(),
        areaId: dto.senderAreaId,
        shopsId: shop.id,
        isActive: true,
      },
    });

    const noteParts = [
      `Guest booking from ${dto.senderName.trim()} (${dto.senderPhone.trim()})`,
      dto.parcelExtraInformation?.trim() || null,
    ].filter(Boolean);

    const parcel = await this.prisma.parcel.create({
      data: {
        customerName: dto.customerName.trim(),
        customerPhone: dto.customerPhone.trim(),
        customerAddress: dto.customerAddress.trim(),
        parcelWeight: weight,
        parcelCashCollection: cash,
        parcelPrice,
        parcelCharge,
        parcelProductType: 'General',
        parcelExtraInformation: noteParts.join(' — '),
        parcelProductCategory: { connect: { id: category.id } },
        shop: { connect: { id: shop.id } },
        parcelUser: { connect: { id: user.id } },
        parcelPickUp: { connect: { id: pickup.id } },
        parcelStatus: { connect: { id: status.id } },
        parcelDeliveryArea: { connect: { id: dto.parcelDeliveryAreaId } },
        ParcelTimeline: {
          create: {
            message: `Guest booking created. Pickup from ${dto.senderAddress.trim()}`,
            parcelStatusId: status.id,
          },
        },
      },
    });

    return {
      parcelNumber: parcel.parcelNumber,
      trackingToken: parcel.trackingToken,
      parcelCharge,
      deliveryCharge,
      cashCollection: cash,
    };
  }
}
