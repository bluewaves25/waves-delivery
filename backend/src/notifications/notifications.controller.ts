import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

class RegisterDeviceDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  platform?: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('device-token')
  @UseGuards(JwtAuthGuard)
  async registerDevice(
    @Request() req,
    @Body(ValidationPipe) body: RegisterDeviceDto,
  ) {
    const device = await this.notificationsService.registerDeviceToken(
      req.user.id,
      body.token,
      body.platform || 'android',
    );
    return { data: device };
  }
}
