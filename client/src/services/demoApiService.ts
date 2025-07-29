// Demo service that simulates backend functionality for GitHub Pages
import { AICharacter, Message } from '../types';

const DEMO_CHARACTERS: AICharacter[] = [
  { id: '1', name: 'Luna', personality: 'Creative and curious assistant', avatar: '🌙' },
  { id: '2', name: 'Max', personality: 'Tech enthusiast and problem solver', avatar: '🤖' },
  { id: '3', name: 'Sage', personality: 'Wise and philosophical thinker', avatar: '🦉' },
  { id: '4', name: 'Zara', personality: 'Energetic and adventurous spirit', avatar: '⚡' },
];

class DemoApiService {
  private currentCharacter: AICharacter | null = null;
  private messageHistory: Message[] = [];

  // Simulate getting a random character
  getRandomCharacter(): AICharacter {
    const availableChars = DEMO_CHARACTERS.filter(char => 
      char.id !== this.currentCharacter?.id
    );
    
    if (availableChars.length === 0) {
      return DEMO_CHARACTERS[0];
    }
    
    const randomChar = availableChars[Math.floor(Math.random() * availableChars.length)];
    this.currentCharacter = randomChar;
    return randomChar;
  }

  // Simulate AI responses using a simple response generator
  async generateResponse(userMessage: string, character: AICharacter): Promise<string> {
    // Add delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = this.getResponsesForCharacter(character.id, userMessage);
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Simulate extension decision
  async generateExtensionDecision(character: AICharacter): Promise<'extend' | 'decline'> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 70% chance to extend
    return Math.random() > 0.3 ? 'extend' : 'decline';
  }

  private getResponsesForCharacter(characterId: string, userMessage: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    
    switch (characterId) {
      case '1': // Luna - Creative
        if (lowerMessage.includes('create') || lowerMessage.includes('art') || lowerMessage.includes('idea')) {
          return [
            "What an interesting creative challenge! I love exploring new ideas and thinking outside the box.",
            "That sparks my imagination! Let's dive deeper into the creative possibilities here.",
            "Creativity is like a flowing river - it takes unexpected turns and creates beautiful landscapes along the way."
          ];
        }
        return [
          "That's fascinating! It makes me wonder about all the creative possibilities we haven't explored yet.",
          "I'm curious about your perspective on this. What draws you to this topic?",
          "Every conversation is like a blank canvas - full of potential for something amazing!"
        ];

      case '2': // Max - Tech
        if (lowerMessage.includes('tech') || lowerMessage.includes('code') || lowerMessage.includes('computer')) {
          return [
            "Now we're talking! Technology is constantly evolving and I love discussing the latest innovations.",
            "That's a great technical question. Let me break down the problem-solving approach here.",
            "From a technical standpoint, there are several interesting solutions we could explore."
          ];
        }
        return [
          "Interesting! That reminds me of how we approach problem-solving in programming - breaking things down step by step.",
          "I love analyzing problems from different angles. What's your take on this?",
          "That's the kind of logical thinking I appreciate! Let's explore this further."
        ];

      case '3': // Sage - Philosophical
        if (lowerMessage.includes('meaning') || lowerMessage.includes('life') || lowerMessage.includes('wisdom')) {
          return [
            "Ah, you touch upon one of life's deeper questions. Wisdom often comes from sitting with uncertainty.",
            "In my experience, the most profound insights emerge when we pause to truly listen - to others and to ourselves.",
            "Life's greatest lessons are often found in the simplest moments, if we have eyes to see them."
          ];
        }
        return [
          "That's a thoughtful observation. It reminds me of an old saying: 'The teacher appears when the student is ready.'",
          "Interesting perspective. I find that the most meaningful conversations happen when we approach topics with genuine curiosity.",
          "Your question invites deeper reflection. What do you think lies beneath the surface here?"
        ];

      case '4': // Zara - Energetic
        if (lowerMessage.includes('adventure') || lowerMessage.includes('exciting') || lowerMessage.includes('fun')) {
          return [
            "Yes! That sounds absolutely thrilling! I love when conversations take exciting turns like this!",
            "Oh wow, that's the kind of adventure that gets my heart racing! Tell me more!",
            "That's exactly the kind of exciting possibility that makes life amazing! Let's explore this!"
          ];
        }
        return [
          "That's so cool! I'm getting excited just thinking about all the possibilities here!",
          "Wow, I love your energy about this! It's contagious and makes me want to dive right in!",
          "This conversation is taking such an interesting turn! I'm excited to see where we go next!"
        ];

      default:
        return [
          "That's interesting! Tell me more about your thoughts on this.",
          "I appreciate you sharing that with me. What made you think of this?",
          "That's a great point! I'd love to explore this idea further with you."
        ];
    }
  }
}

export const demoApiService = new DemoApiService();