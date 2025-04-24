const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const authMiddleware = require('./middleware');
const { body } = require('express-validator'); // Import express-validator
const { sendEmail } = require('./mailer');


// Validation middleware
const userValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['admin', 'teacher', 'dept_head', 'printing_staff']).withMessage('Invalid role'),
  body('department').optional().isMongoId().withMessage('Invalid department ID')
];

const loginValidationRules = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

const departmentValidationRules = [
  body('name').notEmpty().withMessage('Department name is required')
];

const printRequestValidationRules = [
  body('copies').isInt({ min: 1 }).withMessage('Copies must be at least 1'),
  body('description').notEmpty().withMessage('Description is required')
];

// Authentication Routes
router.post('/register', userValidationRules, controllers.register);
router.post('/login', loginValidationRules, controllers.login);

// User Management (Admin Only)
router.get('/users', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.getAllUsers);
router.get('/users/:id', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.getUserById);
router.delete('/users/:id', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.deleteUser);

// Department Management (Admin Only)
router.post('/departments', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), departmentValidationRules, controllers.createDepartment);
router.get('/departments', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.getDepartments);
router.delete('/departments/:id', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.deleteDepartment);

// Print Request Management
router.post('/print-requests', authMiddleware.authenticate, authMiddleware.verifyRole('teacher'), printRequestValidationRules, controllers.createPrintRequest);
router.get('/print-requests', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.getAllPrintRequests);
router.get('/print-requests/:id', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.getPrintRequest);
router.get('/print-requests/department/:dept_id', authMiddleware.authenticate, authMiddleware.verifyRole('dept_head'), controllers.getDepartmentPrintRequests);

// Approving & Processing Print Requests
router.put('/print-requests/:id/approve', authMiddleware.authenticate, authMiddleware.verifyRole('dept_head'), controllers.approvePrintRequest);
router.put('/print-requests/:id/process', authMiddleware.authenticate, authMiddleware.verifyRole('printing_staff'), controllers.processPrintRequest);
router.put('/print-requests/:id/complete', authMiddleware.authenticate, authMiddleware.verifyRole('printing_staff'), controllers.completePrintRequest);

// Dashboard & Statistics (Admin Only)
router.get('/stats/requests', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.getTotalPrintRequests);
router.get('/stats/requests/status', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.getRequestsByStatus);
router.get('/stats/requests/department/:dept_id', authMiddleware.authenticate, authMiddleware.verifyRole('admin'), controllers.getDepartmentStats);

module.exports = router;