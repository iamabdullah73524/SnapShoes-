import React from "react";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black text-brand-dark mb-8">
        About SnapShoes
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
        <p className="text-gray-600 leading-8">
          SnapShoes is a modern sneaker platform built for sneaker enthusiasts who
          value premium quality, comfort, and style. Our mission is to provide
          an effortless shopping experience with authentic footwear collections.
        </p>

        <p className="text-gray-600 leading-8">
          This project demonstrates a complete MERN Stack E-Commerce
          application featuring authentication, wishlist, cart management,
          order tracking, reviews, admin dashboard, and real-time updates.
        </p>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Why Choose SnapShoes?</h2>

          <ul className="space-y-3 text-gray-600 list-disc ml-6">
            <li>100% Authentic Products</li>
            <li>Fast Delivery</li>
            <li>Secure Checkout</li>
            <li>Easy Returns</li>
            <li>Premium Customer Support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}