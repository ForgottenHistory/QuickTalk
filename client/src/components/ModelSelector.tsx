import React, { useState, useEffect } from 'react';
import { FeatherlessModel, modelsService } from '../services/modelsService';
import { Button } from './shared';

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelSelect,
  disabled = false
}) => {
  const [models, setModels] = useState<FeatherlessModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const modelsPerPage = 10;

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedModels = await modelsService.getModels();
      setModels(fetchedModels);
    } catch (err) {
      setError('Failed to load models. Using fallback list.');
      console.error('Error loading models:', err);
      // Set fallback models
      setModels([
        { id: 'moonshotai/Kimi-K2-Instruct', name: 'moonshotai/Kimi-K2-Instruct', model_class: 'kimi-k2', context_length: 16384, max_completion_tokens: 4096 },
        { id: 'anthropic/claude-3-sonnet', name: 'claude-3-sonnet', model_class: 'claude-3', context_length: 200000, max_completion_tokens: 4096 },
        { id: 'openai/gpt-4-turbo', name: 'gpt-4-turbo', model_class: 'gpt-4', context_length: 128000, max_completion_tokens: 4096 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const refreshModels = async () => {
    try {
      setLoading(true);
      await modelsService.refreshModels();
      await loadModels();
    } catch (err) {
      setError('Failed to refresh models');
      console.error('Error refreshing models:', err);
    }
  };

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.model_class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredModels.length / modelsPerPage);
  const startIndex = (currentPage - 1) * modelsPerPage;
  const paginatedModels = filteredModels.slice(startIndex, startIndex + modelsPerPage);

  const selectedModelInfo = models.find(m => m.id === selectedModel);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="model-selector">
        <div className="model-selector-loading">
          🤖 Loading models...
        </div>
      </div>
    );
  }

  return (
    <div className="model-selector">
      {/* Current Selection Display */}
      <div className="model-selector-current">
        <div className="model-selector-selected">
          <div className="model-info">
            <span className="model-name">
              {selectedModelInfo?.name || selectedModel}
            </span>
            {selectedModelInfo && (
              <div className="model-details">
                <span className="model-class">{selectedModelInfo.model_class}</span>
                <span className="model-context">
                  {selectedModelInfo.context_length.toLocaleString()} ctx
                </span>
                <span className="model-max-tokens">
                  {selectedModelInfo.max_completion_tokens.toLocaleString()} max
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="secondary"
            disabled={disabled}
          >
            {isExpanded ? '▲ Hide' : '▼ Change Model'}
          </Button>
        </div>
      </div>

      {/* Expanded Model Selector */}
      {isExpanded && (
        <div className="model-selector-expanded">
          {error && (
            <div className="model-selector-error">
              ⚠️ {error}
            </div>
          )}

          {/* Controls */}
          <div className="model-selector-controls">
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="model-search-input"
            />
            <Button onClick={refreshModels} variant="secondary" disabled={loading}>
              🔄 Refresh
            </Button>
          </div>

          {/* Model List */}
          <div className="model-selector-list">
            {paginatedModels.map((model) => (
              <div
                key={model.id}
                className={`model-option ${model.id === selectedModel ? 'selected' : ''}`}
                onClick={() => {
                  onModelSelect(model.id);
                  setIsExpanded(false);
                }}
              >
                <div className="model-option-info">
                  <span className="model-option-name">{model.name}</span>
                  <div className="model-option-details">
                    <span className="model-option-class">{model.model_class}</span>
                    <span className="model-option-context">
                      {model.context_length.toLocaleString()} context
                    </span>
                    <span className="model-option-max">
                      {model.max_completion_tokens.toLocaleString()} max tokens
                    </span>
                  </div>
                </div>
                {model.id === selectedModel && (
                  <span className="model-option-check">✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="model-selector-pagination">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="secondary"
              >
                ← Previous
              </Button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({filteredModels.length} models)
              </span>
              
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;