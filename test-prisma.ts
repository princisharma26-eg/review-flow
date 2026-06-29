import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: "file:prisma/dev.db" });
  const prisma = new PrismaClient({ adapter });
  
  console.log("Connected to Prisma");
  try {
    const b = await prisma.business.create({
      data: {
        name: "Test",
        googleReviewLink: "http://test.com"
      }
    });
    console.log(b);
  } catch (e) {
    console.error(e);
  }
}

main();
