// controllers.js (Business Logic)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Department, PrintRequest } = require('./models');

exports.register = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role, department });
  await user.save();
  res.json({ msg: 'User registered' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ msg: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ 
    token,
    role: user.role,
   });
};

exports.createPrintRequest = async (req, res) => {
  const { copies, description } = req.body;
  const printRequest = new PrintRequest({
    teacher: req.user._id,
    department: req.user.department,
    copies,
    description
  });
  await printRequest.save();
  res.json(printRequest);
};

exports.approvePrintRequest = async (req, res) => {
  const printRequest = await PrintRequest.findById(req.params.id);
  printRequest.status = 'approved';
  await printRequest.save();
  res.json(printRequest);
};

exports.processPrintRequest = async (req, res) => {
  const printRequest = await PrintRequest.findById(req.params.id);
  printRequest.status = 'printing';
  await printRequest.save();
  res.json(printRequest);
};

exports.completePrintRequest = async (req, res) => {
  const printRequest = await PrintRequest.findById(req.params.id);
  printRequest.status = 'completed';
  await printRequest.save();
  res.json(printRequest);
};