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

// Una sola configuración de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://time-swipe-frontend.onrender.com'],
  credentials: true
}));

// Resto de middleware
app.use(express.json());
app.use(cookieParser());

// Connect to the database
connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });

// Routes
app.use("/api/v1", authRouter);
app.use("/api/v1", profileRouter);
app.use("/api/v1", requestRouter);
app.use("/api/v1", userRouter);
app.use("/api/matches", matchRoutes);

app.get("/", (req, res) => {
  res.send("Coming Soon Home");
});
