const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    paymentId: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: Array, required: true },
    totalAmount: { type: Number, required: true, default: 0 }, // ✅ Default for COD orders
    paymentMethod: { type: String, required: true, enum: ["UPI", "Card", "QR Code", "Cash on Delivery"] },
    status: { type: String, default: "Pending", enum: ["Pending", "Completed", "Failed"] },
    date: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    trackingStatus: { type: String, default: "Processing", enum: ["Processing", "Shipped", "Delivered", "Cancelled"] }
});

module.exports = mongoose.model("Order", orderSchema);
