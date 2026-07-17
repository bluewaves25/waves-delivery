import { PickUpPoints } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreatePickUpPointsDto implements PickUpPoints {
  id: number;

  @IsNotEmpty()
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsNotEmpty()
  @IsString({ message: 'Address must be a string' })
  address: string;

  @IsOptional()
  @IsNumber({}, { message: 'latitude must be a number' })
  latitude: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'longitude must be a number' })
  longitude: number | null;

  @IsNotEmpty()
  @IsNumber({}, { message: 'areaId must be a number' })
  areaId: number;

  @IsNotEmpty()
  @IsString({ message: 'Phone number must be a string' })
  phone: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  shopsId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdatePickUpPointsDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsNumber({}, { message: 'latitude must be a number' })
  latitude?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'longitude must be a number' })
  longitude?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'areaId must be a number' })
  areaId?: number;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
