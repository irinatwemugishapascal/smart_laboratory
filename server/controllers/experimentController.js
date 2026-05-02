const Experiment = require('../models/Experiment');
const User = require('../models/User');

exports.getAllExperiments = async (req, res, next) => {
  try {
    const { subject, difficulty } = req.query;
    const experiments = await Experiment.findAll(subject, difficulty);
    res.json({ experiments });
  } catch (error) {
    next(error);
  }
};

exports.getExperimentById = async (req, res, next) => {
  try {
    const experiment = await Experiment.findById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }
    
    const videos = await Experiment.getVideos(req.params.id);
    
    res.json({ 
      experiment: {
        ...experiment,
        videos
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getVideos = async (req, res, next) => {
  try {
    const { subject } = req.query;
    const videos = await Experiment.getAllVideos(subject);
    res.json({ videos });
  } catch (error) {
    next(error);
  }
};

exports.getChemicals = async (req, res, next) => {
  try {
    const { category } = req.query;
    const chemicals = await Experiment.getChemicals(category);
    res.json({ chemicals });
  } catch (error) {
    next(error);
  }
};

exports.simulateReaction = async (req, res, next) => {
  try {
    const { chemical1, chemical2 } = req.body;
    
    const reaction = await Experiment.getChemicalReaction(chemical1, chemical2);
    
    if (!reaction) {
      return res.json({
        reaction: {
          occurs: false,
          message: 'No significant reaction occurs between these chemicals under normal conditions.'
        }
      });
    }
    
    res.json({
      reaction: {
        occurs: true,
        ...reaction
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.submitResult = async (req, res, next) => {
  try {
    const { experimentId, inputData, resultData, score } = req.body;
    const userId = req.user.id;

    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found' });
    }

    const resultId = await Experiment.createResult(userId, experimentId, inputData, resultData, score);
    
    await User.incrementExperiments(userId);
    await User.updateAverageScore(userId);
    
    const progress = await calculateUserProgress(userId);
    await User.updateProgress(userId, progress);
    
    const newBadges = await User.checkAndAwardBadges(userId);
    
    res.status(201).json({
      message: 'Experiment completed successfully',
      resultId,
      newBadges,
      progress
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserResults = async (req, res, next) => {
  try {
    const results = await Experiment.getUserResults(req.user.id);
    res.json({ results });
  } catch (error) {
    next(error);
  }
};

exports.getResultById = async (req, res, next) => {
  try {
    const result = await Experiment.getResultById(req.params.id, req.user.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

exports.getSubjectStats = async (req, res, next) => {
  try {
    const stats = await Experiment.getSubjectStats(req.user.id);
    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

exports.getProgressOverTime = async (req, res, next) => {
  try {
    const progress = await Experiment.getProgressOverTime(req.user.id);
    res.json({ progress });
  } catch (error) {
    next(error);
  }
};

exports.calculatePhysics = async (req, res, next) => {
  try {
    const { type, data } = req.body;
    let result;
    
    switch (type) {
      case 'ohms_law':
        result = await Experiment.calculateOhmsLaw(data.voltage, data.resistance);
        break;
      case 'series_resistance':
        result = await Experiment.calculateSeriesResistance(data.resistors);
        break;
      case 'parallel_resistance':
        result = await Experiment.calculateParallelResistance(data.resistors);
        break;
      case 'newtons_second_law':
        result = await Experiment.calculateNewtonSecondLaw(data.mass, data.force);
        break;
      case 'pendulum_period':
        result = await Experiment.calculatePendulumPeriod(data.length, data.gravity);
        break;
      case 'lens_formula':
        result = await Experiment.calculateLensFormula(data.objectDistance, data.imageDistance, data.focalLength);
        break;
      default:
        return res.status(400).json({ message: 'Unknown calculation type' });
    }
    
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

exports.calculateChemistry = async (req, res, next) => {
  try {
    const { type, data } = req.body;
    let result;
    
    switch (type) {
      case 'titration':
        result = await Experiment.calculateTitration(data.concentration1, data.volume1, data.concentration2, data.volume2);
        break;
      case 'reaction_rate':
        result = await Experiment.calculateReactionRate(data.initialConcentration, data.finalConcentration, data.time);
        break;
      default:
        return res.status(400).json({ message: 'Unknown calculation type' });
    }
    
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

exports.calculateBiology = async (req, res, next) => {
  try {
    const { type, data } = req.body;
    let result;
    
    switch (type) {
      case 'osmosis':
        result = await Experiment.calculateOsmosis(data.initialMass, data.finalMass);
        break;
      case 'magnification':
        result = await Experiment.calculateMagnification(data.imageSize, data.objectSize);
        break;
      default:
        return res.status(400).json({ message: 'Unknown calculation type' });
    }
    
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

const calculateUserProgress = async (userId) => {
  const totalExperiments = 18;
  const user = await User.findById(userId);
  const progress = Math.min(Math.round((user.total_experiments / totalExperiments) * 100), 100);
  return progress;
};
