

const mongoose = require("mongoose");

const getConnection = () => {
  try {
    // Validate MongoDB URL exists
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL not configured in environment variables");
    }

    // Mongoose connection options for better reliability
    const options = {
      // useNewUrlParser: true, // Deprecated in Mongoose 6+
      // useUnifiedTopology: true, // Deprecated in Mongoose 6+
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
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
        // In production, you might want to exit the process
        // process.exit(1);
      });

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 Mongoose connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    throw error;
  }
};

module.exports = getConnection

