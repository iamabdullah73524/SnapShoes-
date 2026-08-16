const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Global flag to indicate if we're using mock file-based DB
global.useMockDB = false;
global.mockModels = {};

// Helper to seed initial products if using mock DB
const seedProducts = [
  {
    _id: "prod1",
    name: "Porsche Runner",
    description: "Premium performance running shoes developed in collaboration with Porsche Design. Dynamic cushioning meets aerodynamic detail.",
    brand: "Porsche",
    price: 192,
    salePrice: 124,
    inventory: 15,
    sizes: [7, 8, 9, 10, 11],
    colors: ["Charcoal Black", "Neon Orange", "Steel Grey"],
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"],
    category: "For Him",
    rating: 4.5,
    reviewCount: 84,
    isFeatured: true,
    isBestSeller: true
  },
  {
    _id: "prod2",
    name: "Air Huarache Soft Pink",
    description: "A soft pink edition of the Nike Air Huarache with premium mesh and sculpted comfort for all-day wear.",
    brand: "Nike",
    price: 186.5,
    salePrice: 158.99,
    inventory: 8,
    sizes: [6, 7, 8, 9, 10],
    colors: ["Soft Pink", "Off White", "Sail"],
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80"],
    category: "For Her",
    rating: 4.9,
    reviewCount: 128,
    isFeatured: true,
    isBestSeller: false
  },
  {
    _id: "prod3",
    name: "Yeezy Runner",
    description: "Modern streetwear running shoes featuring primeknit upper, translucent stripe, and ultra-cushioned boost sole for ultimate comfort.",
    brand: "Adidas",
    price: 210.0,
    salePrice: 179.99,
    inventory: 25,
    sizes: [8, 9, 10, 11],
    colors: ["Cloud White", "Core Black"],
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80"],
    category: "Unisex",
    rating: 4.8,
    reviewCount: 312,
    isFeatured: false,
    isBestSeller: true
  },
  {
    _id: "prod4",
    name: "Ninja Stride",
    description: "Stealth black lightweight training shoes with a futuristic ninja design, elastic straps, and high-friction rubber soles.",
    brand: "Reebok",
    price: 175.5,
    salePrice: 149.99,
    inventory: 4,
    sizes: [7, 8, 9, 10],
    colors: ["Stealth Black"],
    images: ["https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=900&q=80"],
    category: "For Him",
    rating: 4.3,
    reviewCount: 61,
    isFeatured: false,
    isBestSeller: true
  },
  {
    _id: "prod5",
    name: "White Classic Court",
    description: "Clean, classic white leather sneakers that pair with any modern outfit for effortless everyday wear.",
    brand: "Puma",
    price: 158.25,
    salePrice: null,
    inventory: 30,
    sizes: [5, 6, 7, 8, 9, 10, 11],
    colors: ["Pure White", "Off White"],
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80"],
    category: "Unisex",
    rating: 4.6,
    reviewCount: 92,
    isFeatured: true,
    isBestSeller: true
  },
  {
    _id: "prod6",
    name: "Retro High Top",
    description: "Retro high-top style shoes with layered breathable mesh panels and signature chunky soles for bold streetwear looks.",
    brand: "Fila",
    price: 142.0,
    salePrice: null,
    inventory: 10,
    sizes: [8, 9, 10],
    colors: ["Core Black", "Navy Blue"],
    images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80"],
    category: "For Kids",
    rating: 4.3,
    reviewCount: 28,
    isFeatured: true,
    isBestSeller: false
  },
  {
    _id: "prod7",
    name: "Orbit Trainer",
    description: "Sculpted running shoes with responsive cushioning and bold contrast panels built for fast, agile strides.",
    brand: "Nike",
    price: 165.0,
    salePrice: 139.0,
    inventory: 12,
    sizes: [7, 8, 9, 10, 11],
    colors: ["Black", "Volt Yellow"],
    images: ["https://images.unsplash.com/photo-1533106418981-0a1a7d0a2c31?auto=format&fit=crop&w=900&q=80"],
    category: "For Him",
    rating: 4.7,
    reviewCount: 73,
    isFeatured: false,
    isBestSeller: true
  },
  {
    _id: "prod8",
    name: "Cloud Wave",
    description: "Ultra-soft knit runners with a streamlined silhouette, engineered comfort, and elevated street edge.",
    brand: "Adidas",
    price: 180.0,
    salePrice: 155.0,
    inventory: 18,
    sizes: [6, 7, 8, 9, 10, 11],
    colors: ["Sky Blue", "White"],
    images: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80"],
    category: "For Her",
    rating: 4.9,
    reviewCount: 110,
    isFeatured: true,
    isBestSeller: false
  },
  {
    _id: "prod9",
    name: "Court Royale",
    description: "Court-inspired sneakers with plush padding, signature midsole, and bold contrast stitching.",
    brand: "Reebok",
    price: 148.5,
    salePrice: null,
    inventory: 22,
    sizes: [7, 8, 9, 10, 11],
    colors: ["White", "Forest Green"],
    images: ["https://images.unsplash.com/photo-1528701800489-20b9e8f64f18?auto=format&fit=crop&w=900&q=80"],
    category: "Unisex",
    rating: 4.5,
    reviewCount: 54,
    isFeatured: false,
    isBestSeller: true
  },
  {
    _id: "prod10",
    name: "Sunset Runner",
    description: "Minimalist runners with soft suede overlays, tonal details, and an effortless lounge-to-street look.",
    brand: "Puma",
    price: 132.0,
    salePrice: 119.0,
    inventory: 14,
    sizes: [6, 7, 8, 9, 10],
    colors: ["Sand", "Coral"],
    images: ["https://images.unsplash.com/photo-1519741494640-6f3b58f48e3f?auto=format&fit=crop&w=900&q=80"],
    category: "For Her",
    rating: 4.6,
    reviewCount: 36,
    isFeatured: false,
    isBestSeller: false
  }
];

