import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.resolve(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath);

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
];

db.serialize(() => {
  // Wipe existing data
  db.run('DELETE FROM InventoryItem', (err) => {
    if (err) console.error('Error clearing table:', err);
    else console.log('✓ Cleared existing inventory data');
  });

  const stmt = db.prepare(
    'INSERT INTO InventoryItem (id, name, category, price, stock, imageUrl, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );

  for (const item of items) {
    stmt.run(
      uuidv4(),
      item.name,
      item.category,
      item.price,
      item.stock,
      item.imageUrl,
      new Date().toISOString(),
      (err: Error | null) => {
        if (err) console.error(`✗ Failed to insert "${item.name}":`, err);
        else console.log(`✓ Inserted: ${item.name}`);
      },
    );
  }

  stmt.finalize(() => {
    console.log('\n🎉 Database re-seeded with 15 premium products!');
    db.close();
  });
});