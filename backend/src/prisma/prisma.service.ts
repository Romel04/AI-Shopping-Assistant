import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import * as path from 'path';

const SORTABLE_COLUMNS = ['name', 'category', 'price', 'stock', 'dateAdded'];

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public inventoryItem: any;
  private db: DatabaseSync;

  constructor() {
    const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
    // node:sqlite is built into Node (22.5+), so there is no native module to compile
    this.db = new DatabaseSync(dbPath);

    // Runtime assignment of the findMany logic using raw SQL
    this.inventoryItem = {
      findMany: async (args?: any) => {
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

        // orderBy: { price: 'asc' } (column names are whitelisted)
        if (args?.orderBy) {
          const [column, direction] = Object.entries(args.orderBy)[0] ?? [];
          if (column && SORTABLE_COLUMNS.includes(column)) {
            query += ` ORDER BY ${column} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
          }
        }

        const rows = this.db.prepare(query).all(...params);
        return rows.map((row) => ({ ...row })); // plain objects
      },
    };
  }

  async onModuleInit() {
    // Database opens in the constructor
  }

  async onModuleDestroy() {
    this.db.close();
  }
}