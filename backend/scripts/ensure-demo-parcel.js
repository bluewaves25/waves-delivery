const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const counts = {
    areas: await p.areas.count(),
    shops: await p.shops.count(),
    statuses: await p.parcelStatus.count(),
    pickups: await p.pickUpPoints.count(),
    cats: await p.parcelProductCategories.count(),
    parcels: await p.parcel.count(),
  };
  console.log('COUNTS', counts);

  const shop = await p.shops.findFirst({ include: { pickUpPoints: true } });
  const area = await p.areas.findFirst();
  const status = await p.parcelStatus.findFirst({
    where: { name: 'pending' },
  }) || await p.parcelStatus.findFirst();
  const cat = await p.parcelProductCategories.findFirst();
  const merchant = await p.user.findFirst({
    where: { email: 'maruffamd@gmail.com' },
  });

  if (!shop || !area || !status || !cat || !merchant) {
    throw new Error(
      'Missing seed base data. Run: cd backend && npm run seed',
    );
  }

  const pickup =
    shop.pickUpPoints[0] ||
    (await p.pickUpPoints.create({
      data: {
        name: 'Main Pickup',
        address: 'Accra Central',
        latitude: 5.6037,
        longitude: -0.187,
        phone: '0200000000',
        isActive: true,
        areaId: area.id,
        shopsId: shop.id,
      },
    }));

  // Ensure area + pickup have coords (Accra)
  await p.areas.update({
    where: { id: area.id },
    data: { latitude: 5.6037, longitude: -0.187 },
  });
  await p.pickUpPoints.update({
    where: { id: pickup.id },
    data: { latitude: 5.6037, longitude: -0.187 },
  });

  const handlers = await p.fieldPackageHandler.findMany();
  for (const h of handlers) {
    await p.fieldPackageHandler.update({
      where: { id: h.id },
      data: {
        isOnline: true,
        latitude: 5.61 + h.id * 0.002,
        longitude: -0.19,
        lastLat: 5.61 + h.id * 0.002,
        lastLng: -0.19,
        lastLocationAt: new Date(),
      },
    });
  }

  const existing = await p.parcel.findFirst({
    where: { parcelNumber: 'DEMO-TRACK-001' },
  });
  if (existing) {
    console.log('DEMO PARCEL', {
      parcelNumber: existing.parcelNumber,
      trackingToken: existing.trackingToken,
    });
    await p.$disconnect();
    return;
  }

  const parcel = await p.parcel.create({
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
      parcelCharge: 20,
      parcelProductCategoriesId: cat.id,
      parcelStatusId: status.id,
      shopsId: shop.id,
      parcelPickUpId: pickup.id,
      parcelDeliveryAreaId: area.id,
      parcelUserId: merchant.id,
      ParcelTimeline: {
        create: {
          message: 'Demo parcel created for tracking test',
          parcelStatusId: status.id,
        },
      },
    },
  });

  console.log('CREATED DEMO PARCEL', {
    parcelNumber: parcel.parcelNumber,
    trackingToken: parcel.trackingToken,
  });
  await p.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
