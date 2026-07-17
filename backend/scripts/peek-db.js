const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const parcels = await p.parcel.findMany({
    take: 5,
    select: {
      parcelNumber: true,
      trackingToken: true,
      customerName: true,
      customerLatitude: true,
      customerLongitude: true,
    },
  });
  console.log(JSON.stringify(parcels, null, 2));
  const users = await p.user.findMany({
    take: 6,
    select: { id: true, email: true, name: true },
  });
  console.log('USERS', JSON.stringify(users, null, 2));
  await p.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
  process.exit(1);
});
