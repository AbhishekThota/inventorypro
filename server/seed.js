/**
 * Seed script - run with: node server/seed.js
 * Creates demo user, categories, and products
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventorypro';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany()]);
  console.log('Cleared existing data');

  // Create demo user
  const user = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
  });
  console.log('Created demo user: admin@demo.com / password123');

  // Create categories
  const categories = await Category.insertMany([
    { name: 'Clothing', description: 'Apparel and fashion items', color: '#ec4899', createdBy: user._id },
    { name: 'Food & Beverage', description: 'Edible products and drinks', color: '#ef4444', createdBy: user._id },
  ]);
  console.log(`Created ${categories.length} categories`);

  const [clothing, food] = categories;

  // Create products
  const products = await Product.insertMany([
    { name: 'Men\'s Polo Shirt', sku: 'CLO-POLO-001', category: clothing._id, price: 1299.00, costPrice: 500, quantity: 120, lowStockThreshold: 20, unit: 'pcs', supplier: 'FashionCo', location: 'Rack C1', createdBy: user._id },
    { name: 'Slim Fit Jeans', sku: 'CLO-JEAN-001', category: clothing._id, price: 2499.00, costPrice: 1000, quantity: 85, lowStockThreshold: 15, unit: 'pcs', supplier: 'DenimPro', location: 'Rack C2', createdBy: user._id },
    { name: 'Winter Jacket', sku: 'CLO-JACK-001', category: clothing._id, price: 4999.00, costPrice: 2000, quantity: 7, lowStockThreshold: 10, unit: 'pcs', supplier: 'NorthStyle', location: 'Rack D1', createdBy: user._id },
    { name: 'Organic Coffee Beans (1kg)', sku: 'FNB-COF-001', category: food._id, price: 899.00, costPrice: 400, quantity: 200, lowStockThreshold: 30, unit: 'kg', supplier: 'BeanFarm', location: 'Storage G', createdBy: user._id },
    { name: 'Green Tea Pack (250g)', sku: 'FNB-TEA-001', category: food._id, price: 450.00, costPrice: 200, quantity: 0, lowStockThreshold: 20, unit: 'packs', supplier: 'TeaHouse', location: 'Storage G', createdBy: user._id },
    { name: 'Sparkling Water (12 Pk)', sku: 'FNB-WTR-001', category: food._id, price: 350.00, costPrice: 150, quantity: 50, lowStockThreshold: 10, unit: 'packs', supplier: 'AquaPure', location: 'Storage H', createdBy: user._id },
    { name: 'Cotton T-Shirt', sku: 'CLO-TSH-001', category: clothing._id, price: 599.00, costPrice: 250, quantity: 300, lowStockThreshold: 50, unit: 'pcs', supplier: 'FashionCo', location: 'Rack C3', createdBy: user._id },
  ]);
  console.log(`Created ${products.length} products`);

  console.log('\n✅ Seed complete!');
  console.log('Login: admin@demo.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
