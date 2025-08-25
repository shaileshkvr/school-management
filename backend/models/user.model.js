import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const ALLOWED_ROLES = ['student', 'teacher', 'admin'];

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      minlength: [3, 'First name must be at least 3 characters'],
      maxlength: [20, 'First name cannot exceed 20 characters'],
      index: true,
    },
    lastName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
      required: true,
      minlength: [3, 'Full name must be at least 3 characters'],
      maxlength: [50, 'Full name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      immutable: true,
      index: true,
    },
    adhar: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{12}$/, 'Aadhaar must be exactly 12 digits'],
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: function () {
        return this.roles.includes('student');
      },
      validate: {
        validator: function (value) {
          if (!value) return true; // allow empty for teachers
          const ageDiff = Date.now() - value.getTime();
          const age = new Date(ageDiff).getUTCFullYear() - 1970;
          return age > 5 && age < 60;
        },
        message: 'Enter a valid date of birth (age must be between 5 and 60).',
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v || '');
        },
        message: 'Invalid email format',
      },
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''],
    },
    grade: {
      type: Number,
      min: 1,
      max: 12,
      required: function () {
        return this.roles.includes('student');
      },
      index: true,
    },
    roles: {
      type: [String],
      required: true,
      validate: {
        validator: function (roles) {
          if (!roles.length) return false;
          if (roles.includes('student') && roles.length > 1) return false;
          return roles.every((r) => ALLOWED_ROLES.includes(r));
        },
        message: 'Invalid role combination',
      },
      index: true,
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
      default: '',
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
userSchema.methods.comparePassword = async function (password) {
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

const User = mongoose.model('User', userSchema);
export default User;
