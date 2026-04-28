const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const Stock = require("../models/Stock");

let clients = [];

// функция для отправки всем
const broadcast = (data) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const initWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", async (ws, req) => {
    try {
      // 🔐 получаем token из protocol
      const token = req.headers["sec-websocket-protocol"];

      if (!token) {
        ws.close();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      ws.userId = decoded.userId;

      clients.push(ws);

      console.log("WS подключен:", ws.userId);

      ws.on("close", () => {
        clients = clients.filter(c => c !== ws);
      });

    } catch (err) {
      ws.close();
    }
  });

  // 🔥 имитация изменения цены каждые 5 сек
  setInterval(async () => {
    const stocks = await Stock.find();

    for (let stock of stocks) {
      // случайное изменение цены
      const change = (Math.random() * 10 - 5).toFixed(2);
      stock.price = Math.max(1, stock.price + Number(change));
      await stock.save();

      broadcast({
        type: "TICKER_UPDATE",
        payload: {
          stockId: stock._id,
          price: stock.price
        }
      });
    }
  }, 5000);
};

module.exports = initWebSocket;