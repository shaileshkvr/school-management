import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      minLength: 8,
      maxLength: 12,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 72 * 60 * 60 * 1000),
    },
    maxUses: {
      type: Number,
      default: 1, // one-time use by default
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// expire after time
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// pre-save validator to auto-expire if max uses hit
inviteSchema.pre("save", function (next) {
  if (this.usedCount >= this.maxUses) {
    this.isValid = false;
  }
  next();
});

const Invite = mongoose.model("Invite", inviteSchema);
export default Invite;
