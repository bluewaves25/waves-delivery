import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guard/roles.guard';
import { DispatchService } from './dispatch.service';

class AutoDispatchDto {
  @IsNotEmpty()
  @IsString()
  parcelNumber: string;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;

  @IsOptional()
  @IsIn(['pickupman', 'deliveryman'])
  handlerType?: 'pickupman' | 'deliveryman';
}

@Controller('dispatch')
export class DispatchController {
  constructor(private dispatchService: DispatchService) {}

  @Post('auto-assign')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async autoAssign(@Body(ValidationPipe) body: AutoDispatchDto) {
    const parcel = await this.dispatchService.assignNearestRider(body);
    return { data: parcel };
  }
}
