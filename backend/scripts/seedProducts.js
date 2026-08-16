const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { Product } = require("../models/Schemas");

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const filePath = path.join(__dirname, "../data/products.json");
    const products = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Remove custom _id
    const formattedProducts = products.map(({ _id, ...rest }) => rest);

    await Product.deleteMany({});
    await Product.insertMany(formattedProducts);

    console.log(`✅ ${formattedProducts.length} products inserted successfully!`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedProducts();