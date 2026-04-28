require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const authRoutes = require("./routes/auth");
const stockRoutes = require("./routes/stocks");
const transactionRoutes = require("./routes/transactions");
const initWebSocket = require("./ws/ws_server");
const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://frontend-midterm-fullstack.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://frontend-midterm-fullstack.vercel.app");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("API + WS работает 🚀");
});
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB подключен"))
  .catch(err => console.log(err));
const server = http.createServer(app);
initWebSocket(server);
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server запущен на порту ${PORT}`);
});