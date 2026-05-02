import React, { useState, useEffect } from 'react';
import { Video, Play, Clock, BookOpen, Shield, Beaker, Filter, Search } from 'lucide-react';
import { experimentAPI, aiAPI } from '../utils/api';
import { toast } from 'react-toastify';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  const fetchVideos = async () => {
    try {
      const response = await experimentAPI.getVideos(filter.subject || undefined);
      setVideos(response.data.videos);
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const getVideoSummary = async (video) => {
    try {
      const response = await aiAPI.summarizeVideo({
        videoTitle: video.title,
        videoDescription: video.description
      });
      setAiSummary(response.data.summary);
    } catch (error) {
      setAiSummary({
        summary: `This video covers ${video.title} with practical demonstrations and explanations.`,
        keyPoints: ['Key concept demonstrated', 'Practical application shown', 'Experimental technique explained'],
        relatedConcepts: ['Science Fundamentals'],
        difficultyLevel: 'Medium',
        targetAudience: 'Science Students'
      });
    }
  };

  const filteredVideos = videos.filter(video => 
    (filter.type === '' || video.video_type === filter.type) &&
    (video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     video.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'demonstration': return Beaker;
      case 'theory': return BookOpen;
      case 'safety': return Shield;
      default: return Play;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'demonstration': return 'bg-emerald-100 text-emerald-800';
      case 'theory': return 'bg-blue-100 text-blue-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'practical': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'Physics': return 'bg-amber-100 text-amber-800';
      case 'Chemistry': return 'bg-emerald-100 text-emerald-800';
      case 'Biology': return 'bg-violet-100 text-violet-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Tutorials</h1>
        <p className="text-gray-500 dark:text-gray-400">Learn from expert demonstrations and explanations</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search videos..."
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
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="input-field w-40"
            >
              <option value="">All Types</option>
              <option value="demonstration">Demonstration</option>
              <option value="theory">Theory</option>
              <option value="safety">Safety</option>
              <option value="practical">Practical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => {
          const TypeIcon = getTypeIcon(video.video_type);
          return (
            <div 
              key={video.id} 
              className="card p-0 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
              onClick={() => {
                setSelectedVideo(video);
                getVideoSummary(video);
              }}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative group">
                <div className="w-16 h-16 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play size={24} className="text-primary-600 ml-1" />
                </div>
                {video.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(video.video_type)}`}>
                    {video.video_type}
                  </span>
                  {video.subject && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSubjectColor(video.subject)}`}>
                      {video.subject}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{video.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No videos found matching your criteria</p>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => { setSelectedVideo(null); setAiSummary(null); }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Player Placeholder */}
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Video size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">{selectedVideo.title}</p>
                <p className="text-sm opacity-75">YouTube Video ID: {selectedVideo.youtube_video_id}</p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedVideo.video_type)}`}>
                  {selectedVideo.video_type}
                </span>
                {selectedVideo.subject && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(selectedVideo.subject)}`}>
                    {selectedVideo.subject}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedVideo.title}</h2>
              {selectedVideo.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedVideo.description}</p>
              )}

              {/* AI Summary */}
              {aiSummary && (
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 p-4 rounded-lg mt-4">
                  <h3 className="font-semibold text-violet-800 dark:text-violet-300 mb-3 flex items-center gap-2">
                    <BookOpen size={18} />
                    AI Video Summary
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{aiSummary.summary}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-2">Key Learning Points:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {aiSummary.keyPoints?.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-2">Related Concepts:</p>
                      <div className="flex flex-wrap gap-2">
                        {aiSummary.relatedConcepts?.map((concept, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-300 rounded">
                            {concept}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Difficulty:</span>
                          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{aiSummary.difficultyLevel}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Target:</span>
                          <span className="ml-1 font-medium text-gray-700 dark:text-gray-300">{aiSummary.targetAudience}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => { setSelectedVideo(null); setAiSummary(null); }}
                className="mt-6 btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
