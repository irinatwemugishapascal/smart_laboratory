const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { authMiddleware, authorize } = require('../middleware/auth');

router.get('/', badgeController.getAllBadges);

router.get('/my-badges', authMiddleware, badgeController.getUserBadges);

router.get('/user/:userId', authMiddleware, badgeController.getPublicUserBadges);

router.post('/award', authMiddleware, authorize(['teacher', 'admin']), badgeController.awardBadge);

router.post('/remove', authMiddleware, authorize(['teacher', 'admin']), badgeController.removeBadge);

router.post('/', authMiddleware, authorize(['admin']), badgeController.createBadge);

router.put('/:id', authMiddleware, authorize(['admin']), badgeController.updateBadge);

router.delete('/:id', authMiddleware, authorize(['admin']), badgeController.deleteBadge);

module.exports = router;
