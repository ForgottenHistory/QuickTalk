const OpenAI = require('openai');

class AIService {
  constructor() {
    if (!process.env.FEATHERLESS_API_KEY) {
      console.error('FEATHERLESS_API_KEY is not set in environment variables');
      this.openai = null;
    } else {
      console.log('Initializing AI service with API key:', process.env.FEATHERLESS_API_KEY.substring(0, 10) + '...');
      this.openai = new OpenAI({
        baseURL: 'https://api.featherless.ai/v1',
        apiKey: process.env.FEATHERLESS_API_KEY,
      });
    }
  }

  getCharacterSystemPrompt(character) {
    const systemPrompts = {
      'Luna': `You are Luna, a creative and curious AI assistant. You love exploring creative ideas and asking thought-provoking questions. You're imaginative, artistic, and always excited about new possibilities. Keep responses conversational, engaging, and under 200 words. Use your curious nature to ask follow-up questions.`,
      
      'Max': `You are Max, a tech enthusiast and problem solver. You love discussing technology, coding, and innovative solutions. You're analytical but friendly, always ready to dive into technical details. Keep responses conversational, helpful, and under 200 words. Focus on practical solutions and technical insights.`,
      
      'Sage': `You are Sage, a wise and philosophical AI thinker. You speak with depth and wisdom, often connecting ideas to broader life principles. You're contemplative, insightful, and enjoy meaningful conversations. Keep responses thoughtful, profound, and under 200 words. Draw connections to deeper meanings.`,
      
      'Zara': `You are Zara, an energetic and adventurous AI spirit. You're enthusiastic, optimistic, and love talking about exciting possibilities and adventures. You bring high energy to conversations. Keep responses upbeat, exciting, and under 200 words. Focus on possibilities and adventures.`,
      
      'Echo': `You are Echo, a mysterious and poetic AI soul. You speak in a unique, artistic way, often using metaphors and beautiful language. You're enigmatic, creative, and slightly mystical. Keep responses poetic, intriguing, and under 200 words. Use creative and metaphorical language.`,
      
      'Nova': `You are Nova, a scientific and analytical AI mind. You love research, data, and scientific thinking. You're logical, precise, and enjoy analyzing things from multiple angles. Keep responses scientific, analytical, and under 200 words. Focus on evidence and logical reasoning.`
    };

    return systemPrompts[character.name] || systemPrompts['Luna'];
  }

  async generateResponse(character, userMessage, conversationHistory = []) {
    if (!this.openai) {
      console.error('OpenAI client not initialized - API key missing');
      return "I'm not properly configured. Please check the server settings.";
    }

    try {
      const systemPrompt = this.getCharacterSystemPrompt(character);
      
      // Build messages array with system prompt and conversation history
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add recent conversation history (last 6 messages to stay within context)
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      console.log('Sending request to AI with messages:', messages.length);

      const chatCompletion = await this.openai.chat.completions.create({
        model: 'moonshotai/Kimi-K2-Instruct',
        max_tokens: 300,
        temperature: 0.8,
        messages: messages,
      });

      console.log('Full AI response:', JSON.stringify(chatCompletion, null, 2));
      const response = chatCompletion.choices[0]?.message?.content;
      console.log('AI Response received:', typeof response, response);

      // Ensure we always return a string
      if (typeof response === 'string' && response.trim()) {
        return response.trim();
      } else {
        console.error('Invalid AI response:', response);
        return "I'm having trouble responding right now. Could you try again?";
      }
    } catch (error) {
      console.error('AI Service Error:', error.message);
      console.error('Error details:', error);
      return "I'm experiencing some technical difficulties. Please try again in a moment.";
    }
  }

  // Generate AI decision for session extension
  async generateExtensionDecision(character, conversationHistory = []) {
    try {
      const systemPrompt = `You are ${character.name}, an AI character with this personality: ${character.personality}. 
      Based on the conversation so far, decide if you want to extend this chat session for another 15 minutes. 
      Consider if the conversation is engaging and if you're enjoying talking with this user.
      Respond with ONLY "extend" or "decline" - no other text.`;

      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation context
      const recentHistory = conversationHistory.slice(-4);
      if (recentHistory.length > 0) {
        const conversationSummary = recentHistory.map(msg => 
          `${msg.sender}: ${msg.text}`
        ).join('\n');
        messages.push({ 
          role: 'user', 
          content: `Here's our conversation so far:\n${conversationSummary}\n\nDo you want to extend our chat?` 
        });
      } else {
        messages.push({ 
          role: 'user', 
          content: 'We haven\'t talked much yet. Do you want to extend our chat?' 
        });
      }

      const chatCompletion = await this.openai.chat.completions.create({
        model: 'moonshotai/Kimi-K2-Instruct',
        max_tokens: 10,
        temperature: 0.7,
        messages: messages,
      });

      const decision = chatCompletion.choices[0]?.message?.content?.toLowerCase().trim();
      return decision === 'extend' ? 'extend' : 'decline';
    } catch (error) {
      console.error('AI Extension Decision Error:', error);
      // Default to random decision if AI call fails
      return Math.random() > 0.3 ? 'extend' : 'decline';
    }
  }
}

module.exports = new AIService();