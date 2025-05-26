const express = require("express");
const router = express.Router();
const controllers = require("./controllers");
const authMiddleware = require("./middleware");
const { body } = require("express-validator");
// Import express-validator

// --- (Keep User and Department validation rules) ---
const userValidationRules = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .isIn(["admin", "teacher", "dept_head", "printing_staff"])
    .withMessage("Invalid role"),
  // Make department optional only if role is admin, otherwise required
  body("department")
    .if(body('role').not().equals('admin')) // Apply only if role is NOT admin
    .isMongoId().withMessage("Valid Department ID is required for this role")
    .notEmpty().withMessage("Department ID cannot be empty for this role"), // Ensure it's not empty if provided
   body("department")
    .if(body('role').equals('admin')) // Apply only if role IS admin
    .optional({ checkFalsy: true }) // Allow it to be omitted or null/empty string for admin
    .isMongoId().withMessage("Invalid department ID format (if provided)")
];

const loginValidationRules = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];
const departmentValidationRules = [
  body("name").notEmpty().withMessage("Department name is required"),
];

const printRequestValidationRules = [
  body("copies").isInt({ min: 1 }).withMessage("Copies must be at least 1"),
  body("description").notEmpty().withMessage("Description is required"),
];


// --- Authentication Routes ---
router.post("/register", userValidationRules, controllers.register);
router.post("/login", loginValidationRules, controllers.login);


// --- User Management (Admin Only) ---
router.get(
  "/users",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"),
  controllers.getAllUsers
);
router.get(
  "/users/:id",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"), // Or potentially allow users to view their own profile
  controllers.getUserById
);
router.delete(
  "/users/:id",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"),
  controllers.deleteUser
);


// --- Department Management (Admin Only) ---
router.post(
  "/departments",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"),
  departmentValidationRules,
  controllers.createDepartment
);
router.get(
  "/departments",
  authMiddleware.authenticate,
  // Allow more roles to view departments? e.g., Admin, Dept Head?
  authMiddleware.verifyRole("admin", "dept_head"), // Example: Allow Admins and Dept Heads
  controllers.getDepartments
);
router.delete(
  "/departments/:id",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"),
  controllers.deleteDepartment
);


// ======================================
// --- Print Request Management ---
// ======================================

// Teacher: Create Request
router.post(
  "/print-requests",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("teacher"), // Only teachers can create
  printRequestValidationRules,
  controllers.createPrintRequest
);

router.get(
  "/print-requests/teacher",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("teacher"),
  controllers.getTeacherPrintRequests
);

// Department Head: Get PENDING requests for THEIR department
router.get(
  "/print-requests/pending/my-department", // New specific route
  authMiddleware.authenticate,
  authMiddleware.verifyRole("dept_head"), // Only Dept Heads
  controllers.getPendingDepartmentRequests // New controller
);

// Department Head: Approve a specific request in THEIR department
router.put(
  "/print-requests/:id/approve",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("dept_head"), // Only Dept Heads
  controllers.approvePrintRequest // Controller modified to check department and status
);

// Printing Staff: Get APPROVED and PRINTING requests (queue)
router.get(
  "/print-requests/queue", // New specific route for processing queue
  authMiddleware.authenticate,
  authMiddleware.verifyRole("printing_staff"), // Only Printing Staff
  controllers.getProcessQueueRequests // New controller
);

// Printing Staff: Mark request as 'printing'
router.put(
  "/print-requests/:id/process",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("printing_staff"), // Only Printing Staff
  controllers.processPrintRequest // Controller modified to check status
);

// Printing Staff: Mark request as 'completed'
router.put(
  "/print-requests/:id/complete",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("printing_staff"), // Only Printing Staff
  controllers.completePrintRequest // Controller modified to check status
);


// --- Admin / General Viewing ---

// Admin: Get ALL requests (any status, any department)
router.get(
  "/print-requests", // Keep the general GET route for Admin
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"), // Only Admin for the full list
  controllers.getAllPrintRequests
);

// Admin: Get a specific request by ID
router.get(
  "/print-requests/:id",
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"), // Primarily Admin, consider others if needed (see controller)
  controllers.getPrintRequest
);

// Dept Head: Get ALL requests for THEIR department (any status) - Optional route
// This might be useful for Dept Head dashboard overview
router.get(
  "/print-requests/department/my", // Example route
  authMiddleware.authenticate,
  authMiddleware.verifyRole("dept_head"),
  // Re-use getDepartmentPrintRequests but ensure it uses req.user.department
  // Or create a dedicated controller like getMyDepartmentRequests
   (req, res, next) => { // Small inline middleware to set params if needed by controller
      req.params.dept_id = req.user.department.toString(); // Ensure controller can get dept_id if it expects it in params
      next();
   },
  controllers.getDepartmentPrintRequests // Ensure this controller correctly uses req.user.department
);


// --- Statistics (Admin Only) ---
router.get(
  "/stats/requests/total", // More descriptive route
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"),
  controllers.getTotalPrintRequests
);
router.get(
  "/stats/requests/by-status", // More descriptive route
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"),
  controllers.getRequestsByStatus
);
router.get(
  "/stats/requests/by-department/:dept_id", // More descriptive route
  authMiddleware.authenticate,
  authMiddleware.verifyRole("admin"),
  controllers.getDepartmentStats
);

module.exports = router;
