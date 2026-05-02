import React, { useState, useEffect } from 'react';
import { Beaker, FlaskRound, AlertTriangle, RotateCcw, Sparkles, Play, X } from 'lucide-react';
import { experimentAPI, aiAPI } from '../utils/api';
import { toast } from 'react-toastify';

const VirtualChemistryLab = () => {
  const [chemicals, setChemicals] = useState([]);
  const [selectedChemicals, setSelectedChemicals] = useState([]);
  const [reaction, setReaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [showAiExplanation, setShowAiExplanation] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [animationState, setAnimationState] = useState('idle');

  useEffect(() => {
    fetchChemicals();
  }, [categoryFilter]);

  const fetchChemicals = async () => {
    try {
      const response = await experimentAPI.getChemicals(categoryFilter || undefined);
      setChemicals(response.data.chemicals);
    } catch (error) {
      toast.error('Failed to load chemicals');
    }
  };

  const addChemical = (chemical) => {
    if (selectedChemicals.length < 2 && !selectedChemicals.find(c => c.id === chemical.id)) {
      setSelectedChemicals([...selectedChemicals, chemical]);
      setReaction(null);
      setAiExplanation('');
    }
  };

  const removeChemical = (index) => {
    const newChemicals = selectedChemicals.filter((_, i) => i !== index);
    setSelectedChemicals(newChemicals);
    setReaction(null);
    setAiExplanation('');
  };

  const clearAll = () => {
    setSelectedChemicals([]);
    setReaction(null);
    setAiExplanation('');
    setAnimationState('idle');
  };

  const runReaction = async () => {
    if (selectedChemicals.length !== 2) {
      toast.error('Please select exactly 2 chemicals');
      return;
    }

    setLoading(true);
    setAnimationState('mixing');

    try {
      const response = await experimentAPI.simulateReaction(
        selectedChemicals[0].name,
        selectedChemicals[1].name
      );

      setTimeout(() => {
        setReaction(response.data.reaction);
        setAnimationState('complete');
        
        if (response.data.reaction.occurs) {
          toast.success('Reaction occurred!');
        } else {
          toast.info('No significant reaction under normal conditions');
        }
      }, 1500);
    } catch (error) {
      toast.error('Failed to simulate reaction');
      setAnimationState('idle');
    } finally {
      setLoading(false);
    }
  };

  const getAiExplanation = async () => {
    if (!reaction?.occurs) return;
    
    try {
      const prompt = `Explain the chemical reaction between ${selectedChemicals[0].name} and ${selectedChemicals[1].name}. 
      Reaction equation: ${reaction.equation}. 
      Explain in simple terms why this reaction occurs and its real-world applications.`;
      
      const response = await aiAPI.chat(prompt);
      setAiExplanation(response.data.reply);
      setShowAiExplanation(true);
    } catch (error) {
      setAiExplanation(`When ${selectedChemicals[0].name} reacts with ${selectedChemicals[1].name}, the following reaction occurs:

${reaction.equation}

This is an important reaction in chemistry with various real-world applications including industrial processes and laboratory demonstrations.`);
      setShowAiExplanation(true);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'acid': return 'bg-red-100 text-red-800 border-red-200';
      case 'base': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'salt': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'metal': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'indicator': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReactionColor = () => {
    if (!reaction?.occurs) return 'bg-gray-200';
    if (reaction.color_change?.includes('blue')) return 'bg-blue-400';
    if (reaction.color_change?.includes('red') || reaction.color_change?.includes('brown')) return 'bg-red-400';
    if (reaction.color_change?.includes('yellow')) return 'bg-yellow-400';
    if (reaction.color_change?.includes('green')) return 'bg-green-400';
    if (reaction.color_change?.includes('white')) return 'bg-gray-100';
    return 'bg-teal-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Virtual Chemistry Laboratory</h1>
        <p className="text-gray-500 dark:text-gray-400">Mix chemicals and observe reactions safely</p>
      </div>

      {/* Safety Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Safety Notice:</strong> This is a virtual simulation. In a real laboratory, always wear safety goggles and gloves. 
          Never mix chemicals without proper supervision and safety equipment.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chemical Shelf */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FlaskRound size={20} className="text-science-chemistry" />
              Chemical Shelf
            </h3>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field w-40 text-sm"
            >
              <option value="">All Categories</option>
              <option value="acid">Acids</option>
              <option value="base">Bases</option>
              <option value="salt">Salts</option>
              <option value="metal">Metals</option>
              <option value="indicator">Indicators</option>
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {chemicals.map((chemical) => (
              <button
                key={chemical.id}
                onClick={() => addChemical(chemical)}
                disabled={selectedChemicals.length >= 2 || selectedChemicals.find(c => c.id === chemical.id)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedChemicals.find(c => c.id === chemical.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : getCategoryColor(chemical.category)
                } ${selectedChemicals.length >= 2 && !selectedChemicals.find(c => c.id === chemical.id) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
              >
                <p className="font-medium text-sm truncate">{chemical.name}</p>
                <p className="text-xs opacity-75">{chemical.formula}</p>
                <span className="text-xs capitalize opacity-60">{chemical.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Experiment Area */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Experiment Area</h3>
            <button onClick={clearAll} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <RotateCcw size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Beaker Visualization */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-4 min-h-[200px] flex flex-col items-center justify-center">
            {selectedChemicals.length === 0 ? (
              <div className="text-center text-gray-400">
                <Beaker size={48} className="mx-auto mb-2" />
                <p>Select chemicals to begin</p>
              </div>
            ) : (
              <div className="relative">
                {/* Beaker Container */}
                <div className={`w-32 h-40 border-4 border-gray-300 rounded-b-3xl relative overflow-hidden bg-white/20 backdrop-blur-sm transition-all duration-1000 ${animationState === 'mixing' ? 'animate-pulse' : ''}`}>
                  {/* Liquid */}
                  {selectedChemicals.length > 0 && (
                    <div 
                      className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${
                        animationState === 'complete' && reaction?.occurs
                          ? getReactionColor()
                          : animationState === 'mixing'
                          ? 'bg-gradient-to-t from-blue-300 to-purple-300 animate-pulse'
                          : selectedChemicals.length === 1
                          ? 'bg-blue-300'
                          : 'bg-gradient-to-t from-blue-300 to-green-300'
                      }`}
                      style={{ 
                        height: animationState === 'mixing' ? '90%' : `${selectedChemicals.length * 35}%`,
                      }}
                    >
                      {/* Bubbles during reaction */}
                      {animationState === 'mixing' && (
                        <div className="absolute inset-0 overflow-hidden">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-3 h-3 bg-white/50 rounded-full animate-bubble"
                              style={{
                                left: `${20 + i * 15}%`,
                                animationDelay: `${i * 0.2}s`,
                                bottom: '0'
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Precipitate */}
                      {reaction?.precipitate && reaction.occurs && (
                        <div className="absolute bottom-2 left-1/4 right-1/4 h-4 bg-white/60 rounded-full animate-precipitate" />
                      )}
                    </div>
                  )}

                  {/* Measurement Lines */}
                  <div className="absolute left-0 right-0 top-1/4 border-t border-gray-300/50" />
                  <div className="absolute left-0 right-0 top-2/4 border-t border-gray-300/50" />
                  <div className="absolute left-0 right-0 top-3/4 border-t border-gray-300/50" />
                </div>

                {/* Chemical Labels */}
                <div className="flex gap-2 mt-4 justify-center flex-wrap">
                  {selectedChemicals.map((chem, index) => (
                    <div 
                      key={chem.id}
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{chem.name}</span>
                      <button onClick={() => removeChemical(index)} className="text-gray-500 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Run Button */}
          <button
            onClick={runReaction}
            disabled={selectedChemicals.length !== 2 || loading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mixing...
              </>
            ) : (
              <>
                <Play size={18} />
                Run Reaction
              </>
            )}
          </button>
        </div>
      </div>

      {/* Reaction Results */}
      {reaction && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reaction Results</h3>
          
          {!reaction.occurs ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {reaction.message || 'No significant reaction occurs between these chemicals under normal conditions.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Chemical Equation</p>
                  <p className="font-mono text-primary-600 font-medium">{reaction.equation}</p>
                </div>

                {reaction.product1 && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Products</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {reaction.product1}
                      {reaction.product2 && ` + ${reaction.product2}`}
                      {reaction.product3 && ` + ${reaction.product3}`}
                    </p>
                  </div>
                )}

                {reaction.color_change && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Color Change</p>
                    <p className="font-medium text-gray-900 dark:text-white">{reaction.color_change}</p>
                  </div>
                )}

                {reaction.precipitate && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Precipitate</p>
                    <p className="font-medium text-gray-900 dark:text-white">{reaction.precipitate}</p>
                  </div>
                )}

                {reaction.gas_produced && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Gas Produced</p>
                    <p className="font-medium text-gray-900 dark:text-white">{reaction.gas_produced}</p>
                  </div>
                )}

                {reaction.temperature_change && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Temperature Change</p>
                    <p className="font-medium text-gray-900 dark:text-white">{reaction.temperature_change}</p>
                  </div>
                )}

                {reaction.ph_change && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">pH Change</p>
                    <p className="font-medium text-gray-900 dark:text-white">{reaction.ph_change}</p>
                  </div>
                )}
              </div>

              {reaction.safety_warning && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-300">Safety Warning</p>
                    <p className="text-sm text-red-700 dark:text-red-400">{reaction.safety_warning}</p>
                  </div>
                </div>
              )}

              <button
                onClick={getAiExplanation}
                className="btn-secondary flex items-center gap-2"
              >
                <Sparkles size={18} />
                Get AI Explanation
              </button>

              {showAiExplanation && aiExplanation && (
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
    </div>
  );
};

export default VirtualChemistryLab;
