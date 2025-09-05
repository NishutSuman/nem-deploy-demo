const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderValue: { type: Number, required: true },
    productName: [{ type: String, required: true }],
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},{
    timestamps: true,
    versionKey: false,
    updatedAt: true
});

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;