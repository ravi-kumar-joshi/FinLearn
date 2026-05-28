const mongoose = require("mongoose");

const getConnection = () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL not configured in environment variables");
    }

    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
      family: 4,
    };

    mongoose
      .connect(process.env.MONGO_URL, options)
      .then((connection) => {
        console.log("✅ Database connected successfully");
        console.log(`💾 Database: ${connection.connection.name}`);
        console.log(`🌍 Host: ${connection.connection.host}`);
      })
      .catch((error) => {
        console.error("❌ Failed to connect to database:", error.message);
      });

    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected'); // loop nahi hoga ab
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 Connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    throw error;
  }
};

module.exports = getConnection;