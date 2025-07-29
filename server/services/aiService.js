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

  getDefaultSystemPrompt(character, timeRemaining = null) {
    let prompt = `You are ${character.name}, an AI character with the following personality: ${character.personality}

Stay true to your character while being conversational, engaging, and helpful. Respond naturally and authentically based on your personality traits.`;

    // Add scenario context
    prompt += `\n\n## SCENARIO CONTEXT
You are participating in Quicktalk - a unique chat platform where humans have timed conversations with AI characters. Here's how it works:

- Each conversation has a ${settingsManager.getSessionDuration()}-minute time limit
- When time is almost up (${settingsManager.getExtensionWarningTime()} minutes remaining), both you and the human can choose to extend for another ${settingsManager.getExtensionDuration()} minutes
- If either party declines extension, the human connects to a different AI character
- You should be aware of the time remaining and engage meaningfully within this timeframe
- Near the end, you might naturally reference the time limit or express interest in continuing if you're enjoying the conversation`;

    // Add time awareness if time remaining is provided
    if (timeRemaining !== null) {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;

      if (minutes > 0) {
        prompt += `\n\n## TIME REMAINING: ${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds > 0 ? `and ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}`;
      } else {
        prompt += `\n\n## TIME REMAINING: ${seconds} second${seconds !== 1 ? 's' : ''}`;
      }

      // Add time-based guidance
      if (minutes <= 2) {
        prompt += `\nThe conversation is nearing its end. You may naturally acknowledge this and express whether you'd be interested in extending the chat if you're enjoying it.`;
      } else if (minutes <= 5) {
        prompt += `\nThe conversation is in its later stages. Continue engaging meaningfully.`;
      }
    }

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

  buildContextFromTemplate(character, timeRemaining = null) {
    // Calculate time variables first
    let timeMinutes = 0;
    let timeSeconds = 0;
    let timeFormatted = '';
    let timeGuidance = '';

    if (timeRemaining !== null && timeRemaining > 0) {
      timeMinutes = Math.floor(timeRemaining / 60);
      timeSeconds = timeRemaining % 60;

      if (timeMinutes > 0) {
        timeFormatted = `${timeMinutes} minute${timeMinutes !== 1 ? 's' : ''}${timeSeconds > 0 ? ` and ${timeSeconds} second${timeSeconds !== 1 ? 's' : ''}` : ''}`;
      } else {
        timeFormatted = `${timeSeconds} second${timeSeconds !== 1 ? 's' : ''}`;
      }

      // Generate time-based guidance
      if (timeMinutes <= 2) {
        timeGuidance = 'The conversation is nearing its end. You may naturally acknowledge this and express whether you\'d be interested in extending the chat if you\'re enjoying it.';
      } else if (timeMinutes <= 5) {
        timeGuidance = 'The conversation is in its later stages. Continue engaging meaningfully.';
      }
    }

    // Prepare template data with all available variables
    const templateData = {
      // Character variables (standard format)
      char: character.name,
      description: character.description,
      personality: character.personality,

      // Common character card aliases
      character: character.name,
      name: character.name,
      user: 'Human', // Standard user reference

      // Session variables
      sessionDuration: settingsManager.getSessionDuration(),
      extensionDuration: settingsManager.getExtensionDuration(),
      extensionWarningTime: settingsManager.getExtensionWarningTime(),

      // Time variables
      timeRemaining: timeFormatted,
      timeMinutes: timeMinutes.toString(),
      timeSeconds: timeSeconds.toString(),
      timeGuidance: timeGuidance,

      // Response length
      responseLength: settingsManager.getResponseLength(),
      maxTokens: settingsManager.getMaxTokens().toString(),
    };

    // Get system prompt (custom or default) and apply template processing
    let systemPrompt;
    if (settingsManager.getSystemPromptCustomization() && settingsManager.getCustomSystemPrompt().trim()) {
      // Apply template processing to custom system prompt
      const customPromptTemplate = settingsManager.getCustomSystemPrompt();
      systemPrompt = this.renderTemplate(customPromptTemplate, templateData);
    } else {
      systemPrompt = this.getDefaultSystemPrompt(character, timeRemaining);
    }

    // Add system prompt to template data for context template
    templateData.system = systemPrompt;

    // Get the context template
    const template = settingsManager.getContextTemplate();

    console.log('Template data with processed system prompt:', JSON.stringify(templateData, null, 2));

    // Only include description if it exists and is different from personality
    if (!templateData.description || templateData.description === templateData.personality) {
      delete templateData.description;
    }

    return this.renderTemplate(template, templateData);
  }

  async generateResponse(character, userMessage, conversationHistory = [], timeRemaining = null) {
    if (!this.openai) {
      console.error('OpenAI client not initialized - API key missing');
      return "I'm not properly configured. Please check the server settings.";
    }

    try {
      const systemPrompt = this.buildContextFromTemplate(character, timeRemaining);

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