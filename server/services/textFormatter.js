class TextFormatter {
  constructor() {
    // Common RP action patterns
    this.actionPatterns = [
      // Basic asterisk actions: *laughs*, *giggles*, *smiles*
      /\*[^*]+\*/g,
      
      // Parenthetical actions: (laughs), (giggles), (smiles)
      /\([^)]*(?:laugh|giggle|smile|nod|shrug|sigh|blush|wink|grin|frown|chuckle|snicker|gasp|whisper|mumble|groan|yawn|stretch|lean|tilt|shake|wave|point|gesture|look|glance|stare|gaze|peek|squint)[^)]*\)/gi,
      
      // Bracketed actions: [laughs], [giggles], [smiles]
      /\[[^\]]*(?:laugh|giggle|smile|nod|shrug|sigh|blush|wink|grin|frown|chuckle|snicker|gasp|whisper|mumble|groan|yawn|stretch|lean|tilt|shake|wave|point|gesture|look|glance|stare|gaze|peek|squint)[^\]]*\]/gi,
      
      // Underscore actions: _laughs_, _giggles_, _smiles_
      /_[^_]*(?:laugh|giggle|smile|nod|shrug|sigh|blush|wink|grin|frown|chuckle|snicker|gasp|whisper|mumble|groan|yawn|stretch|lean|tilt|shake|wave|point|gesture|look|glance|stare|gaze|peek|squint)[^_]*_/gi,
      
      // Catch any remaining asterisk patterns (more aggressive)
      /\*[^*]{1,50}\*/g,
      
      // Catch standalone action words in various formats
      /(?:^|\s)[\*\(\[_](?:laughs?|giggles?|smiles?|nods?|shrugs?|sighs?|blushes?|winks?|grins?|frowns?|chuckles?|snickers?|gasps?|whispers?|mumbles?|groans?|yawns?|stretches?|leans?|tilts?|shakes?|waves?|points?|gestures?)[\*\)\]_](?:\s|$)/gi
    ];

    // Patterns for messages that are entirely actions
    this.entireActionPatterns = [
      // Message is only asterisk actions and whitespace
      /^\s*\*[^*]*\*\s*$/,
      
      // Message is only parenthetical actions and whitespace
      /^\s*\([^)]*\)\s*$/,
      
      // Message is only bracketed actions and whitespace
      /^\s*\[[^\]]*\]\s*$/,
      
      // Message is only underscore actions and whitespace
      /^\s*_[^_]*_\s*$/,
      
      // Multiple actions with only whitespace between
      /^\s*(?:[\*\(\[_][^*\)\]_]*[\*\)\]_]\s*)+$/
    ];
  }

  /**
   * Remove RP actions from text
   * @param {string} text - The text to clean
   * @returns {string} - Cleaned text
   */
  removeActions(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let cleaned = text;

    // Apply all action patterns
    this.actionPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Clean up extra whitespace
    cleaned = cleaned
      .replace(/\s+/g, ' ') // Multiple spaces to single space
      .replace(/\s*([.!?])\s*/g, '$1 ') // Fix punctuation spacing
      .trim();

    return cleaned;
  }

  /**
   * Check if message is entirely an action
   * @param {string} text - The text to check
   * @returns {boolean} - True if message is entirely an action
   */
  isEntirelyAction(text) {
    if (!text || typeof text !== 'string') {
      return false;
    }

    // Check if text matches any entire action pattern
    return this.entireActionPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Process a message - remove actions or return null if entirely action
   * @param {string} text - The message text
   * @returns {string|null} - Cleaned text or null if message should be removed
   */
  formatMessage(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // If message is entirely an action, return null to indicate removal
    if (this.isEntirelyAction(text)) {
      console.log('Removing entire action message:', text);
      return null;
    }

    // Otherwise, remove actions from the text
    const cleaned = this.removeActions(text);
    
    // If cleaning resulted in empty/whitespace-only text, return null
    if (!cleaned.trim()) {
      console.log('Message became empty after cleaning:', text);
      return null;
    }

    // Log if we made changes
    if (cleaned !== text) {
      console.log('Cleaned RP actions from message:');
      console.log('Before:', text);
      console.log('After:', cleaned);
    }

    return cleaned;
  }

  /**
   * Test the formatter with sample text
   * @param {string} text - Text to test
   */
  test(text) {
    console.log('=== Text Formatter Test ===');
    console.log('Original:', text);
    console.log('Is entirely action:', this.isEntirelyAction(text));
    console.log('Formatted:', this.formatMessage(text));
    console.log('===========================');
  }
}

module.exports = new TextFormatter();