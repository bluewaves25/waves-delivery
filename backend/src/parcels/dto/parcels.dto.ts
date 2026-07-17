import { Parcel, Prisma } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParcelDto implements Parcel {
  id: number;

  @IsNotEmpty()
  @IsString({ message: "'customerName' must be a string" })
  customerName: string;
  @IsNotEmpty()
  @IsString({ message: "'customerPhone' must be a string" })
  customerPhone: string;
  @IsNotEmpty()
  @IsString({ message: "'customerAddress' must be a string" })
  customerAddress: string;

  @IsOptional()
  @IsNumber({}, { message: "'customerLatitude' must be a number" })
  customerLatitude: number | null;

  @IsOptional()
  @IsNumber({}, { message: "'customerLongitude' must be a number" })
  customerLongitude: number | null;

  @IsNotEmpty()
  @IsNumber({}, { message: "'parcelWeight' must be a number" })
  parcelWeight: number;
  @IsNotEmpty()
  @IsNumber({}, { message: "'parcelCashCollection' must be a number" })
  parcelCashCollection: number;
  @IsNotEmpty()
  @IsString({ message: "'parcelProductType' must be a string" })
  parcelProductType: string;
  @IsNotEmpty()
  @IsNumber({}, { message: "'parcelProductCategoriesId' must be a number" })
  parcelProductCategoriesId: number;
  @IsNotEmpty()
  @IsNumber({}, { message: "'parcelPickUpId' must be a number" })
  parcelPickUpId: number;
  @IsNotEmpty()
  @IsNumber({}, { message: "'parcelStatusId' must be a number" })
  parcelStatusId: number;
  @IsNotEmpty()
  @IsNumber({}, { message: "'parcelPrice' must be a number" })
  parcelPrice: number;
  @IsNotEmpty()
  @IsNumber({}, { message: "'parcelCharge' must be a number" })
  parcelCharge: number;
  @IsNotEmpty()
  @IsNumber({}, { message: "'shopsId' must be a number" })
  shopsId: number;
  @IsNotEmpty()
  @IsNumber({}, { message: "'parcelDeliveryAreaId' must be a number" })
  parcelDeliveryAreaId: number;

  parcelUserId: number;
  parcelExtraInformation: string;
  customerParcelInvoiceId: string;
  fieldPackageHandlerId: number;
  parcelNumber: string;
  trackingToken: string;
  assignmentIdempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Public guest booking — no shop/user IDs from client */
export class GuestCreateParcelDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  senderName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  senderPhone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  senderAddress: string;

  @Type(() => Number)
  @IsNumber()
  senderAreaId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  customerName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  customerPhone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  customerAddress: string;

  @Type(() => Number)
  @IsNumber()
  parcelDeliveryAreaId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  parcelWeight: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  parcelCashCollection?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  parcelExtraInformation?: string;
}

export class UpdateParcelDto implements Prisma.ParcelUpdateInput {
  @IsOptional()
  @IsString({ message: "'customerName' must be a string" })
  customerName: string;
  @IsOptional()
  @IsString({ message: "'customerPhone' must be a string" })
  customerPhone: string;
  @IsOptional()
  @IsString({ message: "'customerAddress' must be a string" })
  customerAddress: string;

  @IsOptional()
  @IsNumber({}, { message: "'customerLatitude' must be a number" })
  customerLatitude?: number | null;

  @IsOptional()
  @IsNumber({}, { message: "'customerLongitude' must be a number" })
  customerLongitude?: number | null;
}
