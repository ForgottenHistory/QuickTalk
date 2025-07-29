// Try to use built-in fetch (Node 18+) or fall back to axios
let fetchFunction;
try {
  // Node.js 18+ has built-in fetch
  fetchFunction = fetch;
} catch (error) {
  // Fall back to axios
  try {
    const axios = require('axios');
    fetchFunction = async (url, options = {}) => {
      const axiosConfig = {
        url,
        method: options.method || 'GET',
        headers: options.headers,
        data: options.body
      };
      const response = await axios(axiosConfig);
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: async () => response.data
      };
    };
  } catch (axiosError) {
    console.error('Neither fetch nor axios available');
    fetchFunction = null;
  }
}

class FeatherlessService {
  constructor() {
    this.baseURL = 'https://api.featherless.ai/v1';
    this.modelsCache = null;
    this.cacheExpiry = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Validate and clean model object
  validateModel(model) {
    if (!model || typeof model !== 'object') {
      return null;
    }

    // Ensure required fields exist
    const id = model.id || model.name || 'unknown';
    const name = model.name || model.id || 'Unknown Model';
    const model_class = model.model_class || 'unknown';
    const context_length = typeof model.context_length === 'number' ? model.context_length : 4096;
    const max_completion_tokens = typeof model.max_completion_tokens === 'number' ? model.max_completion_tokens : 2048;

    return {
      id,
      name,
      model_class,
      context_length,
      max_completion_tokens
    };
  }

  async getModels() {
    // Return cached models if still valid
    if (this.modelsCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      console.log('Returning cached models');
      return this.modelsCache;
    }

    // If no fetch function available, return fallback immediately
    if (!fetchFunction) {
      console.log('No HTTP client available, using fallback models');
      return this.getFallbackModels();
    }

    try {
      console.log('Fetching models from Featherless API...');
      const response = await fetchFunction(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from Featherless API');
      }

      console.log(`Raw API response contains ${data.data.length} models`);

      // Validate and clean each model
      const validModels = [];
      data.data.forEach((model, index) => {
        const validatedModel = this.validateModel(model);
        if (validatedModel) {
          validModels.push(validatedModel);
        } else {
          console.warn(`Skipping invalid model at index ${index}:`, model);
        }
      });

      if (validModels.length === 0) {
        throw new Error('No valid models found in API response');
      }

      // Sort models by name safely
      const sortedModels = validModels.sort((a, b) => {
        const nameA = (a.name || '').toString();
        const nameB = (b.name || '').toString();
        return nameA.localeCompare(nameB);
      });

      // Cache the results
      this.modelsCache = sortedModels;
      this.cacheExpiry = Date.now() + this.cacheTimeout;

      console.log(`Successfully processed ${sortedModels.length} valid models from Featherless API`);
      return sortedModels;

    } catch (error) {
      console.error('Failed to fetch models from Featherless API:', error.message);
      
      // Return fallback models if API fails
      return this.getFallbackModels();
    }
  }

  getFallbackModels() {
    console.log('Using fallback model (only verified Featherless model)');
    return [
      {
        id: 'moonshotai/Kimi-K2-Instruct',
        name: 'moonshotai/Kimi-K2-Instruct',
        model_class: 'kimi-k2',
        context_length: 16384,
        max_completion_tokens: 4096
      }
    ];
  }

  clearCache() {
    this.modelsCache = null;
    this.cacheExpiry = null;
  }
}

module.exports = new FeatherlessService();