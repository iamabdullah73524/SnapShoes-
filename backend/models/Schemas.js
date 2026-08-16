const mongoose = require('mongoose');

// ==========================================
// 1. User Schema
// ==========================================
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // Wishlist
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 2. Product Schema
// ==========================================
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  brand: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null }, // for discounted products
  inventory: { type: Number, required: true, default: 0 },
  sizes: [{ type: Number }], // e.g. [7, 8, 9, 10, 11]
  colors: [{ type: String }], // e.g. ['Black', 'White', 'Pink']
  images: [{ type: String }], // Image URLs or filenames
  category: { type: String, default: 'Unisex' }, // For Him, For Her, Kids, Unisex
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 3. Address Schema
// ==========================================
const AddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

// ==========================================
// 4. Order Schema
// ==========================================
const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: Number, required: true },
    color: { type: String, required: true },
    image: { type: String }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered'], default: 'Pending' },
  trackingHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    comment: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 5. Review Schema
// ==========================================
const ReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ==========================================
// 6. Notification Schema
// ==========================================
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // 'admin' or specific User ID
  message: { type: String, required: true },
  type: { type: String, enum: ['OrderPlaced', 'StatusChange', 'General'], default: 'General' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Register and Export Models
module.exports = {
  User: mongoose.model('User', UserSchema),
  Product: mongoose.model('Product', ProductSchema),
  Address: mongoose.model('Address', AddressSchema),
  Order: mongoose.model('Order', OrderSchema),
  Review: mongoose.model('Review', ReviewSchema),
  Notification: mongoose.model('Notification', NotificationSchema)
};
