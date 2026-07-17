import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { IsNumber, IsOptional } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guard/roles.guard';
import { ServiceAreaService } from './service-area.service';

class UpdateAreaCoordinatesDto {
  @IsOptional()
  @IsNumber({}, { message: 'latitude must be a number' })
  latitude?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'longitude must be a number' })
  longitude?: number | null;
}

@Controller('service-area')
export class ServiceAreaController {
  constructor(private serviceAreaService: ServiceAreaService) {}

  @Get('tree')
  async divisions() {
    const divisions = await this.serviceAreaService.divisions(
      {},
      {
        include: {
          districts: {
            include: {
              areas: true,
            },
          },
        },
      },
    );
    return {
      divisions,
    };
  }

  @Patch('areas/:areaId/coordinates')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateAreaCoordinates(
    @Param('areaId', ParseIntPipe) areaId: number,
    @Body(ValidationPipe) body: UpdateAreaCoordinatesDto,
  ) {
    const area = await this.serviceAreaService.updateAreaCoordinates(
      areaId,
      body,
    );
    return { data: area };
  }
}
