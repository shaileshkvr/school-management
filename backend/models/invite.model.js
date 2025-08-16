import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
      maxlength: 12,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
    },
  },
  { timestamps: true }
);

inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Invite = mongoose.model('Invite', inviteSchema);
export default Invite;
