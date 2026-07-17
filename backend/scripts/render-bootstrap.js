/**
 * Render bootstrap: migrate DB, seed once if empty, then start Nest.
 */
const { spawnSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

function run(cmd, args) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (res.status !== 0) {
    process.exit(res.status || 1);
  }
}

async function main() {
  run('npx', ['prisma', 'migrate', 'deploy']);

  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.count();
    const areas = await prisma.areas.count();
    const shops = await prisma.shops.count();
    // shops===0 means a previous seed likely failed mid-way (areas only)
    if (users === 0 || areas === 0 || shops === 0) {
      console.log(
        `Empty/incomplete database (users=${users}, areas=${areas}, shops=${shops}) — seeding…`,
      );
      run('npx', ['ts-node', 'prisma/seeds/ghanaLocationSeed.ts']);
      run('npx', ['ts-node', 'prisma/seeds/parcelCatSeed.ts']);
      run('npx', ['ts-node', 'prisma/seed.ts']);
      run('node', ['scripts/ensure-demo-parcel.js']);
      console.log('Seed complete');
    } else {
      console.log(`DB ready (users=${users}, areas=${areas}, shops=${shops})`);
    }
  } finally {
    await prisma.$disconnect();
  }

  run('node', ['dist/main']);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
