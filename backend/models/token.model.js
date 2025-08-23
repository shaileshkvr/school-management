import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
      maxlength: 20, // longer for reset tokens if needed
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['invite', 'reset-password', 'verify-email'],
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: function () {
        return this.purpose === 'invite';
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return ['reset-password', 'verify-email'].includes(this.purpose);
      },
    },
    maxUses: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        const hrs = this.purpose === 'invite' ? 72 : 1; // 72 hours for invites, 1 hour varification/reset
        return new Date(Date.now() + hrs * 60 * 60 * 1000);
      },
    },
  },
  { timestamps: true }
);

// TTL cleanup
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for quick check
tokenSchema.virtual('isValid').get(function () {
  return this.usedCount < this.maxUses && this.expiresAt > new Date();
});

// Method to consume
tokenSchema.methods.consume = async function () {
  this.usedCount += 1;
  await this.save();
};

const Token = mongoose.model('Token', tokenSchema);
export default Token;
