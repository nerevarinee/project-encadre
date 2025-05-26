const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Department, PrintRequest } = require("./models");
const { validationResult } = require("express-validator"); // Import express-validator
const mongoose = require('mongoose'); // Make sure mongoose is imported

// --- (Keep existing functions like register, login, user management, department management) ---

// --- Print Request Controllers ---

// Create a print request (Teacher Only) - No change needed
exports.createPrintRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        data: errors.array(),
      });
    }

    const { copies, description } = req.body;
    // Ensure req.user exists and has a department
    if (!req.user || !req.user.department) {
      return res.status(400).json({ success: false, message: "User or user department not found.", data: null });
    }
    
    const printRequest = new PrintRequest({
      teacher: req.user._id,
      department: req.user.department, // Get department from logged-in teacher
      copies,
      description,
      // status defaults to 'pending' in the model
    });
    await printRequest.save();
    // Populate necessary fields for potential immediate display
    const populatedRequest = await PrintRequest.findById(printRequest._id)
        .populate('teacher', 'name')
        .populate('department', 'name');
        
    res.status(201).json({
      success: true,
      message: "Print request created",
      data: populatedRequest, // Send populated data
    });
  } catch (error) {
    console.error("Error creating print request:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not create print request",
      data: error.message,
    });
  }
};

// --- NEW: Get PENDING requests for a specific department (Dept Head Only) ---
exports.getPendingDepartmentRequests = async (req, res) => {
  try {
    // Ensure the logged-in user is a dept_head and has a department assigned
    if (!req.user || req.user.role !== 'dept_head' || !req.user.department) {
      return res.status(403).json({ success: false, message: "Access denied or user department not found.", data: null });
    }

    const departmentId = req.user.department;

    const requests = await PrintRequest.find({
      department: departmentId,
      status: 'pending' // Only fetch pending requests
    }).populate('teacher', 'name').populate('department', 'name'); // Populate details

    // Modified success response message
    res.status(200).json({
      success: true,
      message: "Pending department print requests retrieved",
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching pending department requests:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve pending department print requests",
      data: error.message,
    });
  }
};

exports.getTeacherPrintRequests = async (req, res) => {
  try {
    const requests = await PrintRequest.find({
      teacher: req.user._id
    }).populate('teacher', 'name').populate('department', 'name');
    
    res.status(200).json({
      success: true,
      message: "Teacher print requests retrieved",
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching teacher requests:", error);
    res.status(500).json({
      success: false,
      message: "Could not retrieve teacher print requests",
      data: error.message,
    });
  }
};

// Approve a print request (Dept Head Only) - Modified
exports.approvePrintRequest = async (req, res) => {
  try {
    // Ensure the logged-in user is a dept_head and has a department assigned
    if (!req.user || req.user.role !== 'dept_head' || !req.user.department) {
      return res.status(403).json({ success: false, message: "Access denied or user department not found.", data: null });
    }
    
    const requestId = req.params.id;
    const departmentId = req.user.department;

    // Find the request, ensure it's pending and belongs to the dept head's department
    const request = await PrintRequest.findOne({
        _id: requestId,
        department: departmentId, // Check if request belongs to the head's department
        status: 'pending' // Only approve pending requests
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Pending print request not found in your department or already processed",
        data: null,
      });
    }
    
    request.status = "approved";
    await request.save();
    
    // Populate details for the response
     const populatedRequest = await PrintRequest.findById(request._id)
        .populate('teacher', 'name')
        .populate('department', 'name');

    res.status(200).json({
      success: true,
      message: "Print request approved",
      data: populatedRequest, // Send populated data
    });
  } catch (error) {
    console.error("Error approving print request:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not approve print request",
      data: error.message,
    });
  }
};


// --- NEW: Get APPROVED and PRINTING requests (Printing Staff Only) ---
exports.getProcessQueueRequests = async (req, res) => {
  try {
    // Find requests that are either 'approved' or 'printing'
    const requests = await PrintRequest.find({
      status: { $in: ['approved', 'printing'] }
    }).populate('teacher', 'name').populate('department', 'name'); // Populate details

    res.status(200).json({
      success: true,
      message: "Print queue for processing retrieved",
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching processing queue:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve print processing queue",
      data: error.message,
    });
  }
};


