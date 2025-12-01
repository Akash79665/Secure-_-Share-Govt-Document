const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    // Mongoose connection options
    const options = {
      // useNewUrlParser and useUnifiedTopology are now default in Mongoose 6+
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`\n✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}\n`);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    console.error('\n❌ MongoDB Connection Failed!');
    console.error(`Error: ${error.message}\n`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 TIP: Make sure MongoDB is running on your system!');
      console.error('   Windows: Start MongoDB service from Services');
      console.error('   Mac: brew services start mongodb-community');
      console.error('   Linux: sudo systemctl start mongodb\n');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;