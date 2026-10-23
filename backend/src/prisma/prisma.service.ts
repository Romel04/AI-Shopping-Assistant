import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';

// Merge with PrismaClient to pass strict NestJS compiler checks
// without invoking the broken Prisma 7 constructor.
// export interface PrismaService extends PrismaClient {}

const SORTABLE_COLUMNS = ['name', 'category', 'price', 'stock', 'dateAdded'];

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public inventoryItem: any;
  private db: sqlite3.Database;

  constructor() {
    const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
    this.db = new sqlite3.Database(dbPath);

    // Runtime assignment of the findMany logic using raw sqlite3
    this.inventoryItem = {
      findMany: (args?: any) => {
        return new Promise((resolve, reject) => {
          let query = 'SELECT * FROM InventoryItem';
          const params: any[] = [];
          const conditions: string[] = [];
          const where = args?.where ?? {};

          // category: accepts 'Apparel' or { equals: 'Apparel' }
          const category =
            typeof where.category === 'string' ? where.category : where.category?.equals;
          if (category !== undefined) {
            conditions.push('category = ?');
            params.push(category);
          }

          // price: { lte: number }
          if (where.price?.lte !== undefined) {
            conditions.push('price <= ?');
            params.push(where.price.lte);
          }

          // stock: exact number (e.g. 0) or { gt: number }
          if (typeof where.stock === 'number') {
            conditions.push('stock = ?');
            params.push(where.stock);
          } else if (where.stock?.gt !== undefined) {
            conditions.push('stock > ?');
            params.push(where.stock.gt);
          }

          if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
          }

          // orderBy: { price: 'asc' } — column names are whitelisted
          if (args?.orderBy) {
            const [column, direction] = Object.entries(args.orderBy)[0] ?? [];
            if (column && SORTABLE_COLUMNS.includes(column)) {
              query += ` ORDER BY ${column} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
            }
          }

          this.db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      },
    };
  }

  async onModuleInit() {
    // Database connects automatically via sqlite3 driver
  }

  async onModuleDestroy() {
    this.db.close();
  }
}