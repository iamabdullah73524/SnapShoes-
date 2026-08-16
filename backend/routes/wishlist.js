const express = require('express');
const router = express.Router();

const { User, Product } = require('../models/Schemas');
const { auth } = require('../middleware/auth');

// ==========================================
// GET USER WISHLIST
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json(user.wishlist || []);
  } catch (error) {
    console.error('Get wishlist error:', error);

    res.status(500).json({
      message: 'Failed to load wishlist'
    });
  }
});

// ==========================================
// ADD PRODUCT TO WISHLIST
// ==========================================
router.post('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check duplicate
    const alreadyExists = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyExists) {
      return res.status(400).json({
        message: 'Product already exists in wishlist'
      });
    }

    // Add product
    user.wishlist.push(productId);

    await user.save();

    // Return updated wishlist
    const updatedUser = await User.findById(req.user.id)
      .populate('wishlist');

    res.status(201).json(updatedUser.wishlist);
  } catch (error) {
    console.error('Add wishlist error:', error);

    res.status(500).json({
      message: 'Failed to add product to wishlist'
    });
  }
});

// ==========================================
// REMOVE PRODUCT FROM WISHLIST
// ==========================================
router.delete('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    const updatedUser = await User.findById(req.user.id)
      .populate('wishlist');

    res.json(updatedUser.wishlist);
  } catch (error) {
    console.error('Remove wishlist error:', error);

    res.status(500).json({
      message: 'Failed to remove product from wishlist'
    });
  }
});

// ==========================================
// CLEAR ENTIRE WISHLIST
// ==========================================
router.delete('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    user.wishlist = [];

    await user.save();

    res.json([]);
  } catch (error) {
    console.error('Clear wishlist error:', error);

    res.status(500).json({
      message: 'Failed to clear wishlist'
    });
  }
});

module.exports = router;