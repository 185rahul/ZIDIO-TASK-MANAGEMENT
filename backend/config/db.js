const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // This looks for the link you will put in your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Stops the server if the database can't connect
  }
};

module.exports = connectDB;