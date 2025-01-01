const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleAuth');
const settingsController = require('../controllers/settingsController');

// Hospital Settings Routes
router.get('/hospital', authMiddleware, settingsController.getHospitalSettings);
router.put('/hospital', authMiddleware, authorizeRoles('admin'), settingsController.updateHospitalSettings);

// Department Routes
router.get('/departments', authMiddleware, settingsController.getDepartments);
router.post('/departments', authMiddleware, authorizeRoles('admin'), settingsController.createDepartment);
router.put('/departments/:id', authMiddleware, authorizeRoles('admin'), settingsController.updateDepartment);
router.delete('/departments/:id', authMiddleware, authorizeRoles('admin'), settingsController.deleteDepartment);

// User Preferences Routes
router.get('/preferences', authMiddleware, settingsController.getUserPreferences);
router.put('/preferences', authMiddleware, settingsController.updateUserPreferences);

// Theme Settings Routes
router.get('/theme', authMiddleware, settingsController.getThemeSettings);
router.put('/theme', authMiddleware, settingsController.updateThemeSettings);

// Integration Routes
router.get('/integrations', authMiddleware, authorizeRoles('admin'), settingsController.getIntegrationSettings);
router.put('/integrations', authMiddleware, authorizeRoles('admin'), settingsController.updateIntegrationSettings);

// Test Integration Routes
router.post('/integrations/test/email', authMiddleware, authorizeRoles('admin'), settingsController.testEmailIntegration);
router.post('/integrations/test/sms', authMiddleware, authorizeRoles('admin'), settingsController.testSmsIntegration);
router.post('/integrations/test/payment', authMiddleware, authorizeRoles('admin'), settingsController.testPaymentIntegration);

module.exports = router; 