const mongoose = require('mongoose');
const Product = require('./models/Product');
const products = require('./data/products.json');

async function seedData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shopzone');

    await Product.deleteMany(); // Optional: delete old products
    await Product.insertMany(products);

    console.log('✅ Products inserted!');
    process.exit();
  } catch (err) {
    console.error('❌ Error inserting products:', err);
    process.exit(1);
  }
}

seedData();
