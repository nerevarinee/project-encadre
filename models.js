// models.js (Mongoose schemas)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'department_head', 'printing_staff'] },
  department: { type: Schema.Types.ObjectId, ref: 'Department', default: null }
});

const departmentSchema = new Schema({ name: String });

const printRequestSchema = new Schema({
  teacher: { type: Schema.Types.ObjectId, ref: 'User' },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  status: { type: String, enum: ['pending', 'approved', 'printing', 'completed'], default: 'pending' },
  copies: Number,
  description: String
});

const User = mongoose.model('User', userSchema);
const Department = mongoose.model('Department', departmentSchema);
const PrintRequest = mongoose.model('PrintRequest', printRequestSchema);

module.exports = { User, Department, PrintRequest };
