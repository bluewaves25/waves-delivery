import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

/** Map detected region/city names → our Ghana Division names */
const REGION_ALIASES: Record<string, string> = {
  'greater accra': 'Greater Accra',
  accra: 'Greater Accra',
  ashanti: 'Ashanti',
  kumasi: 'Ashanti',
  central: 'Central',
  'cape coast': 'Central',
  western: 'Western',
  takoradi: 'Western',
  eastern: 'Eastern',
  koforidua: 'Eastern',
  volta: 'Volta',
  ho: 'Volta',
  northern: 'Northern',
  tamale: 'Northern',
  bono: 'Bono',
  brong: 'Bono',
  'brong ahafo': 'Bono',
  sunyani: 'Bono',
  'upper east': 'Upper East',
  bolgatanga: 'Upper East',
  'upper west': 'Upper West',
  wa: 'Upper West',
};

@Controller('geo')
export class GeoController {
  constructor(private prisma: PrismaService) {}

  @Get('detect')
  async detect(@Req() req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string) || '';
    const ip =
      forwarded.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '';

    let country = 'GH';
    let countryName = 'Ghana';
    let region = 'Greater Accra';
    let city = 'Accra';
    let latitude = 5.6037;
    let longitude = -0.187;
    let source: 'ip' | 'default' = 'default';

    const lookupIp =
      ip && !ip.includes('127.') && ip !== '::1' && !ip.startsWith('192.168.')
        ? ip.replace('::ffff:', '')
        : '';

    if (lookupIp) {
      try {
        const res = await fetch(
          `http://ip-api.com/json/${lookupIp}?fields=status,country,countryCode,regionName,city,lat,lon`,
        );
        const data: any = await res.json();
        if (data?.status === 'success') {
          country = data.countryCode || country;
          countryName = data.country || countryName;
          region = data.regionName || region;
          city = data.city || city;
          latitude = data.lat ?? latitude;
          longitude = data.lon ?? longitude;
          source = 'ip';
        }
      } catch {
        // keep Ghana defaults
      }
    }

    // Product is Ghana-first: if IP is outside GH, still default service areas to Accra
    const useGhanaAreas = country === 'GH' || source === 'default';
    const mappedRegion =
      REGION_ALIASES[region.toLowerCase()] ||
      REGION_ALIASES[city.toLowerCase()] ||
      'Greater Accra';

    const suggestedDivision = useGhanaAreas ? mappedRegion : 'Greater Accra';

    const areas = await this.prisma.areas.findMany({
      where: {
        district: {
          division: { name: suggestedDivision },
        },
      },
      take: 40,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        district: {
          select: {
            name: true,
            division: { select: { name: true } },
          },
        },
      },
    });

    const defaultArea =
      areas.find((a) => a.name === 'East Legon') ||
      areas.find((a) => a.name === 'Osu') ||
      areas[0] ||
      null;

    return {
      data: {
        ip: lookupIp || null,
        source,
        country,
        countryName,
        region,
        city,
        latitude,
        longitude,
        currency: 'GHS',
        phonePrefix: '+233',
        suggestedDivision,
        defaultAreaId: defaultArea?.id ?? null,
        suggestedAreas: areas,
        message:
          country === 'GH'
            ? `Detected in ${city}, ${region}. Showing Ghana delivery areas.`
            : `Showing Ghana (Greater Accra) delivery areas. Detected: ${countryName}.`,
      },
    };
  }
}
