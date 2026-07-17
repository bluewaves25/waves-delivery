import { PrismaClient } from '@prisma/client';
import Locations from '../data/GhanaAreaTree';
import AreaPrice from '../data/GhanaAreaPrice';

const prisma = new PrismaClient();

async function main() {
  const zones = AreaPrice.zones;
  const insideAccra = zones[0];
  const suburbAccra = zones[1];
  const outsideAccra = zones[2];

  // Build zone membership from tree Zone tags
  const insideNames = new Set<string>();
  const suburbNames = new Set<string>();
  for (const division of Locations.Divisions) {
    for (const district of division.Districts) {
      for (const a of district.Areas) {
        if (a.Zone?.NAME === 'inside') insideNames.add(a.NAME);
        else if (a.Zone?.NAME === 'suburb') suburbNames.add(a.NAME);
      }
    }
  }

  const inside = await prisma.zones.upsert({
    where: { name: insideAccra.NAME },
    update: {},
    create: {
      name: insideAccra.NAME,
      pricing: {
        create: {
          KG05_PRICE: insideAccra.PRICING.SHOPUP_KG05_PRICE,
          KG1_PRICE: insideAccra.PRICING.SHOPUP_KG1_PRICE,
          KG2_PRICE: insideAccra.PRICING.SHOPUP_KG2_PRICE,
          KG3_PRICE: insideAccra.PRICING.SHOPUP_KG3_PRICE,
          KG4_PRICE: insideAccra.PRICING.SHOPUP_KG4_PRICE,
          KG5_PRICE: insideAccra.PRICING.SHOPUP_KG5_PRICE,
        },
      },
    },
  });

  const suburb = await prisma.zones.upsert({
    where: { name: suburbAccra.NAME },
    update: {},
    create: {
      name: suburbAccra.NAME,
      pricing: {
        create: {
          KG05_PRICE: suburbAccra.PRICING.SHOPUP_KG05_PRICE,
          KG1_PRICE: suburbAccra.PRICING.SHOPUP_KG1_PRICE,
          KG2_PRICE: suburbAccra.PRICING.SHOPUP_KG2_PRICE,
          KG3_PRICE: suburbAccra.PRICING.SHOPUP_KG3_PRICE,
          KG4_PRICE: suburbAccra.PRICING.SHOPUP_KG4_PRICE,
          KG5_PRICE: suburbAccra.PRICING.SHOPUP_KG5_PRICE,
        },
      },
    },
  });

  const outside = await prisma.zones.upsert({
    where: { name: outsideAccra.NAME },
    update: {},
    create: {
      name: outsideAccra.NAME,
      pricing: {
        create: {
          KG05_PRICE: outsideAccra.PRICING.SHOPUP_KG05_PRICE,
          KG1_PRICE: outsideAccra.PRICING.SHOPUP_KG1_PRICE,
          KG2_PRICE: outsideAccra.PRICING.SHOPUP_KG2_PRICE,
          KG3_PRICE: outsideAccra.PRICING.SHOPUP_KG3_PRICE,
          KG4_PRICE: outsideAccra.PRICING.SHOPUP_KG4_PRICE,
          KG5_PRICE: outsideAccra.PRICING.SHOPUP_KG5_PRICE,
        },
      },
    },
  });

  const regionCoords: Record<string, { lat: number; lng: number }> = {
    'Greater Accra': { lat: 5.6037, lng: -0.187 },
    Ashanti: { lat: 6.6885, lng: -1.6244 },
    Central: { lat: 5.1053, lng: -1.2466 },
    Western: { lat: 4.9016, lng: -1.7831 },
    Eastern: { lat: 6.0941, lng: -0.2611 },
    Volta: { lat: 6.6009, lng: 0.4713 },
    Northern: { lat: 9.4034, lng: -0.8424 },
    Bono: { lat: 7.3399, lng: -2.3268 },
    'Upper East': { lat: 10.7859, lng: -0.8514 },
    'Upper West': { lat: 10.0601, lng: -2.5099 },
  };

  for (const division of Locations.Divisions) {
    const div = await prisma.divisions.upsert({
      where: { name: division.NAME },
      update: {},
      create: { name: division.NAME },
    });

    const coords = regionCoords[division.NAME] || {
      lat: 5.6037,
      lng: -0.187,
    };

    for (const d of division.Districts) {
      const dis = await prisma.districts.upsert({
        where: { name: d.NAME },
        update: {},
        create: {
          name: d.NAME,
          division: { connect: { id: div.id } },
        },
      });

      for (const a of d.Areas) {
        const zoneId = insideNames.has(a.NAME)
          ? inside.id
          : suburbNames.has(a.NAME)
          ? suburb.id
          : outside.id;

        await prisma.areas.upsert({
          where: { name: a.NAME },
          update: {
            latitude: coords.lat,
            longitude: coords.lng,
            zonesId: zoneId,
          },
          create: {
            name: a.NAME,
            latitude: coords.lat,
            longitude: coords.lng,
            district: { connect: { id: dis.id } },
            zones: { connect: { id: zoneId } },
          },
        });
      }
    }
  }

  console.log('Ghana locations seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
