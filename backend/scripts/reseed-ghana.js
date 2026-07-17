/**
 * Wipe Bangladesh location rows and reseed Ghana.
 * Keeps users/shops if possible by clearing dependent parcel data first.
 */
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');

const prisma = new PrismaClient();

(async () => {
  console.log('Clearing parcel + location data…');
  await prisma.notificationLog.deleteMany();
  await prisma.deviceToken.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.walletLedger.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.riderLocation.deleteMany();
  await prisma.parcelTimeline.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.pickUpPoints.deleteMany();
  await prisma.fieldPackageHandler.deleteMany();
  await prisma.areas.deleteMany();
  await prisma.districts.deleteMany();
  await prisma.divisions.deleteMany();
  // keep zone pricing rows if names conflict — delete areas first then zones
  await prisma.zones.deleteMany();
  await prisma.parcelPricing.deleteMany();

  console.log('Seeding Ghana locations…');
  execSync('npx ts-node prisma/seeds/ghanaLocationSeed.ts', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });

  // Re-link shop pickup if shop still exists
  const shop = await prisma.shops.findFirst();
  const area = await prisma.areas.findFirst({
    where: { name: 'East Legon' },
  });
  if (shop && area) {
    await prisma.pickUpPoints.create({
      data: {
        name: 'Accra Main Pickup',
        address: 'East Legon, Accra',
        latitude: 5.65,
        longitude: -0.15,
        phone: '0244111222',
        isActive: true,
        areaId: area.id,
        shopsId: shop.id,
      },
    });

    // restore package handlers without area
    const reyad = await prisma.user.findFirst({
      where: { email: 'reyad@gmail.com' },
    });
    const tushar = await prisma.user.findFirst({
      where: { email: 'tushar@gmail.com' },
    });
    if (reyad) {
      await prisma.fieldPackageHandler.create({
        data: {
          address: 'Kaneshie, Accra',
          latitude: 5.56,
          longitude: -0.24,
          isOnline: true,
          lastLat: 5.56,
          lastLng: -0.24,
          lastLocationAt: new Date(),
          areaId: area.id,
          userId: reyad.id,
        },
      });
    }
    if (tushar) {
      const tema = await prisma.areas.findFirst({
        where: { name: 'Spintex' },
      });
      await prisma.fieldPackageHandler.create({
        data: {
          address: 'Spintex, Accra',
          latitude: 5.63,
          longitude: -0.1,
          isOnline: true,
          lastLat: 5.63,
          lastLng: -0.1,
          lastLocationAt: new Date(),
          areaId: (tema || area).id,
          userId: tushar.id,
        },
      });
    }

    await prisma.parcel.create({
      data: {
        parcelNumber: 'DEMO-TRACK-001',
        customerName: 'Ama Mensah',
        customerPhone: '0244111222',
        customerAddress: 'East Legon, Accra',
        customerLatitude: 5.65,
        customerLongitude: -0.15,
        parcelProductType: 'Documents',
        parcelWeight: 1,
        parcelCashCollection: 0,
        parcelPrice: 50,
        parcelCharge: 22,
        parcelProductCategoriesId: (
          await prisma.parcelProductCategories.findFirst()
        ).id,
        parcelStatusId: (await prisma.parcelStatus.findFirst()).id,
        shopsId: shop.id,
        parcelPickUpId: (await prisma.pickUpPoints.findFirst()).id,
        parcelDeliveryAreaId: area.id,
        parcelUserId: (await prisma.user.findFirst({
          where: { email: 'maruffamd@gmail.com' },
        })).id,
        ParcelTimeline: {
          create: {
            message: 'Demo parcel ready for Ghana tracking',
            parcelStatusId: (await prisma.parcelStatus.findFirst()).id,
          },
        },
      },
    });
  }

  console.log('Done — Ghana locations ready');
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
