require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const matchRoutes = require("./routes/matchRoutes");
const PORT = process.env.PORT || 5000;

// 🔍 Log para verificar las variables de entorno cargadas
console.log("Variables de entorno disponibles:", Object.keys(process.env));
console.log("Valor de MONGO_URI:", process.env.MONGO_URI); // Debería imprimirse

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://time-swipe-frontend.onrender.com'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// 🔌 Intentar conectar con la BD
connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!", err);
  });

// Rutas
app.use("/api/v1", authRouter);
app.use("/api/v1", profileRouter);
app.use("/api/v1", requestRouter);
app.use("/api/v1", userRouter);
app.use("/api/matches", matchRoutes);

app.get("/", (req, res) => {
  res.send("Coming Soon Home");
});
