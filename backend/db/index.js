import mongoose from 'mongoose';
// import { DB_NAME } from "../constants.js";
// Replace with your actual DB_NAME constant
const DB_NAME = 'school-db';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
      // `${process.env.MONGODB_URI_OFFLINE}/projectDB`
    );
    console.log('MongoDB connected successfully to', connectionInstance.connection.host);
  } catch (error) {
    console.error('Error in connectDb: MongoDB connection FAILED:', error);
    process.exit(1);
  }
};

export default connectDB;