require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

// routes
const authRoutes = require("./routes/auth");
const stockRoutes = require("./routes/stocks");
const transactionRoutes = require("./routes/transactions");

// websocket
const initWebSocket = require("./ws/ws_server");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://frontend-midterm-fullstack.vercel.app"
  ],
  credentials: true
})); 

// routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/transactions", transactionRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API + WS работает 🚀");
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB подключен"))
  .catch(err => console.log(err));

// создаём HTTP сервер
const server = http.createServer(app);

// подключаем WebSocket
initWebSocket(server);

// запуск
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server запущен на порту ${PORT}`);
});