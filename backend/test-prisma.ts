import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'file:./prisma/dev.db';

const mockAdapter = new Proxy({}, {
  get: (target, prop) => {
    if (prop === 'provider') return 'sqlite';
    if (prop === 'adapterName') return 'mock';
    return (...args: any[]) => {
      console.log('Adapter called:', prop, args);
      return { ok: true, value: [] };
    };
  }
});

const prisma = new PrismaClient({ adapter: mockAdapter } as any);

async function main() {
  await prisma.$connect();
  const items = await prisma.inventoryItem.findMany();
  console.log("Connected successfully! Found items:", items);
  await prisma.$disconnect();
}
main().catch(console.error);
