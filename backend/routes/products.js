const express = require("express");
const router = express.Router();
const { getModel } = require("../config/db");
const { auth, admin } = require("../middleware/auth");

// ==========================================
// 1. Get All Products (With Search and Filter)
// ==========================================
router.get("/", async (req, res) => {
  const { search, brand, category, minPrice, maxPrice, sort } = req.query;

  try {
    const Product = getModel("Product");
    let products = [];

    if (global.useMockDB) {
      // Mock manual filtering
      products = await Product.find();

      if (brand) {
        products = products.filter(
          (p) => p.brand.toLowerCase() === brand.toLowerCase(),
        );
      }
      if (category) {
        // e.g. "For Him", "For Her", "Kids", "Unisex"
        products = products.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase(),
        );
      }
      if (minPrice) {
        products = products.filter(
          (p) => (p.salePrice || p.price) >= parseFloat(minPrice),
        );
      }
      if (maxPrice) {
        products = products.filter(
          (p) => (p.salePrice || p.price) <= parseFloat(maxPrice),
        );
      }
      if (search) {
        const query = search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query),
        );
      }

      // Sort logic
      if (sort === "price_asc") {
        products.sort(
          (a, b) => (a.salePrice || a.price) - (b.salePrice || b.price),
        );
      } else if (sort === "price_desc") {
        products.sort(
          (a, b) => (b.salePrice || b.price) - (a.salePrice || a.price),
        );
      } else if (sort === "rating") {
        products.sort((a, b) => b.rating - a.rating);
      } else {
        // Default: newest first
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } else {
      // Mongoose DB queries
      let query = {};

      if (brand) {
        query.brand = { $regex: new RegExp(`^${brand}$`, "i") };
      }
      if (category) {
        query.category = { $regex: new RegExp(`^${category}$`, "i") };
      }
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
        ];
      }

      let findQuery = Product.find(query);

      // Sort Mongoose
      if (sort === "price_asc") {
        findQuery = findQuery.sort({ price: 1 });
      } else if (sort === "price_desc") {
        findQuery = findQuery.sort({ price: -1 });
      } else if (sort === "rating") {
        findQuery = findQuery.sort({ rating: -1 });
      } else {
        findQuery = findQuery.sort({ createdAt: -1 });
      }

      products = await findQuery;
    }

    res.json(products);
  } catch (err) {
    console.error("Fetch Products Error:", err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// ==========================================
// 2. Get Single Product by ID (and its reviews)
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const Product = getModel("Product");
    const Review = getModel("Review");

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Fetch reviews for this product
    const reviews = await Review.find({ productId: req.params.id });

    res.json({ product, reviews });
  } catch (err) {
    res.status(500).json({ message: "Error fetching product details" });
  }
});

// ==========================================
// 3. Admin: Add New Product
// ==========================================
router.post("/", auth, admin, async (req, res) => {
  const {
    name,
    description,
    brand,
    price,
    salePrice,
    inventory,
    sizes,
    colors,
    images,
    category,
    isFeatured,
    isBestSeller,
  } = req.body;

  if (!name || !description || !brand || !price || inventory === undefined) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    const Product = getModel("Product");
    const newProduct = await Product.create({
      name,
      description,
      brand,
      price: parseFloat(price),
      salePrice: salePrice ? parseFloat(salePrice) : null,
      inventory: parseInt(inventory),
      sizes: sizes || [7, 8, 9, 10, 11],
      colors: colors || ["Black", "White"],
      images:
        images && images.length
          ? images
          : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
      category: category || "Unisex",
      isFeatured: !!isFeatured,
      isBestSeller: !!isBestSeller,
    });

    if (req.io) {
      req.io.emit("product_catalog_updated", {
        message: `New shoe added: ${newProduct.name}`,
      });
    }

    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding product" });
  }
});

// ==========================================
// 4. Admin: Update Existing Product
// ==========================================
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const Product = getModel("Product");
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.io) {
      req.io.emit("product_catalog_updated", {
        message: `Product updated: ${updatedProduct.name}`,
      });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: "Error updating product" });
  }
});

// ==========================================
// 5. Admin: Delete Product
// ==========================================
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const Product = getModel("Product");
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.io) {
      req.io.emit("product_catalog_updated", {
        message: `Product removed: ${deleted.name}`,
      });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// ==========================================
// 6. User: Submit Product Review & Rating
// ==========================================
router.post("/:id/reviews", auth, async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res
      .status(400)
      .json({ message: "Please provide rating (1-5) and comment" });
  }

  try {
    const Product = getModel("Product");
    const Review = getModel("Review");
    const User = getModel("User");

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user.id);
    const userName = user ? user.name : "Verified Customer";
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId: req.params.id,
      userId: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }
    // Create review
    const newReview = await Review.create({
      productId: req.params.id,
      userId: req.user.id,
      userName,
      rating: parseInt(rating),
      comment,
    });

    // Recalculate average rating
    const allReviews = await Review.find({ productId: req.params.id });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / allReviews.length).toFixed(1));

    await Product.findByIdAndUpdate(req.params.id, {
      rating: avgRating,
      reviewCount: allReviews.length,
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).json({ message: "Error adding review" });
  }
});

module.exports = router;
