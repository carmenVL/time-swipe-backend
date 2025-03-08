const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("La variable de entorno MONGO_URI no está definida");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // Usa IPv4
    });

    console.log("MongoDB connected");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Sale del proceso si hay un error
  }
};

module.exports = connectDB;