// Mark print request as 'printing' (Printing Staff Only) - Modified
exports.processPrintRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Find the request and ensure it's 'approved'
    const request = await PrintRequest.findOne({
        _id: requestId,
        status: 'approved' // Can only process approved requests
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Approved print request not found or already processed",
        data: null,
      });
    }
    
    request.status = "printing";
    await request.save();
    
     // Populate details for the response
     const populatedRequest = await PrintRequest.findById(request._id)
        .populate('teacher', 'name')
        .populate('department', 'name');

    res.status(200).json({
      success: true,
      message: "Print request marked as printing",
      data: populatedRequest, // Send populated data
    });
  } catch (error) {
    console.error("Error processing print request:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not process print request",
      data: error.message,
    });
  }
};

// Mark print request as 'completed' (Printing Staff Only) - Modified
exports.completePrintRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Find the request and ensure it's 'printing'
    const request = await PrintRequest.findOne({
        _id: requestId,
        status: 'printing' // Can only complete printing requests
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Printing request not found or already completed",
        data: null,
      });
    }
    
    request.status = "completed";
    await request.save();
    
     // Populate details for the response
     const populatedRequest = await PrintRequest.findById(request._id)
        .populate('teacher', 'name')
        .populate('department', 'name');

    res.status(200).json({
      success: true,
      message: "Print request completed",
      data: populatedRequest, // Send populated data
    });
  } catch (error) {
    console.error("Error completing print request:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not complete print request",
      data: error.message,
    });
  }
};


// --- Admin / Other Request Retrieval ---

// Get ALL print requests (Admin Only) - No change needed
exports.getAllPrintRequests = async (req, res) => {
  try {
    const requests = await PrintRequest.find()
        .populate('teacher', 'name')
        .populate('department', 'name');
    res.status(200).json({
      success: true,
      message: "All print requests retrieved",
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching all print requests:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve all print requests",
      data: error.message,
    });
  }
};

// Get a specific print request (Admin or relevant Teacher/DeptHead) - Optional Enhancement
// You might want to enhance this so teachers/dept heads can view their own requests
exports.getPrintRequest = async (req, res) => {
  try {
    const request = await PrintRequest.findById(req.params.id)
        .populate('teacher', 'name')
        .populate('department', 'name');
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Print request not found",
        data: null,
      });
    }

    // Optional: Add role-based access check here if needed
    // e.g., if (req.user.role === 'teacher' && req.user._id.toString() !== request.teacher._id.toString()) { ... }
    // e.g., if (req.user.role === 'dept_head' && req.user.department.toString() !== request.department._id.toString()) { ... }

    res.status(200).json({
      success: true,
      message: "Print request retrieved",
      data: request,
    });
  } catch (error) {
    console.error("Error fetching single print request:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve print request",
      data: error.message,
    });
  }
};

// Get print requests for a department (Dept Head Only) - Kept for potential other uses, but approval uses the new specific one
exports.getDepartmentPrintRequests = async (req, res) => {
  try {
    // Ensure the logged-in user is a dept_head and has a department assigned
    if (!req.user || req.user.role !== 'dept_head' || !req.user.department) {
      return res.status(403).json({ success: false, message: "Access denied or user department not found.", data: null });
    }
    
    // Check if the requested dept_id matches the user's department
    // Note: req.params.dept_id might not be needed if we always use the logged-in user's dept
    if (req.params.dept_id !== req.user.department.toString()) {
        return res.status(403).json({ success: false, message: "Access denied to this department's requests.", data: null });
    }
    
    const requests = await PrintRequest.find({
      department: req.user.department // Use logged-in user's department
    }).populate('teacher', 'name').populate('department', 'name');
    res.status(200).json({
      success: true,
      message: "Department print requests retrieved",
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching department requests:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve department print requests",
      data: error.message,
    });
  }
};


// --- Statistics Functions (Keep as is, Admin Only) ---
// exports.getTotalPrintRequests = ...
// exports.getRequestsByStatus = ...
// exports.getDepartmentStats = ...

// --- (Ensure the corrected register function from the previous turn is included here) ---
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        data: errors.array(),
      });
    }

    const {
      name,
      email,
      password,
      role,
      department: departmentID, // Use departmentID from req.body
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    let departmentObjectId = null; // Use a different variable name

    if (role !== "admin") {
      if (!departmentID || !mongoose.Types.ObjectId.isValid(departmentID)) {
        return res.status(400).json({ success: false, message: "Valid Department ID is required for non-admin roles", data: null });
      }
      const department = await Department.findById(departmentID); // Correctly use departmentID
      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department not found for the provided ID", // Specific message
          data: null,
        });
      }
      departmentObjectId = department._id; // Assign the found ObjectId
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department: departmentObjectId, // Assign the ObjectId or null
    });
    await user.save();
     // Exclude password from the response data
    const userResponse = user.toObject();
    delete userResponse.password;

    res
      .status(201)
      .json({ success: true, message: "User registered", data: userResponse }); // Send user data without password
  } catch (error) {
    console.error("Error registering user:", error); // Log error
    if (error.code === 11000) { // Check for duplicate email
      return res
        .status(409) // Conflict status code
        .json({ success: false, message: "Email already exists", data: null });
    }
    res.status(500).json({
      success: false,
      message: "Could not register user",
      data: error.message,
    });
  }
};

