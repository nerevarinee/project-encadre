const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Department, PrintRequest } = require('./models');
const { validationResult } = require('express-validator'); // Import express-validator

// Register a new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', data: errors.array() });
    }

    const { name, email, password, role, department: departmentName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    let departmentId = null;
    if (role !== 'admin') {
      const department = await Department.findOne({ name: departmentName });
      if (!department) {
        return res.status(400).json({ success: false, message: 'Department not found', data: null });
      }
      departmentId = department._id;
    }

    const user = new User({ name, email, password: hashedPassword, role, department: departmentId });

    await user.save();
    res.status(201).json({ success: true, message: 'User registered', data: user });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already exists', data: null });
    }
    res.status(500).json({ success: false, message: 'Could not register user', data: error.message });
  }
};

// Login a user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', data: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', data: null }); // 401 Unauthorized
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Add expiry
    res.status(200).json({ success: true, message: 'Login successful', data: { token, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', data: error.message });
  }
};

// Get all users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, message: 'Users retrieved', data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve users', data: error.message });
  }
};

// Get a specific user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }
    res.status(200).json({ success: true, message: 'User retrieved', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve user', data: error.message });
  }
};

// Delete a user (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }
    res.status(200).json({ success: true, message: 'User deleted', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not delete user', data: error.message });
  }
};

// Create a department (Admin Only)
exports.createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', data: errors.array() });
    }

    const { name } = req.body;
    const department = new Department({ name });
    await department.save();
    res.status(201).json({ success: true, message: 'Department created', data: department });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Department name already exists', data: null });
    }
    res.status(500).json({ success: false, message: 'Could not create department', data: error.message });
  }
};

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json({ success: true, message: 'Departments retrieved', data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve departments', data: error.message });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found', data: null });
    }
    res.status(200).json({ success: true, message: 'Department deleted', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not delete department', data: error.message });
  }
};

// Create a print request (Teacher Only)
exports.createPrintRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', data: errors.array() });
    }

    const { copies, description } = req.body;
    const printRequest = new PrintRequest({
      teacher: req.user._id,
      department: req.user.department,
      copies,
      description,
    });
    await printRequest.save();
    res.status(201).json({ success: true, message: 'Print request created', data: printRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not create print request', data: error.message });
  }
};

// Get all print requests (Admin Only)
exports.getAllPrintRequests = async (req, res) => {
  try {
    const requests = await PrintRequest.find();
    res.status(200).json({ success: true, message: 'Print requests retrieved', data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve print requests', data: error.message });
  }
};

// Get a specific print request
exports.getPrintRequest = async (req, res) => {
  try {
    const request = await PrintRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Print request not found', data: null });
    }
    res.status(200).json({ success: true, message: 'Print request retrieved', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve print request', data: error.message });
  }
};

// Get print requests for a department (Dept Head Only)
exports.getDepartmentPrintRequests = async (req, res) => {
  try {
    const requests = await PrintRequest.find({ department: req.params.dept_id });
    res.status(200).json({ success: true, message: 'Department print requests retrieved', data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve department print requests', data: error.message });
  }
};

// Approve a print request (Dept Head Only)
exports.approvePrintRequest = async (req, res) => {
  try {
    const request = await PrintRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Print request not found', data: null });
    }
    request.status = 'approved';
    await request.save();
    res.status(200).json({ success: true, message: 'Print request approved', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not approve print request', data: error.message });
  }
};

// Mark print request as 'printing' (Printing Staff Only)
exports.processPrintRequest = async (req, res) => {
  try {
    const request = await PrintRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Print request not found', data: null });
    }
    request.status = 'printing';
    await request.save();
    res.status(200).json({ success: true, message: 'Print request marked as printing', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not process print request', data: error.message });
  }
};

// Mark print request as 'completed' (Printing Staff Only)
exports.completePrintRequest = async (req, res) => {
  try {
    const request = await PrintRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Print request not found', data: null });
    }
    request.status = 'completed';
    await request.save();
    res.status(200).json({ success: true, message: 'Print request completed', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not complete print request', data: error.message });
  }
};

// Get total number of print requests (Admin Only)
exports.getTotalPrintRequests = async (req, res) => {
  try {
    const count = await PrintRequest.countDocuments();
    res.status(200).json({ success: true, message: 'Total print requests count retrieved', data: { totalRequests: count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve total print requests count', data: error.message });
  }
};

// Get breakdown of requests by status (Admin Only)
exports.getRequestsByStatus = async (req, res) => {
  try {
    const stats = await PrintRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.status(200).json({ success: true, message: 'Print requests status retrieved', data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve print requests status', data: error.message });
  }
};

// Get department-specific statistics (Admin Only)
exports.getDepartmentStats = async (req, res) => {
  try {
    const stats = await PrintRequest.aggregate([
      { $match: { department: req.params.dept_id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.status(200).json({ success: true, message: 'Department print requests stats retrieved', data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not retrieve department print requests stats', data: error.message });
  }
};