import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { aiAPI } from '../utils/api';
import { toast } from 'react-toastify';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm SmartLab AI, your science learning assistant. I can help you with:\n\n• Physics concepts and calculations\n• Chemistry reactions and experiments\n• Biology processes and observations\n• Laboratory safety and procedures\n• Understanding your experiment results\n\nWhat would you like to learn about today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await aiAPI.chat(userMessage.content, history);
      
      const aiMessage = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get response from AI');
      
      const fallbackMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try asking your question again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    "Explain Ohm's Law",
    "What happens when acid reacts with base?",
    "How does photosynthesis work?",
    "Safety tips for chemistry lab",
    "Difference between plant and animal cells"
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-violet-500" />
          AI Science Assistant
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Ask any science question and get personalized help</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-primary-100 dark:bg-primary-900/30' 
                  : 'bg-violet-100 dark:bg-violet-900/30'
              }`}>
                {message.role === 'user' ? (
                  <User size={20} className="text-primary-600 dark:text-primary-400" />
                ) : (
                  <Bot size={20} className="text-violet-600 dark:text-violet-400" />
                )}
              </div>

              {/* Message Content */}
              <div className={`max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                </div>
                <span className="text-xs text-gray-400 mt-1 px-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Bot size={20} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-violet-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length < 3 && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a science question..."
              className="flex-1 input-field"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Tip: You can ask about specific experiments, concepts, or get help with calculations</p>
      </div>
    </div>
  );
};

export default AIChat;