// --- (Keep other existing functions like login, getAllUsers, getUserById, deleteUser, createDepartment, getDepartments, deleteDepartment etc.) ---
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        data: errors.array(),
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('department', 'name'); // Populate department on login
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials", data: null }); // 401 Unauthorized
    }
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        // Include department ID in token if user is not admin
        ...(user.role !== 'admin' && { department: user.department?._id }) 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Adjust expiry as needed
    ); // Add expiry
     // Prepare user data for response, exclude password
     const userResponse = {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email, // Include email
        // Include department details if applicable
        ...(user.role !== 'admin' && { 
            department: user.department ? { _id: user.department._id, name: user.department.name } : null
        })
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse, // Send sanitized user data
        token,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error); // Log error
    res
      .status(500)
      .json({ success: false, message: "Login failed", data: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").populate('department', 'name'); // Populate department
    res
      .status(200)
      .json({ success: true, message: "Users retrieved", data: users });
  } catch (error) {
    console.error("Error fetching all users:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve users",
      data: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate('department', 'name'); // Populate department
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", data: null });
    }
    res
      .status(200)
      .json({ success: true, message: "User retrieved", data: user });
  } catch (error) {
    console.error("Error fetching user by ID:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve user",
      data: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found", data: null });
    }
     // Optional: Add logic here to handle related data if needed (e.g., reassign department head)
    res
      .status(200)
      .json({ success: true, message: "User deleted", data: null });
  } catch (error) {
    console.error("Error deleting user:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not delete user",
      data: error.message,
    });
  }
};


exports.createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        data: errors.array(),
      });
    }

    const { name } = req.body;
    const department = new Department({ name });
    await department.save();
    res
      .status(201)
      .json({ success: true, message: "Department created", data: department });
  } catch (error) {
    console.error("Error creating department:", error); // Log error
    if (error.code === 11000) { // Check for duplicate name
      return res.status(409).json({ // Conflict
        success: false,
        message: "Department name already exists",
        data: null,
      });
    }
    res.status(500).json({
      success: false,
      message: "Could not create department",
      data: error.message,
    });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('head', 'name email'); // Populate head details
    res.status(200).json({
      success: true,
      message: "Departments retrieved",
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve departments",
      data: error.message,
    });
  }
};


exports.deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    // Optional: Check if department has users or requests before deleting
    const usersInDept = await User.countDocuments({ department: departmentId });
    const requestsInDept = await PrintRequest.countDocuments({ department: departmentId });

    if (usersInDept > 0 || requestsInDept > 0) {
        return res.status(400).json({ success: false, message: "Cannot delete department with assigned users or print requests.", data: null });
    }
    
    const department = await Department.findByIdAndDelete(departmentId);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found", data: null });
    }
    res
      .status(200)
      .json({ success: true, message: "Department deleted", data: null });
  } catch (error) {
    console.error("Error deleting department:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not delete department",
      data: error.message,
    });
  }
};

// --- Statistics Functions ---
exports.getTotalPrintRequests = async (req, res) => {
  try {
    const count = await PrintRequest.countDocuments();
    res.status(200).json({
      success: true,
      message: "Total print requests count retrieved",
      data: { totalRequests: count },
    });
  } catch (error) {
    console.error("Error fetching total requests count:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve total print requests count",
      data: error.message,
    });
  }
};

exports.getRequestsByStatus = async (req, res) => {
  try {
    const stats = await PrintRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } } // Optional: sort by status name
    ]);
    res.status(200).json({
      success: true,
      message: "Print requests status breakdown retrieved",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching requests by status:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve print requests status breakdown",
      data: error.message,
    });
  }
};

exports.getDepartmentStats = async (req, res) => {
  try {
    const departmentId = req.params.dept_id;
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({ success: false, message: "Invalid Department ID format", data: null });
    }
    
    const stats = await PrintRequest.aggregate([
      { $match: { department: new mongoose.Types.ObjectId(departmentId) } }, // Match by ObjectId
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } } // Optional: sort by status name
    ]);
    res.status(200).json({
      success: true,
      message: "Department print requests stats retrieved",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching department stats:", error); // Log error
    res.status(500).json({
      success: false,
      message: "Could not retrieve department print requests stats",
      data: error.message,
    });
  }
};
