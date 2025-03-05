// routes.js (API Routes)
const express = require('express');
const { register, login, createPrintRequest, approvePrintRequest, processPrintRequest, completePrintRequest } = require('./controllers');
const { authMiddleware, roleMiddleware } = require('./middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/print-requests', authMiddleware, roleMiddleware('teacher'), createPrintRequest);
router.put('/print-requests/:id/approve', authMiddleware, roleMiddleware('department_head'), approvePrintRequest);
router.put('/print-requests/:id/process', authMiddleware, roleMiddleware('printing_staff'), processPrintRequest);
router.put('/print-requests/:id/complete', authMiddleware, roleMiddleware('printing_staff'), completePrintRequest);

module.exports = router;
