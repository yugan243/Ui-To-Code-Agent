// lib/prisma.ts
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// 1. Setup WebSocket for Node.js environments (Next.js server-side)
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const prismaClientSingleton = () => {
  // 2. PASS THE CONFIG DIRECTLY
  // Instead of 'new Pool()', pass the connection string inside an object.
  // This satisfies the 'PoolConfig' requirement.
  const adapter = new PrismaNeon({ 
    connectionString: process.env.DATABASE_URL 
  });
  
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;