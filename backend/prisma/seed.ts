import { DatabaseSync } from 'node:sqlite';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.resolve(__dirname, 'dev.db');
const db = new DatabaseSync(dbPath);

type SeedItem = {
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
};

const items: SeedItem[] = [
  // ── Apparel ───────────────────────────────────────────────────────────────
  {
    name: 'Premium Panjabi - Deep Navy',
    category: 'Apparel',
    price: 2850,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  },
  {
    name: 'Handloom Jamdani Saree',
    category: 'Apparel',
    price: 7500,
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
  },
  {
    name: 'Minimalist Cotton Graphic Tee',
    category: 'Apparel',
    price: 850,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
  },
  {
    name: 'Over-sized Streetwear Hoodie',
    category: 'Apparel',
    price: 1950,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80',
  },

  // ── Tech & Gadgets ────────────────────────────────────────────────────────
  {
    name: 'Mechanical Keyboard (Red Switches)',
    category: 'Tech & Gadgets',
    price: 5200,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
  },
  {
    name: 'Ergonomic Vertical Mouse',
    category: 'Tech & Gadgets',
    price: 2400,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
  },
  {
    name: 'RGB Desktop Light Bar',
    category: 'Tech & Gadgets',
    price: 1800,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c228b07b8d?w=800&q=80',
  },
  {
    name: 'Type-C Premium Hub (7-in-1)',
    category: 'Tech & Gadgets',
    price: 3500,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80',
  },

  // ── Home & Living ─────────────────────────────────────────────────────────
  {
    name: 'Handcrafted Clay Dinnerware Set',
    category: 'Home & Living',
    price: 4200,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80',
  },
  {
    name: 'Minimalist Scented Soy Candle',
    category: 'Home & Living',
    price: 650,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
  },
  {
    name: 'Sleek Desk Organizer Stand',
    category: 'Home & Living',
    price: 1350,
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
  },
  {
    name: 'Premium Jute Area Rug (4×6 ft)',
    category: 'Home & Living',
    price: 3800,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
  },

  // ── Fitness & Lifestyle ────────────────────────────────────────────────────
  {
    name: 'Stainless Steel Vacuum Flask (750ml)',
    category: 'Fitness & Lifestyle',
    price: 1200,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
  },
  {
    name: 'High-Density Yoga Mat Set',
    category: 'Fitness & Lifestyle',
    price: 2200,
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  },
  {
    name: 'Lightweight Sports Duffel Bag',
    category: 'Fitness & Lifestyle',
    price: 1750,
    stock: 9,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
  },
    // ── More Apparel ──────────────────────────────────────────────────────────
  {
    name: 'Classic Linen Shirt - White',
    category: 'Apparel',
    price: 2200,
    stock: 24,
    imageUrl: 'https://picsum.photos/seed/linen-shirt/800/600',
  },
  {
    name: 'Cotton Kurti - Sage Green',
    category: 'Apparel',
    price: 1650,
    stock: 30,
    imageUrl: 'https://picsum.photos/seed/cotton-kurti/800/600',
  },
  {
    name: 'Slim-Fit Chino Trousers',
    category: 'Apparel',
    price: 2400,
    stock: 16,
    imageUrl: 'https://picsum.photos/seed/chino-trousers/800/600',
  },
  {
    name: 'Nakshi Kantha Embroidered Shawl',
    category: 'Apparel',
    price: 3200,
    stock: 0,
    imageUrl: 'https://picsum.photos/seed/kantha-shawl/800/600',
  },

  // ── More Tech & Gadgets ───────────────────────────────────────────────────
  {
    name: 'Wireless Earbuds with ANC',
    category: 'Tech & Gadgets',
    price: 4800,
    stock: 25,
    imageUrl: 'https://picsum.photos/seed/wireless-earbuds/800/600',
  },
  {
    name: '20,000mAh Fast-Charge Power Bank',
    category: 'Tech & Gadgets',
    price: 2600,
    stock: 40,
    imageUrl: 'https://picsum.photos/seed/power-bank/800/600',
  },
  {
    name: 'Portable Bluetooth Speaker',
    category: 'Tech & Gadgets',
    price: 3300,
    stock: 0,
    imageUrl: 'https://picsum.photos/seed/bt-speaker/800/600',
  },
  {
    name: 'Aluminium Laptop Stand',
    category: 'Tech & Gadgets',
    price: 1900,
    stock: 28,
    imageUrl: 'https://picsum.photos/seed/laptop-stand/800/600',
  },

  // ── More Home & Living ────────────────────────────────────────────────────
  {
    name: 'Cotton Bed Sheet Set (Queen)',
    category: 'Home & Living',
    price: 3400,
    stock: 12,
    imageUrl: 'https://picsum.photos/seed/bed-sheets/800/600',
  },
  {
    name: 'Bamboo Floating Wall Shelf',
    category: 'Home & Living',
    price: 1750,
    stock: 14,
    imageUrl: 'https://picsum.photos/seed/wall-shelf/800/600',
  },
  {
    name: 'Ceramic Table Lamp',
    category: 'Home & Living',
    price: 2800,
    stock: 9,
    imageUrl: 'https://picsum.photos/seed/table-lamp/800/600',
  },
  {
    name: 'Woven Storage Basket Set (3 pcs)',
    category: 'Home & Living',
    price: 1450,
    stock: 33,
    imageUrl: 'https://picsum.photos/seed/storage-baskets/800/600',
  },

  // ── More Fitness & Lifestyle ──────────────────────────────────────────────
  {
    name: 'Adjustable Dumbbell Pair (10 kg)',
    category: 'Fitness & Lifestyle',
    price: 4500,
    stock: 7,
    imageUrl: 'https://picsum.photos/seed/dumbbells/800/600',
  },
  {
    name: 'Resistance Band Set (5 pcs)',
    category: 'Fitness & Lifestyle',
    price: 950,
    stock: 50,
    imageUrl: 'https://picsum.photos/seed/resistance-bands/800/600',
  },
  {
    name: 'Speed Jump Rope',
    category: 'Fitness & Lifestyle',
    price: 480,
    stock: 0,
    imageUrl: 'https://picsum.photos/seed/jump-rope/800/600',
  },
];

// Make sure the table exists (fresh deploys have no database yet)
db.exec(`CREATE TABLE IF NOT EXISTS "InventoryItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "price" REAL NOT NULL,
  "stock" INTEGER NOT NULL,
  "imageUrl" TEXT,
  "dateAdded" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

// Wipe existing data
db.exec('DELETE FROM InventoryItem');
console.log('✓ Cleared existing inventory data');

const insert = db.prepare(
  'INSERT INTO InventoryItem (id, name, category, price, stock, imageUrl, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?)',
);

for (const item of items) {
  insert.run(
    uuidv4(),
    item.name,
    item.category,
    item.price,
    item.stock,
    item.imageUrl,
    new Date().toISOString(),
  );
  console.log(`✓ Inserted: ${item.name}`);
}

db.close();
console.log(`\n🎉 Database re-seeded with ${items.length} premium products!`);