class MockModel {
  constructor(collectionName, defaultData = []) {
    this.collectionName = collectionName;
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      return [];
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    let list = this.read();
    return list.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && query[key] !== null) {
          // If query key is an object (like mongoose search queries or array matches)
          if (typeof query[key] === 'object') {
            if (query[key].$in && Array.isArray(query[key].$in)) {
              // Array overlap matching
              const val = item[key];
              if (Array.isArray(val)) {
                if (!val.some(v => query[key].$in.includes(v))) return false;
              } else {
                if (!query[key].$in.includes(val)) return false;
              }
              continue;
            }
          }
          if (item[key] !== query[key]) {
            return false;
          }
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const list = await this.find(query);
    return list[0] || null;
  }

  async findById(id) {
    const list = this.read();
    return list.find(item => item._id === id) || null;
  }

  async create(data) {
    const list = this.read();
    const newItem = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      ...data
    };
    list.push(newItem);
    this.write(list);
    return newItem;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const list = this.read();
    const idx = list.findIndex(item => item._id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...update };
    this.write(list);
    return list[idx];
  }

  async findByIdAndDelete(id) {
    const list = this.read();
    const idx = list.findIndex(item => item._id === id);
    if (idx === -1) return null;
    const deleted = list.splice(idx, 1);
    this.write(list);
    return deleted[0];
  }

  async deleteOne(query = {}) {
    const list = this.read();
    const idx = list.findIndex(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (idx === -1) return false;
    list.splice(idx, 1);
    this.write(list);
    return true;
  }
}

// Set up mock models
const setupMockDB = () => {
  global.useMockDB = true;
  global.mockModels = {
    User: new MockModel('users', []),
    Product: new MockModel('products', seedProducts),
    Address: new MockModel('addresses', []),
    Order: new MockModel('orders', []),
    Review: new MockModel('reviews', []),
    Notification: new MockModel('notifications', [])
  };
  console.log("⚠️  MongoDB offline. File-based Database fallback initiated at backend/data/");
};

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    setupMockDB();
    return;
  }

  try {
    // Attempt Mongoose connection with a fast timeout (2.5 seconds)
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log("🔌 MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    setupMockDB();
  }
};

const getModel = (name) => {
  if (global.useMockDB) {
    return global.mockModels[name];
  }
  return require('../models/Schemas')[name];
};

module.exports = { connectDB, getModel };
