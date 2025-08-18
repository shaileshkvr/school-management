import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const ALLOWED_ROLES = ['student', 'teacher', 'parent', 'admin'];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    adhar: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{12}$/, 'Aadhaar must be exactly 12 digits'],
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value) return true; // allow empty for parents
          const ageDiff = Date.now() - value.getTime();
          const age = new Date(ageDiff).getUTCFullYear() - 1970;
          return age > 5 && age < 60;
        },
        message: 'Enter a valid date of birth (age must be between 5 and 60).',
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Email only required if NOT student OR grade > 5
          if (!this.roles.includes('student') || this.grade > 5) {
            return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v || '');
          }
          return true;
        },
        message: 'Invalid email format',
      },
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    grade: {
      type: Number,
      min: 1,
      max: 12,
      required: function () {
        return this.roles.includes('student');
      },
    },
    roles: {
      type: [String],
      required: true,
      index: true,
      validate: {
        validator: function (roles) {
          if (!roles.length) return false;
          if (roles.includes('student') && roles.length > 1) return false;
          return roles.every((r) => ALLOWED_ROLES.includes(r));
        },
        message: 'Invalid role combination',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: (val) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val),
        message: 'Password must contain uppercase, lowercase, number, and special char',
      },
    },
    refreshToken: {
      type: String,
      select: false, // Don't return refreshToken by default
    },
  },
  { timestamps: true }
);

// Normalize roles before validation
userSchema.pre('validate', function (next) {
  if (this.roles && Array.isArray(this.roles)) {
    this.roles = [...new Set(this.roles.map((r) => r.toLowerCase().trim()))];
  }
  next();
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      roles: this.roles,
      fullName: this.fullName,
      email: this.email || '',
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate JWT Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const User = mongoose.model('User', userSchema);
