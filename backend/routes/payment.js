const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const { auth } = require("../middleware/auth");
const { getModel } = require("../config/db");

console.log("Razorpay Key Loaded:", process.env.RAZORPAY_KEY_ID);
console.log("Razorpay Secret Loaded:", !!process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Test Order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid payment amount is required",
      });
    }

    const options = {
      amount: Math.round(amount * 100), // ₹ → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order",
    });
  }
});

// Verify Razorpay Payment
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      totalPrice,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    const crypto = require("crypto");

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    console.log("✅ Razorpay Payment Verified:", razorpay_payment_id);

    const Order = getModel("Order");

    const newOrder = await Order.create({
      userId: req.user.id,
      items,
      shippingAddress,
      totalPrice,
      paymentMethod: "Razorpay",
      paymentStatus: "Completed",
      status: "Pending",
      trackingHistory: [
        {
          status: "Pending",
          comment: "Payment successful and order placed.",
        },
      ],
    });

    console.log("✅ Paid Order Created:", newOrder._id);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Razorpay Payment Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify Razorpay payment",
    });
  }
});

module.exports = router;
