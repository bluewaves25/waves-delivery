import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RiderRegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @Type(() => Number)
  @IsNumber()
  areaId: number;

  /** deliveryman | pickupman */
  @IsNotEmpty()
  @IsIn(['deliveryman', 'pickupman'])
  roleType: 'deliveryman' | 'pickupman';
}
