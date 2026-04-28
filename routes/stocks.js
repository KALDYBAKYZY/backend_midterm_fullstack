const express = require("express");
const router = express.Router();

const Stock = require("../models/Stock");
const auth = require("../middleware/auth");


// 🔹 CREATE STOCK (только авторизованный пользователь)
router.post("/", auth, async (req, res) => {
  try {
    const { ticker, price } = req.body;

    const existing = await Stock.findOne({ ticker });
    if (existing) {
      return res.status(400).json({ message: "Stock already exists" });
    }

    const stock = new Stock({
      ticker,
      price,
      owner: req.userId
    });

    await stock.save();

    res.json(stock);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 GET ALL STOCKS
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find().populate("owner", "email");
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 UPDATE PRICE (только владелец)
router.put("/:id", auth, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    if (stock.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Это не твоя акция" });
    }

    stock.price = req.body.price;
    await stock.save();

    res.json(stock);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;