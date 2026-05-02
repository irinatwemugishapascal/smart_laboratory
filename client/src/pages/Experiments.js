import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Search, 
  Filter, 
  BookOpen,
  ArrowRight,
  Zap,
  Beaker,
  Microscope
} from 'lucide-react';
import { experimentAPI } from '../utils/api';
import { toast } from 'react-toastify';

const Experiments = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', difficulty: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExperiments();
  }, [filter]);

  const fetchExperiments = async () => {
    try {
      const response = await experimentAPI.getAll(filter);
      setExperiments(response.data.experiments);
    } catch (error) {
      toast.error('Failed to load experiments');
    } finally {
      setLoading(false);
    }
  };

  const filteredExperiments = experiments.filter(exp => 
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case 'Physics': return Zap;
      case 'Chemistry': return Beaker;
      case 'Biology': return Microscope;
      default: return FlaskConical;
    }
  };

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'Physics': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Chemistry': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Biology': return 'bg-violet-100 text-violet-800 border-violet-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Hard': return 'text-red-600';
      default: return 'text-gray-600';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Experiments</h1>
          <p className="text-gray-500 dark:text-gray-400">Choose an experiment to begin your learning journey</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/chemistry-lab')}
            className="btn-primary flex items-center gap-2"
          >
            <Beaker size={18} />
            Virtual Chemistry Lab
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filter.subject}
              onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
              className="input-field w-40"
            >
              <option value="">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
              className="input-field w-40"
            >
              <option value="">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subject Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Physics', 'Chemistry', 'Biology'].map(subject => {
          const count = experiments.filter(e => e.subject === subject).length;
          const SubjectIcon = getSubjectIcon(subject);
          return (
            <div 
              key={subject}
              onClick={() => setFilter({ ...filter, subject: filter.subject === subject ? '' : subject })}
              className={`card cursor-pointer transition-all ${
                filter.subject === subject ? 'ring-2 ring-primary-500' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${getSubjectColor(subject)}`}>
                  <SubjectIcon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{subject}</h3>
                  <p className="text-sm text-gray-500">{count} experiments available</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiments.map((experiment) => {
          const SubjectIcon = getSubjectIcon(experiment.subject);
          return (
            <div 
              key={experiment.id} 
              className="card hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => navigate(`/experiments/${experiment.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getSubjectColor(experiment.subject)}`}>
                  <SubjectIcon size={24} />
                </div>
                <span className={`text-xs font-medium ${getDifficultyColor(experiment.difficulty)}`}>
                  {experiment.difficulty}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                {experiment.title}
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {experiment.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{experiment.subject}</span>
                </div>
                <span className="text-xs text-gray-500">Max Score: {experiment.max_score}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm group-hover:gap-3 transition-all">
                  Start Experiment <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExperiments.length === 0 && (
        <div className="text-center py-12">
          <FlaskConical size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No experiments found matching your criteria</p>
          <button 
            onClick={() => { setFilter({ subject: '', difficulty: '' }); setSearchQuery(''); }}
            className="mt-4 btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Experiments;
