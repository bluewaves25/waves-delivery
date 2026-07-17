import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guard/roles.guard';
import { PaymentsService } from './payments.service';

class InitiatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  parcelId?: number;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

class RiderPayoutDto {
  @IsNotEmpty()
  @IsNumber()
  riderUserId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;

  @IsOptional()
  @IsString()
  description?: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiate(@Request() req, @Body(ValidationPipe) body: InitiatePaymentDto) {
    const payment = await this.paymentsService.initiatePaystackPayment({
      userId: req.user.id,
      ...body,
    });
    return { data: payment };
  }

  @Post('verify/:providerRef')
  @UseGuards(JwtAuthGuard)
  async verify(@Param('providerRef') providerRef: string) {
    const payment = await this.paymentsService.verifyPayment(providerRef);
    return { data: payment };
  }

  @Post('payout')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async payout(@Body(ValidationPipe) body: RiderPayoutDto) {
    const payment = await this.paymentsService.createRiderPayout(body);
    return { data: payment };
  }

  @Get('ledger')
  @UseGuards(JwtAuthGuard)
  async ledger(@Request() req) {
    const entries = await this.paymentsService.ledgerForUser(req.user.id);
    return { data: entries };
  }
}
