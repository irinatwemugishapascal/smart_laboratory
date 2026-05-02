const OpenAI = require('openai');
const { query } = require('../config/db');

// Ollama Configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-v3.1:671b-cloud';
const USE_OPENAI = process.env.USE_OPENAI === 'true';

// OpenAI fallback (optional)
const openai = USE_OPENAI && process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Ollama API Helper
const ollamaChat = async (messages, options = {}) => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: messages,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.max_tokens || 800,
        ...options
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${error}`);
  }

  const data = await response.json();
  return data.message?.content || '';
};

const ollamaGenerate = async (prompt, options = {}) => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.max_tokens || 800,
        ...options
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${error}`);
  }

  const data = await response.json();
  return data.response || '';
};

exports.explainResult = async (req, res, next) => {
  try {
    const { experimentTitle, subject, inputData, resultData } = req.body;

    const messages = [
      { 
        role: 'system', 
        content: 'You are a helpful science teacher explaining experiment results to students in simple, educational terms.' 
      },
      { 
        role: 'user', 
        content: `Explain the following ${subject} experiment results in simple, student-friendly terms:
    
Experiment: ${experimentTitle}
Input Data: ${JSON.stringify(inputData)}
Results: ${JSON.stringify(resultData)}

Please explain:
1. What was being tested/measured
2. What the results mean in simple terms
3. Why these results occurred (the science behind it)
4. Real-world applications of this concept
5. Any interesting observations

Keep it educational but easy to understand for a high school student.` 
      }
    ];

    let explanation;
    
    // Try Ollama first
    try {
      explanation = await ollamaChat(messages, { max_tokens: 800, temperature: 0.7 });
    } catch (ollamaError) {
      console.log('Ollama failed, trying OpenAI fallback:', ollamaError.message);
      
      // Fallback to OpenAI if configured
      if (USE_OPENAI && openai) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 800,
          temperature: 0.7
        });
        explanation = completion.choices[0].message.content;
      } else {
        throw ollamaError;
      }
    }

    res.json({
      explanation,
      experiment: experimentTitle,
      subject,
      model: USE_OPENAI ? 'openai' : 'ollama'
    });
  } catch (error) {
    console.error('AI API error:', error);
    res.json({
      explanation: `Based on the ${req.body.subject || 'science'} experiment "${req.body.experimentTitle}", your results show interesting patterns. The input values you provided led to specific outcomes that demonstrate key scientific principles. This experiment helps illustrate how different variables interact in the natural world, and your results are consistent with expected scientific behavior.`,
      fallback: true
    });
  }
};

