const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getModel } = require("../config/db");
const { auth } = require("../middleware/auth");

// ==========================================
// 1. User Registration
// ==========================================
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const User = getModel("User");

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create customer account only
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ==========================================
// 2. User Login
// ==========================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const User = getModel("User");

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ==========================================
// 3. Get User Profile
// ==========================================
router.get("/profile", auth, async (req, res) => {
  try {
    const User = getModel("User");
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// ==========================================
// 4. Admin: Get Total Users
// ==========================================
router.get("/users", auth, async (req, res) => {
  try {
    const User = getModel("User");

    // Only admin can access
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({}, "-password");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ==========================================
// 5. Addresses Management
// ==========================================

// Get user addresses
router.get("/addresses", auth, async (req, res) => {
  try {
    const Address = getModel("Address");
    const addresses = await Address.find({ userId: req.user.id });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching addresses" });
  }
});

// Add address
router.post("/addresses", auth, async (req, res) => {
  const {
    fullName,
    street,
    city,
    state,
    postalCode,
    country,
    phone,
    isDefault,
  } = req.body;

  if (!fullName || !street || !city || !state || !postalCode || !phone) {
    return res.status(400).json({ message: "Missing required address fields" });
  }

  try {
    const Address = getModel("Address");

    // If setting as default, clear others
    if (isDefault) {
      const activeAddresses = await Address.find({ userId: req.user.id });
      for (const addr of activeAddresses) {
        if (addr.isDefault) {
          await Address.findByIdAndUpdate(addr._id, { isDefault: false });
        }
      }
    }

    const newAddress = await Address.create({
      userId: req.user.id,
      fullName,
      street,
      city,
      state,
      postalCode,
      country: country || "India",
      phone,
      isDefault: !!isDefault,
    });

    res.status(201).json(newAddress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error adding address" });
  }
});

// Delete address
router.delete("/addresses/:id", auth, async (req, res) => {
  try {
    const Address = getModel("Address");
    // Ensure owner
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    if (address.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await Address.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error deleting address" });
  }
});

module.exports = router;
