const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');
const { chatValidation } = require('../middleware/validator');

router.post('/explain', authMiddleware, aiController.explainResult);

router.post('/suggestion', authMiddleware, aiController.getSuggestion);

router.post('/chat', authMiddleware, chatValidation, aiController.chat);

router.post('/summarize-video', authMiddleware, aiController.summarizeVideo);

module.exports = router;
