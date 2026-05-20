import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as sqlite3 from 'sqlite3';
import * as path from 'path';

// Merge with PrismaClient to pass strict NestJS compiler checks
// without invoking the broken Prisma 7 constructor.
export interface PrismaService extends PrismaClient {}

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
          let query = "SELECT * FROM InventoryItem";
          const params: any[] = [];
          
          if (args?.where) {
            const conditions: string[] = [];
            if (args.where.category?.equals) {
              conditions.push("category = ?");
              params.push(args.where.category.equals);
            }
            if (args.where.price?.lte) {
              conditions.push("price <= ?");
              params.push(args.where.price.lte);
            }
            if (conditions.length > 0) {
              query += " WHERE " + conditions.join(" AND ");
            }
          }
          
          this.db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      }
    };
  }

  async onModuleInit() {
    // Database connects automatically via sqlite3 driver
  }

  async onModuleDestroy() {
    this.db.close();
  }
}