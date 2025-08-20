import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
      maxlength: 12,
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true,
    },
    maxUses: {
      type: Number,
      default: 1, // one-time use unless specified
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hrs
    },
  },
  { timestamps: true }
);

// TTL index -> deletes invite code when expiresAt is reached
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual field for quick validity check
inviteSchema.virtual('isValid').get(function () {
  return this.isActive && this.usedCount < this.maxUses && this.expiresAt > new Date();
});

// utils method -> mark code as used
inviteSchema.methods.markUsed = async function () {
  this.usedCount += 1;
  if (this.usedCount >= this.maxUses) {
    this.isActive = false;
  }
  await this.save();
};

const Invite = mongoose.model('Invite', inviteSchema);
export default Invite;
