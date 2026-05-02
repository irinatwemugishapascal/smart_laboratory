import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  BookOpen, 
  Calculator, 
  Sparkles,
  FlaskConical,
  Video,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { experimentAPI, aiAPI } from '../utils/api';
import { toast } from 'react-toastify';

const ExperimentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('theory');
  const [inputData, setInputData] = useState({});
  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetchExperiment();
  }, [id]);

  const fetchExperiment = async () => {
    try {
      const response = await experimentAPI.getById(id);
      setExperiment(response.data.experiment);
    } catch (error) {
      toast.error('Failed to load experiment');
      navigate('/experiments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputData({ ...inputData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const calculateResult = async () => {
    setCalculating(true);
    try {
      let calculationType = '';
      let data = {};

      switch (experiment.title) {
        case "Ohm's Law Verification":
          calculationType = 'ohms_law';
          data = { voltage: inputData.voltage, resistance: inputData.resistance };
          break;
        case "Series and Parallel Circuits":
          calculationType = inputData.configuration === 'series' ? 'series_resistance' : 'parallel_resistance';
          data = { resistors: inputData.resistors?.split(',').map(r => parseFloat(r.trim())) || [] };
          break;
        case "Newton's Second Law":
          calculationType = 'newtons_second_law';
          data = { mass: inputData.mass, force: inputData.force };
          break;
        case "Simple Pendulum":
          calculationType = 'pendulum_period';
          data = { length: inputData.length, gravity: inputData.gravity || 9.8 };
          break;
        case "Lens Formula Verification":
          calculationType = 'lens_formula';
          data = { 
            objectDistance: inputData.objectDistance, 
            imageDistance: inputData.imageDistance, 
            focalLength: inputData.focalLength 
          };
          break;
        case "Acid-Base Titration":
          calculationType = 'titration';
          data = { 
            concentration1: inputData.concentration1, 
            volume1: inputData.volume1, 
            concentration2: inputData.concentration2, 
            volume2: inputData.volume2 
          };
          break;
        case "Reaction Rates":
          calculationType = 'reaction_rate';
          data = { 
            initialConcentration: inputData.initialConcentration, 
            finalConcentration: inputData.finalConcentration, 
            time: inputData.time 
          };
          break;
        case "Osmosis in Potato Strips":
          calculationType = 'osmosis';
          data = { initialMass: inputData.initialMass, finalMass: inputData.finalMass };
          break;
        case "Microscope Observation of Cells":
          calculationType = 'magnification';
          data = { imageSize: inputData.imageSize, objectSize: inputData.objectSize };
          break;
        default:
          calculationType = 'ohms_law';
          data = { voltage: inputData.voltage || 10, resistance: inputData.resistance || 5 };
      }

      let response;
      if (experiment.subject === 'Physics') {
        response = await experimentAPI.calculatePhysics(calculationType, data);
      } else if (experiment.subject === 'Chemistry') {
        response = await experimentAPI.calculateChemistry(calculationType, data);
      } else {
        response = await experimentAPI.calculateBiology(calculationType, data);
      }

      setResult(response.data.result);
      toast.success('Calculation completed!');
    } catch (error) {
      toast.error('Calculation failed. Please check your inputs.');
    } finally {
      setCalculating(false);
    }
  };

  const getAiExplanation = async () => {
    if (!result) return;
    setLoadingAi(true);
    try {
      const response = await aiAPI.explainResult({
        experimentTitle: experiment.title,
        subject: experiment.subject,
        inputData,
        resultData: result
      });
      setAiExplanation(response.data.explanation);
    } catch (error) {
      toast.error('Failed to get AI explanation');
    } finally {
      setLoadingAi(false);
    }
  };

  const submitResult = async () => {
    if (!result) {
      toast.error('Please complete the calculation first');
      return;
    }
    
    try {
      const score = Math.min(100, Math.max(0, 70 + Math.random() * 30));
      await experimentAPI.submitResult({
        experimentId: id,
        inputData,
        resultData: result,
        score
      });
      toast.success('Experiment completed successfully!');
      navigate('/results');
    } catch (error) {
      toast.error('Failed to submit result');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderInputFields = () => {
    switch (experiment.title) {
      case "Ohm's Law Verification":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Voltage (V)</label>
              <input type="number" name="voltage" value={inputData.voltage || ''} onChange={handleInputChange} className="input-field" placeholder="e.g., 12" />
            </div>
            <div>
              <label className="label">Resistance (Ω)</label>
              <input type="number" name="resistance" value={inputData.resistance || ''} onChange={handleInputChange} className="input-field" placeholder="e.g., 4" />
            </div>
          </div>
        );
      case "Newton's Second Law":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Mass (kg)</label>
              <input type="number" name="mass" value={inputData.mass || ''} onChange={handleInputChange} className="input-field" placeholder="e.g., 2" />
            </div>
            <div>
              <label className="label">Force (N)</label>
              <input type="number" name="force" value={inputData.force || ''} onChange={handleInputChange} className="input-field" placeholder="e.g., 10" />
            </div>
          </div>
        );
      case "Simple Pendulum":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Length (m)</label>
              <input type="number" name="length" value={inputData.length || ''} onChange={handleInputChange} className="input-field" placeholder="e.g., 1" />
            </div>
            <div>
              <label className="label">Gravity (m/s²)</label>
              <input type="number" name="gravity" value={inputData.gravity || ''} onChange={handleInputChange} className="input-field" placeholder="9.8" />
            </div>
          </div>
        );
      case "Acid-Base Titration":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Acid Concentration (M)</label>
              <input type="number" name="concentration1" value={inputData.concentration1 || ''} onChange={handleInputChange} className="input-field" placeholder="e.g., 0.1" />
            </div>
            <div>
              <label className="label">Acid Volume (mL)</label>
              <input type="number" name="volume1" value={inputData.volume1 || ''} onChange={handleInputChange} className="input-field" placeholder="e.g., 25" />
            </div>
            <div>
              <label className="label">Base Volume (mL)</label>
              <input type="number" name="volume2" value={inputData.volume2 || ''} onChange={handleInputChange} className="input-field" placeholder="e.g., 20" />
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Input Value 1</label>
              <input type="number" name="value1" value={inputData.value1 || ''} onChange={handleInputChange} className="input-field" placeholder="Enter value" />
            </div>
            <div>
              <label className="label">Input Value 2</label>
              <input type="number" name="value2" value={inputData.value2 || ''} onChange={handleInputChange} className="input-field" placeholder="Enter value" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <button onClick={() => navigate('/experiments')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
        <ArrowLeft size={20} />
        Back to Experiments
      </button>

      {/* Title Section */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-xl ${
            experiment.subject === 'Physics' ? 'bg-amber-100 text-amber-600' :
            experiment.subject === 'Chemistry' ? 'bg-emerald-100 text-emerald-600' :
            'bg-violet-100 text-violet-600'
          }`}>
            <FlaskConical size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                experiment.subject === 'Physics' ? 'bg-amber-100 text-amber-800' :
                experiment.subject === 'Chemistry' ? 'bg-emerald-100 text-emerald-800' :
                'bg-violet-100 text-violet-800'
              }`}>
                {experiment.subject}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                experiment.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                experiment.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {experiment.difficulty}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{experiment.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{experiment.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['theory', 'procedure', 'calculator', 'videos'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {tab === 'theory' && <BookOpen size={16} className="inline mr-2" />}
            {tab === 'procedure' && <Play size={16} className="inline mr-2" />}
            {tab === 'calculator' && <Calculator size={16} className="inline mr-2" />}
            {tab === 'videos' && <Video size={16} className="inline mr-2" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'theory' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theory</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{experiment.theory}</p>
            {experiment.formula && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Formula:</p>
                <p className="text-lg font-mono text-primary-600">{experiment.formula}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'procedure' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Procedure</h3>
            <ol className="space-y-3">
              {experiment.procedure?.split('. ').filter(p => p).map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 pt-1">{step.trim().replace(/\.$/, '')}.</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Experiment Calculator</h3>
            
            {renderInputFields()}

            <button 
              onClick={calculateResult}
              disabled={calculating}
              className="btn-primary flex items-center gap-2"
            >
              {calculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator size={18} />
                  Calculate
                </>
              )}
            </button>

            {result && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                    <CheckCircle size={18} />
                    Results
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(result).map(([key, value]) => (
                      <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {typeof value === 'number' ? value.toFixed(4) : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={getAiExplanation}
                    disabled={loadingAi}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Sparkles size={18} />
                    {loadingAi ? 'Getting explanation...' : 'Get AI Explanation'}
                  </button>
                  <button 
                    onClick={submitResult}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Complete Experiment
                  </button>
                </div>

                {aiExplanation && (
                  <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-violet-800 dark:text-violet-300 mb-2 flex items-center gap-2">
                      <Sparkles size={18} />
                      AI Explanation
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{aiExplanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Tutorials</h3>
            {experiment.videos?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiment.videos.map((video) => (
                  <div key={video.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Video size={48} className="text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">{video.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 capitalize">{video.video_type}</p>
                      {video.duration && (
                        <p className="text-xs text-gray-400 mt-1">{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Video size={48} className="mx-auto mb-3 opacity-50" />
                <p>No videos available for this experiment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentDetail;
