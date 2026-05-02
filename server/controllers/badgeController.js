const Badge = require('../models/Badge');
const User = require('../models/User');

exports.getAllBadges = async (req, res, next) => {
  try {
    const badges = await Badge.findAll();
    res.json({ badges });
  } catch (error) {
    next(error);
  }
};

exports.getUserBadges = async (req, res, next) => {
  try {
    const badges = await Badge.getUserBadges(req.user.id);
    res.json({ badges });
  } catch (error) {
    next(error);
  }
};

exports.getPublicUserBadges = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const badges = await Badge.getUserBadges(userId);
    res.json({ badges });
  } catch (error) {
    next(error);
  }
};

exports.awardBadge = async (req, res, next) => {
  try {
    const { userId, badgeId } = req.body;
    
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers can manually award badges' });
    }
    
    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    
    const awarded = await Badge.awardBadge(userId, badgeId);
    
    if (!awarded) {
      return res.status(400).json({ message: 'User already has this badge' });
    }
    
    res.json({
      message: 'Badge awarded successfully',
      badge
    });
  } catch (error) {
    next(error);
  }
};

exports.removeBadge = async (req, res, next) => {
  try {
    const { userId, badgeId } = req.body;
    
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers can remove badges' });
    }
    
    await Badge.removeBadge(userId, badgeId);
    
    res.json({
      message: 'Badge removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.createBadge = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create badges' });
    }
    
    const badge = await Badge.create(req.body);
    
    res.status(201).json({
      message: 'Badge created successfully',
      badge
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBadge = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update badges' });
    }
    
    const badge = await Badge.update(req.params.id, req.body);
    
    res.json({
      message: 'Badge updated successfully',
      badge
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBadge = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete badges' });
    }
    
    await Badge.delete(req.params.id);
    
    res.json({
      message: 'Badge deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
