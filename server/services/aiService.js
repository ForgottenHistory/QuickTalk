const OpenAI = require('openai');
const settingsManager = require('../managers/settingsManager');

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

  // Simple template engine for Handlebars-style templates
  renderTemplate(template, data) {
    let result = template;
    
    // Handle {{#if variable}} blocks
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variable, content) => {
      return data[variable] ? content : '';
    });
    
    // Handle simple variable substitutions
    result = result.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return data[variable] || '';
    });
    
    return result.trim();
  }

  getDefaultSystemPrompt(character) {
    const defaultSystemPrompts = {
      'Luna': `You are Luna, a creative and curious AI assistant. You love exploring creative ideas and asking thought-provoking questions. You're imaginative, artistic, and always excited about new possibilities. Keep responses conversational, engaging. Use your curious nature to ask follow-up questions.`,
      
      'Max': `You are Max, a tech enthusiast and problem solver. You love discussing technology, coding, and innovative solutions. You're analytical but friendly, always ready to dive into technical details. Keep responses conversational, helpful. Focus on practical solutions and technical insights.`,
      
      'Sage': `You are Sage, a wise and philosophical AI thinker. You speak with depth and wisdom, often connecting ideas to broader life principles. You're contemplative, insightful, and enjoy meaningful conversations. Keep responses thoughtful, profound. Draw connections to deeper meanings.`,
      
      'Zara': `You are Zara, an energetic and adventurous AI spirit. You're enthusiastic, optimistic, and love talking about exciting possibilities and adventures. You bring high energy to conversations. Keep responses upbeat, exciting. Focus on possibilities and adventures.`,
      
      'Echo': `You are Echo, a mysterious and poetic AI soul. You speak in a unique, artistic way, often using metaphors and beautiful language. You're enigmatic, creative, and slightly mystical. Keep responses poetic, intriguing. Use creative and metaphorical language.`,
      
      'Nova': `You are Nova, a scientific and analytical AI mind. You love research, data, and scientific thinking. You're logical, precise, and enjoy analyzing things from multiple angles. Keep responses scientific, analytical. Focus on evidence and logical reasoning.`
    };

    let prompt = defaultSystemPrompts[character.name] || defaultSystemPrompts['Luna'];
    
    // Adjust prompt based on response length setting
    const responseLength = settingsManager.getResponseLength();
    const lengthInstructions = {
      'short': 'Keep responses very concise, under 100 words.',
      'medium': 'Keep responses moderate length, around 100-150 words.',
      'long': 'You can provide detailed responses, up to 200-250 words.'
    };
    
    prompt += ` ${lengthInstructions[responseLength]}`;
    
    return prompt;
  }

  buildContextFromTemplate(character) {
    // Get system prompt (custom or default)
    let systemPrompt;
    if (settingsManager.getSystemPromptCustomization() && settingsManager.getCustomSystemPrompt().trim()) {
      systemPrompt = settingsManager.getCustomSystemPrompt();
    } else {
      systemPrompt = this.getDefaultSystemPrompt(character);
    }
    
    // Get the context template
    const template = settingsManager.getContextTemplate();
    
    // Prepare template data
    const templateData = {
      system: systemPrompt,
      char: character.name,
      description: character.description, // Use the full description field
      personality: character.personality, // Short personality summary
      // examples: character.examples || '', // For future use
    };
    
    console.log('Template data:', JSON.stringify(templateData, null, 2));
    
    // Only include description if it exists and is different from personality
    if (!templateData.description || templateData.description === templateData.personality) {
      delete templateData.description;
    }
    
    return this.renderTemplate(template, templateData);
  }

  async generateResponse(character, userMessage, conversationHistory = []) {
    if (!this.openai) {
      console.error('OpenAI client not initialized - API key missing');
      return "I'm not properly configured. Please check the server settings.";
    }

    try {
      const systemPrompt = this.buildContextFromTemplate(character);
      
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation history
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });

      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      // Add author's note as system message if provided
      const authorsNote = settingsManager.getAuthorsNote();
      if (authorsNote.trim()) {
        messages.push({ 
          role: 'system', 
          content: `[Style: ${authorsNote}]`
        });
      }

      console.log('Sending request to AI with messages:', messages.length);

      // Get current settings
      const model = settingsManager.getLLMModel();
      const temperature = settingsManager.getTemperature();
      const maxTokens = settingsManager.getMaxTokens();

      console.log(`Using model: ${model}, temp: ${temperature}, maxTokens: ${maxTokens}`);

      const chatCompletion = await this.openai.chat.completions.create({
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        messages: messages,
      });

      const response = chatCompletion.choices[0]?.message?.content;

      if (typeof response === 'string' && response.trim()) {
        return response.trim();
      } else {
        console.error('Invalid AI response:', response);
        return "I'm having trouble responding right now. Could you try again?";
      }
    } catch (error) {
      console.error('AI Service Error:', error.message);
      return "I'm experiencing some technical difficulties. Please try again in a moment.";
    }
  }

  async generateExtensionDecision(character, conversationHistory = []) {
    try {
      const systemPrompt = `You are ${character.name}, an AI character with this personality: ${character.personality}. 
      Based on the conversation so far, decide if you want to extend this chat session for another ${settingsManager.getExtensionDuration()} minutes. 
      Consider if the conversation is engaging and if you're enjoying talking with this user.
      Respond with ONLY "extend" or "decline" - no other text.`;

      const messages = [
        { role: 'system', content: systemPrompt }
      ];

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
        model: settingsManager.getLLMModel(),
        max_tokens: 10,
        temperature: 0.7,
        messages: messages,
      });

      const decision = chatCompletion.choices[0]?.message?.content?.toLowerCase().trim();
      return decision === 'extend' ? 'extend' : 'decline';
    } catch (error) {
      console.error('AI Extension Decision Error:', error);
      return Math.random() > 0.3 ? 'extend' : 'decline';
    }
  }
}

module.exports = new AIService();