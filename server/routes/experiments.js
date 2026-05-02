const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experimentController');
const { authMiddleware } = require('../middleware/auth');
const { resultValidation } = require('../middleware/validator');

router.get('/', authMiddleware, experimentController.getAllExperiments);

router.get('/videos', authMiddleware, experimentController.getVideos);

router.get('/chemicals', authMiddleware, experimentController.getChemicals);

router.post('/simulate-reaction', authMiddleware, experimentController.simulateReaction);

router.post('/calculate/physics', authMiddleware, experimentController.calculatePhysics);

router.post('/calculate/chemistry', authMiddleware, experimentController.calculateChemistry);

router.post('/calculate/biology', authMiddleware, experimentController.calculateBiology);

router.get('/results', authMiddleware, experimentController.getUserResults);

router.get('/results/:id', authMiddleware, experimentController.getResultById);

router.post('/submit', authMiddleware, resultValidation, experimentController.submitResult);

router.get('/stats/subjects', authMiddleware, experimentController.getSubjectStats);

router.get('/progress/timeline', authMiddleware, experimentController.getProgressOverTime);

router.get('/:id', authMiddleware, experimentController.getExperimentById);

module.exports = router;
