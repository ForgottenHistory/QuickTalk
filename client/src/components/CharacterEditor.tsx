import React, { useState, useEffect } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import { Modal, Button, Avatar } from './shared';
import { CharacterCardV2 } from '../types/character';

const CharacterEditor: React.FC = () => {
  const { state, dispatch, createCharacter, updateCharacter } = useCharacterContext();
  const isEditing = state.editingCharacter !== null;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: '',
    avatar: '🤖',
    creator_notes: '',
    system_prompt: '',
    tags: [] as string[],
    creator: '',
    character_version: '1.0'
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Common emoji options for avatars
  const emojiOptions = [
    '🤖', '🌙', '⚡', '🦉', '🎭', '🔬', '🎨', '🎵', '🌟', '🔥',
    '💎', '🌈', '🎯', '🚀', '🌸', '⭐', '🌊', '🎪', '🎲', '🎹'
  ];

  useEffect(() => {
    if (state.editingCharacter) {
      const char = state.editingCharacter.data;
      setFormData({
        name: char.name,
        description: char.description,
        personality: char.personality,
        avatar: char.avatar,
        creator_notes: char.creator_notes,
        system_prompt: char.system_prompt,
        tags: char.tags,
        creator: char.creator,
        character_version: char.character_version
      });
    } else {
      setFormData({
        name: '',
        description: '',
        personality: '',
        avatar: '🤖',
        creator_notes: '',
        system_prompt: '',
        tags: [],
        creator: '',
        character_version: '1.0'
      });
    }
  }, [state.editingCharacter]);

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    dispatch({ type: 'STOP_EDITING' });
  };

  const hasUnsavedChanges = () => {
    if (!state.editingCharacter) {
      return formData.name.trim() !== '' || formData.description.trim() !== '';
    }
    
    const original = state.editingCharacter.data;
    return (
      formData.name !== original.name ||
      formData.description !== original.description ||
      formData.personality !== original.personality ||
      formData.avatar !== original.avatar ||
      formData.creator_notes !== original.creator_notes ||
      formData.system_prompt !== original.system_prompt ||
      JSON.stringify(formData.tags) !== JSON.stringify(original.tags) ||
      formData.creator !== original.creator ||
      formData.character_version !== original.character_version
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Optimize the image before setting it
      const optimizedDataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            
            // Resize to max 256px square
            const maxSize = 256;
            const size = Math.min(maxSize, Math.max(img.width, img.height));
            canvas.width = size;
            canvas.height = size;
            
            // Draw image centered and scaled
            const scale = size / Math.max(img.width, img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (size - scaledWidth) / 2;
            const y = (size - scaledHeight) / 2;
            
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(dataUrl);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      handleInputChange('avatar', optimizedDataUrl);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Character name is required');
      return;
    }

    if (!formData.avatar.trim()) {
      alert('Character avatar is required');
      return;
    }

    setIsSaving(true);
    
    try {
      const characterData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        personality: formData.personality.trim() || formData.description.trim(),
        creator_notes: formData.creator_notes.trim(),
        system_prompt: formData.system_prompt.trim(),
        creator: formData.creator.trim()
      };

      if (isEditing) {
        await updateCharacter(state.editingCharacter!.data.id, characterData);
      } else {
        await createCharacter(characterData);
      }
      
      dispatch({ type: 'STOP_EDITING' });
    } catch (error) {
      console.error('Failed to save character:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isVisible={true} onClose={handleClose} className="character-editor-modal">
      <div className="character-editor-header">
        <h3 className="character-editor-title">
          {isEditing ? '✏️ Edit Character' : '➕ Create New Character'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="character-editor-form">
        <div className="character-editor-content">
          {/* Basic Info */}
          <div className="character-editor-section">
            <h4 className="character-editor-section-title">Basic Information</h4>
            
            <div className="character-editor-row">
              <div className="character-editor-field">
                <label className="character-editor-label">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="character-editor-input"
                  placeholder="Character name"
                  required
                />
              </div>

              <div className="character-editor-field">
                <label className="character-editor-label">Avatar *</label>
                <div className="character-avatar-selector">
                  {formData.avatar.startsWith('data:') ? (
                    <img 
                      src={formData.avatar} 
                      alt="Character Avatar" 
                      className="character-avatar-image"
                    />
                  ) : (
                    <Avatar emoji={formData.avatar} size="large" />
                  )}
                  
                  <div className="character-avatar-options">
                    <div className="character-emoji-grid">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleInputChange('avatar', emoji)}
                          className={`character-emoji-option ${
                            formData.avatar === emoji ? 'selected' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    
                    <div className="character-avatar-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="character-avatar-input"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload" className="character-avatar-upload-label">
                        📁 Upload Image
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="character-editor-field">
              <label className="character-editor-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="character-editor-textarea"
                placeholder="Brief description of the character"
                rows={3}
              />
            </div>

            <div className="character-editor-field">
              <label className="character-editor-label">Personality</label>
              <textarea
                value={formData.personality}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                className="character-editor-textarea"
                placeholder="Character's personality traits and behavior"
                rows={3}
              />
              <small className="character-editor-hint">
                If left empty, will use the description
              </small>
            </div>
          </div>

          {/* Tags */}
          <div className="character-editor-section">
            <h4 className="character-editor-section-title">Tags</h4>
            
            <div className="character-editor-field">
              <div className="character-tag-input-group">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="character-editor-input"
                  placeholder="Add a tag"
                />
                <Button onClick={handleAddTag} variant="secondary">
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="character-editor-tags">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="character-editor-tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="character-editor-tag-remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="character-editor-section">
            <h4 className="character-editor-section-title">Advanced Settings</h4>
            
            <div className="character-editor-row">
              <div className="character-editor-field">
                <label className="character-editor-label">Creator</label>
                <input
                  type="text"
                  value={formData.creator}
                  onChange={(e) => handleInputChange('creator', e.target.value)}
                  className="character-editor-input"
                  placeholder="Character creator name"
                />
              </div>

              <div className="character-editor-field">
                <label className="character-editor-label">Version</label>
                <input
                  type="text"
                  value={formData.character_version}
                  onChange={(e) => handleInputChange('character_version', e.target.value)}
                  className="character-editor-input"
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="character-editor-field">
              <label className="character-editor-label">Creator Notes</label>
              <textarea
                value={formData.creator_notes}
                onChange={(e) => handleInputChange('creator_notes', e.target.value)}
                className="character-editor-textarea"
                placeholder="Notes for character creators or users"
                rows={3}
              />
            </div>

            <div className="character-editor-field">
              <label className="character-editor-label">System Prompt</label>
              <textarea
                value={formData.system_prompt}
                onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                className="character-editor-textarea"
                placeholder="Custom system prompt for this character"
                rows={4}
              />
              <small className="character-editor-hint">
                Advanced: Custom system prompt will override default AI behavior
              </small>
            </div>
          </div>
        </div>

        <div className="character-editor-footer">
          <Button
            onClick={handleClose}
            variant="secondary"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving || !formData.name.trim()}
          >
            {isSaving ? '⏳ Saving...' : isEditing ? 'Update Character' : 'Create Character'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CharacterEditor;