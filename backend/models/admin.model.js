import mongoose, { Mongoose } from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role:{
        
    }
  },
  { timestamps: true }
);
