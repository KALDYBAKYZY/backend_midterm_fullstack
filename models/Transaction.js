const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  stock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock"
  },
  quantity: Number,
  price: Number,
  type: {
    type: String, 
    enum: ["BUY", "SELL"]
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);