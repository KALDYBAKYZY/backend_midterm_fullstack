const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");
const Stock = require("../models/Stock");
const Transaction = require("../models/Transaction");


// 🔹 BUY STOCK
router.post("/buy", auth, async (req, res) => {
  try {
    const { stockId, quantity } = req.body;

    const user = await User.findById(req.userId);
    const stock = await Stock.findById(stockId);

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const totalPrice = stock.price * quantity;

    if (user.wallet < totalPrice) {
      return res.status(400).json({ message: "Недостаточно средств" });
    }

    // списываем деньги
    user.wallet -= totalPrice;
    await user.save();

    // создаём транзакцию
    const transaction = new Transaction({
      user: user._id,
      stock: stock._id,
      quantity,
      price: stock.price,
      type: "BUY"
    });

    await transaction.save();

    res.json({ message: "Куплено", transaction });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 SELL STOCK
router.post("/sell", auth, async (req, res) => {
  try {
    const { stockId, quantity } = req.body;

    const user = await User.findById(req.userId);
    const stock = await Stock.findById(stockId);

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    // считаем сколько у пользователя есть
    const transactions = await Transaction.find({
      user: user._id,
      stock: stock._id
    });

    let totalOwned = 0;

    transactions.forEach(t => {
      if (t.type === "BUY") totalOwned += t.quantity;
      if (t.type === "SELL") totalOwned -= t.quantity;
    });

    if (totalOwned < quantity) {
      return res.status(400).json({ message: "Недостаточно акций" });
    }

    const totalPrice = stock.price * quantity;

    // добавляем деньги
    user.wallet += totalPrice;
    await user.save();

    // записываем транзакцию
    const transaction = new Transaction({
      user: user._id,
      stock: stock._id,
      quantity,
      price: stock.price,
      type: "SELL"
    });

    await transaction.save();

    res.json({ message: "Продано", transaction });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;