const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, authorize } = require('../middleware/auth');

router.get('/student', authMiddleware, authorize(['student']), dashboardController.getStudentDashboard);

router.get('/teacher', authMiddleware, authorize(['teacher', 'admin']), dashboardController.getTeacherDashboard);

router.get('/leaderboard', authMiddleware, dashboardController.getLeaderboard);

module.exports = router;