exports.getSuggestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const userResults = await query(
      `SELECT e.subject, AVG(r.score) as avg_score, COUNT(r.id) as count
       FROM results r
       JOIN experiments e ON r.experiment_id = e.id
       WHERE r.user_id = ?
       GROUP BY e.subject`,
      [userId]
    );
    
    const student = await query(
      'SELECT total_experiments, average_score FROM users WHERE id = ?',
      [userId]
    );
    
    const userInfo = student[0];
    
    let weakSubject = 'None';
    let strongSubject = 'None';
    let avgScores = {};
    
    userResults.forEach(r => {
      avgScores[r.subject] = parseFloat(r.avg_score);
    });
    
    if (userResults.length > 0) {
      const sorted = [...userResults].sort((a, b) => a.avg_score - b.avg_score);
      weakSubject = sorted[0].subject;
      strongSubject = sorted[sorted.length - 1].subject;
    }
    
    const prompt = `Based on the following student performance data, provide personalized learning recommendations:
    
Student Stats:
- Total Experiments Completed: ${userInfo.total_experiments}
- Overall Average Score: ${userInfo.average_score}%
- Physics Average: ${avgScores.Physics || 'Not attempted'}%
- Chemistry Average: ${avgScores.Chemistry || 'Not attempted'}%
- Biology Average: ${avgScores.Biology || 'Not attempted'}%
- Strongest Subject: ${strongSubject}
- Weakest Subject: ${weakSubject}

Please provide:
1. Identify the weak subject area and why it needs attention
2. Specific topics within that subject to focus on
3. Recommended experiments or practice areas
4. Study tips and resources
5. Encouragement and motivation
6. Next steps for improvement

Be supportive and encouraging while giving actionable advice.`;

    const messages = [
      { role: 'system', content: 'You are an encouraging science mentor providing personalized study advice.' },
      { role: 'user', content: prompt }
    ];

    let suggestion;
    try {
      // Try Ollama first
      suggestion = await ollamaChat(messages, { max_tokens: 800, temperature: 0.7 });
    } catch (ollamaError) {
      console.log('Ollama failed for suggestions:', ollamaError.message);
      
      // Fallback to OpenAI if configured
      if (USE_OPENAI && openai) {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 800,
          temperature: 0.7
        });
        suggestion = completion.choices[0].message.content;
      } else {
        suggestion = generateFallbackSuggestion(weakSubject, strongSubject, userInfo);
      }
    }

    res.json({
      suggestion,
      analysis: {
        totalExperiments: userInfo.total_experiments,
        overallAverage: userInfo.average_score,
        subjectScores: avgScores,
        weakSubject,
        strongSubject
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    const systemPrompt = `You are SmartLab AI, a helpful science tutor for high school students. You help with:
- Physics concepts and calculations
- Chemistry reactions and experiments
- Biology processes and observations
- Laboratory safety and procedures
- Science homework and assignments

Be friendly, encouraging, and explain concepts clearly. If the question is outside science, politely redirect to science topics. Never provide instructions for dangerous experiments.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6),
      { role: 'user', content: message }
    ];

    try {
      let reply;
      
      // Try Ollama first
      try {
        reply = await ollamaChat(messages, { max_tokens: 600, temperature: 0.7 });
      } catch (ollamaError) {
        console.log('Ollama chat failed:', ollamaError.message);
        
        // Fallback to OpenAI if configured
        if (USE_OPENAI && openai) {
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 600,
            temperature: 0.7
          });
          reply = completion.choices[0].message.content;
        } else {
          throw ollamaError;
        }
      }

      res.json({
        reply,
        model: USE_OPENAI ? 'openai' : 'ollama',
        timestamp: new Date().toISOString()
      });
    } catch (aiError) {
      const fallbackReply = generateFallbackChatReply(message);
      res.json({
        reply: fallbackReply,
        fallback: true,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.summarizeVideo = async (req, res, next) => {
  try {
    const { videoTitle, videoDescription } = req.body;

    const prompt = `Summarize the following educational video and identify key learning points:
    
Title: ${videoTitle}
Description: ${videoDescription || 'No description available'}

Please provide:
1. Brief summary (2-3 sentences)
2. 3-5 key learning points
3. Related science concepts
4. Difficulty level (Easy/Medium/Hard)
5. Who should watch this (grade level/target audience)

Format as JSON with keys: summary, keyPoints (array), relatedConcepts (array), difficultyLevel, targetAudience.`;

    try {
      const messages = [
        { role: 'system', content: 'You analyze educational science videos and provide structured summaries.' },
        { role: 'user', content: prompt }
      ];
      
      let content;
      
      // Try Ollama first
      try {
        content = await ollamaChat(messages, { max_tokens: 600, temperature: 0.5 });
      } catch (ollamaError) {
        console.log('Ollama summarization failed:', ollamaError.message);
        
        // Fallback to OpenAI if configured
        if (USE_OPENAI && openai) {
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 600,
            temperature: 0.5
          });
          content = completion.choices[0].message.content;
        } else {
          throw ollamaError;
        }
      }
      
      try {
        const summary = JSON.parse(content);
        res.json({ summary, model: USE_OPENAI ? 'openai' : 'ollama' });
      } catch (parseError) {
        res.json({
          summary: {
            summary: content.substring(0, 200) + '...',
            keyPoints: ['Key concept demonstrated', 'Practical application shown', 'Experimental technique explained'],
            relatedConcepts: ['General Science', 'Laboratory Techniques'],
            difficultyLevel: 'Medium',
            targetAudience: 'High School Students'
          }
        });
      }
    } catch (aiError) {
      res.json({
        summary: {
          summary: `This video covers important concepts related to "${videoTitle}". It demonstrates practical applications and experimental techniques.`,
          keyPoints: ['Concept demonstration', 'Practical technique', 'Scientific method'],
          relatedConcepts: ['Science Fundamentals', 'Laboratory Skills'],
          difficultyLevel: 'Medium',
          targetAudience: 'Science Students'
        },
        fallback: true
      });
    }
  } catch (error) {
    next(error);
  }
};

const generateFallbackSuggestion = (weakSubject, strongSubject, userInfo) => {
  return `Based on your performance analysis, here are personalized recommendations:

**Analysis Summary:**
- Total Experiments: ${userInfo.total_experiments}
- Overall Average: ${userInfo.average_score}%
- Strongest Area: ${strongSubject}
${weakSubject !== 'None' ? `- Area for Improvement: ${weakSubject}` : ''}

**Recommendations:**

1. **Focus on ${weakSubject}**: Your scores suggest this is an area where additional practice would be most beneficial.

2. **Recommended Actions:**
   - Review fundamental concepts in ${weakSubject}
   - Complete more practice experiments in this subject
   - Watch video tutorials for visual learning
   - Use the AI chat for concept clarification

3. **Leverage Your Strength in ${strongSubject}**: Use your understanding here to build confidence and apply similar study strategies to other subjects.

4. **Study Tips:**
   - Set specific goals for each study session
   - Track your progress regularly
   - Don't hesitate to revisit experiments for better scores
   - Connect concepts across different science subjects

Keep up the great work! Consistent practice will help you improve across all subjects.`;
};

const generateFallbackChatReply = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('ohm') || lowerMessage.includes('resistance') || lowerMessage.includes('current')) {
    return "Ohm's Law is fundamental in physics! It states that V = I × R, where V is voltage, I is current, and R is resistance. In our virtual lab, you can experiment with different values to see how they relate. Try the Ohm's Law experiment to verify this relationship practically!";
  }
  
  if (lowerMessage.includes('acid') || lowerMessage.includes('base') || lowerMessage.includes('ph')) {
    return "Acids and bases are fascinating! Acids have pH < 7, bases have pH > 7, and neutral substances are at pH 7. In our chemistry section, you can explore titration experiments and pH investigations. Remember to always follow safety procedures when working with chemicals!";
  }
  
  if (lowerMessage.includes('cell') || lowerMessage.includes('photosynthesis') || lowerMessage.includes('biology')) {
    return "Biology is the study of living things! From cells to ecosystems, there's so much to explore. In our lab, you can observe cells under microscope, study photosynthesis, and investigate enzyme activity. What specific biology topic interests you?";
  }
  
  if (lowerMessage.includes('safety') || lowerMessage.includes('danger')) {
    return "Laboratory safety is our top priority! Always wear safety goggles, use gloves when handling chemicals, and never work alone. Read all procedures before starting. Our virtual lab lets you practice safely before working in a real laboratory. What safety topic would you like to know more about?";
  }
  
  return "That's an interesting question about science! Our SmartLaboratory covers Physics, Chemistry, and Biology experiments. You can try virtual experiments, watch video tutorials, or track your progress. What specific topic would you like to explore? I'm here to help with your science learning journey!";
};
