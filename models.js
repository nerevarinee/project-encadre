const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'dept_head', 'printing_staff'], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: function() { return this.role !== 'admin'; } }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Department Schema
const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

const Department = mongoose.model('Department', DepartmentSchema);

// Print Request Schema
const PrintRequestSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  copies: { type: Number, required: true, min: 1 },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'printing', 'completed'], default: 'pending' }
}, { timestamps: true });

const PrintRequest = mongoose.model('PrintRequest', PrintRequestSchema);

module.exports = { User, Department, PrintRequest };
