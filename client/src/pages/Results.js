import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Calendar, 
  ArrowRight, 
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { experimentAPI, aiAPI } from '../utils/api';
import { toast } from 'react-toastify';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedResult, setExpandedResult] = useState(null);
  const [aiExplanations, setAiExplanations] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await experimentAPI.getResults();
      setResults(response.data.results);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getAiExplanation = async (result) => {
    if (aiExplanations[result.id]) {
      setExpandedResult(expandedResult === result.id ? null : result.id);
      return;
    }

    try {
      const response = await aiAPI.explainResult({
        experimentTitle: result.title,
        subject: result.subject,
        inputData: JSON.parse(result.input_data || '{}'),
        resultData: JSON.parse(result.result_data || '{}')
      });
      
      setAiExplanations({ ...aiExplanations, [result.id]: response.data.explanation });
      setExpandedResult(result.id);
    } catch (error) {
      toast.error('Failed to get AI explanation');
    }
  };

  const exportResult = (result) => {
    const data = {
      experiment: result.title,
      subject: result.subject,
      date: result.completed_at,
      score: result.score,
      inputs: JSON.parse(result.input_data || '{}'),
      results: JSON.parse(result.result_data || '{}')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-${result.id}-result.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Result exported successfully');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case 'Physics': return '⚡';
      case 'Chemistry': return '⚗️';
      case 'Biology': return '🧬';
      default: return '🔬';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Results</h1>
        <p className="text-gray-500 dark:text-gray-400">View your completed experiments and scores</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Experiments</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Average Score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {results.length > 0 
              ? (results.reduce((sum, r) => sum + parseFloat(r.score || 0), 0) / results.length).toFixed(1)
              : 0}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Highest Score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {results.length > 0 
              ? Math.max(...results.map(r => parseFloat(r.score || 0))).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>

      {/* Results List */}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    result.subject === 'Physics' ? 'bg-amber-100' :
                    result.subject === 'Chemistry' ? 'bg-emerald-100' :
                    'bg-violet-100'
                  }`}>
                    {getSubjectIcon(result.subject)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{result.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(result.completed_at).toLocaleDateString()}
                      </span>
                      <span>{result.subject}</span>
                      <span>{result.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}>
                    {parseFloat(result.score).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Expandable Details */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => getAiExplanation(result)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                  >
                    <Sparkles size={16} />
                    AI Explanation
                    {expandedResult === result.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => exportResult(result)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Download size={16} />
                    Export
                  </button>
                </div>

                {expandedResult === result.id && aiExplanations[result.id] && (
                  <div className="mt-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm">
                      {aiExplanations[result.id]}
                    </p>
                  </div>
                )}

                {/* Input/Result Data Preview */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Input Data</p>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                      {JSON.stringify(JSON.parse(result.input_data || '{}'), null, 2)}
                    </pre>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Result Data</p>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                      {JSON.stringify(JSON.parse(result.result_data || '{}'), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FlaskConical size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results yet</h3>
          <p className="text-gray-500 mb-4">Complete your first experiment to see results here</p>
          <button onClick={() => navigate('/experiments')} className="btn-primary">
            Browse Experiments
          </button>
        </div>
      )}
    </div>
  );
};

export default Results;
