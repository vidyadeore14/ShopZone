const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }],
  totalAmount: Number,
  trackingId: { type: String, required: true },         // ✅ Must be provided
  shippingAddress: {
    name: String,
    phone: String,
    address: String
  },
  status: { type: String, default: "Order Placed" },     // ✅ Status field
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
