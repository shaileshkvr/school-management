import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'parent'],
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
      minlength: 3,
    },
    profile: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
    },

    // Role-specific fields
    email: {
      type: String,
      required: function () {
        return this.role !== 'student' || this.grade > 5;
      },
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isClassInCharge: {
      type: Boolean,
      default: false,
      required: function () {
        return this.role === 'teacher';
      },
    },
    grade: {
      type: Number,
      min: 1,
      max: 12,
      required: function () {
        return this.role === 'student' || (this.role === 'teacher' && this.isClassInCharge);
      },
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
      required: function () {
        return this.role === 'student' || (this.role === 'teacher' && this.isClassInCharge);
      },
    },
    subjectSpecialization: {
      type: String,
      required: function () {
        return this.role === 'teacher';
      },
    },
    qualification: {
      type: String,
      required: function () {
        return this.role === 'teacher';
      },
    },
    admissionNumber: {
      type: String,
      required: function () {
        return this.role === 'student';
      },
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // points to parent
      required: function () {
        return this.role === 'student';
      },
    },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // points to student
      required: function () {
        return this.role === 'parent';
      },
    },

    // Verification & status
    documents: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      fullName: this.fullName,
      email: this.email || '',
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const User = mongoose.model('User', userSchema);
export default User;
