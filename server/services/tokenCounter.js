class TokenCounter {
  /**
   * Estimate token count for text
   * This is a rough approximation - actual tokenization varies by model
   * Generally: 1 token ≈ 4 characters for English text
   * But can vary from 3-6 characters depending on content
   */
  estimateTokens(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }

    // More accurate estimation based on OpenAI's guidelines
    // Account for common patterns in chat messages
    
    // Base character count
    let charCount = text.length;
    
    // Adjust for common patterns that use fewer tokens
    const wordCount = text.split(/\s+/).length;
    const punctuationCount = (text.match(/[.!?,:;]/g) || []).length;
    const numberCount = (text.match(/\d+/g) || []).length;
    
    // More sophisticated estimation
    // Common words and punctuation are more token-efficient
    let estimatedTokens = Math.ceil(charCount / 4);
    
    // Adjust for efficiency patterns
    if (wordCount > 0) {
      // Common English words are often 1 token regardless of length
      const avgWordLength = charCount / wordCount;
      if (avgWordLength < 5) {
        // Shorter average words = more efficient tokenization
        estimatedTokens = Math.ceil(estimatedTokens * 0.85);
      }
    }
    
    // Add small buffer for special tokens, formatting, etc.
    estimatedTokens = Math.ceil(estimatedTokens * 1.1);
    
    return Math.max(1, estimatedTokens); // Minimum 1 token
  }

  /**
   * Estimate tokens for a message object
   */
  estimateMessageTokens(message) {
    if (!message || !message.text) {
      return 0;
    }

    // Account for role overhead in API format
    const roleTokens = 4; // Roughly: {"role": "user", "content": "..."}
    const contentTokens = this.estimateTokens(message.text);
    
    return roleTokens + contentTokens;
  }

  /**
   * Get messages that fit within token limit
   * Returns array of messages in chronological order
   */
  getMessagesWithinTokenLimit(messages, tokenLimit) {
    if (!Array.isArray(messages) || tokenLimit <= 0) {
      return [];
    }

    const result = [];
    let totalTokens = 0;

    // Work backwards from most recent messages
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = this.estimateMessageTokens(message);
      
      // Check if adding this message would exceed the limit
      if (totalTokens + messageTokens > tokenLimit) {
        break;
      }
      
      result.unshift(message); // Add to beginning to maintain chronological order
      totalTokens += messageTokens;
    }

    console.log(`Selected ${result.length}/${messages.length} messages using ${totalTokens}/${tokenLimit} tokens`);
    
    return result;
  }

  /**
   * Estimate total tokens for an array of messages
   */
  estimateTotalTokens(messages) {
    if (!Array.isArray(messages)) {
      return 0;
    }

    return messages.reduce((total, message) => {
      return total + this.estimateMessageTokens(message);
    }, 0);
  }

  /**
   * Debug function to show token breakdown
   */
  debugTokenUsage(messages, systemPrompt = '', authorsNote = '') {
    const systemTokens = this.estimateTokens(systemPrompt);
    const authorsTokens = this.estimateTokens(authorsNote);
    const messageTokens = this.estimateTotalTokens(messages);
    
    console.log('=== Token Usage Breakdown ===');
    console.log(`System Prompt: ${systemTokens} tokens`);
    console.log(`Messages: ${messageTokens} tokens (${messages.length} messages)`);
    console.log(`Author's Note: ${authorsTokens} tokens`);
    console.log(`Total: ${systemTokens + messageTokens + authorsTokens} tokens`);
    console.log('==============================');
    
    return {
      system: systemTokens,
      messages: messageTokens,
      authors: authorsTokens,
      total: systemTokens + messageTokens + authorsTokens
    };
  }
}

module.exports = new TokenCounter();