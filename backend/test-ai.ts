import 'dotenv/config';
import { AiService } from './src/ai/ai.service';
import { PrismaService } from './src/prisma/prisma.service';

async function main() {
  const prisma = new PrismaService();
  const ai = new AiService(prisma);
  ai.onModuleInit();
  
  try {
    const res = await ai.handleInventoryQuery('Do we have any out of stock items in the clothing or electronics categories?');
    console.log(res);
  } catch (err) {
    console.error('Error occurred:', err);
  }
}

main();
