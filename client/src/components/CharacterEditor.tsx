import React, { useState, useEffect } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import { Modal, Avatar, FormField, TextInput, TextArea, TagInput, FileUpload, Button } from './shared';

const EMOJI_OPTIONS = [
  '🤖', '🌙', '⚡', '🦉', '🎭', '🔬', '🎨', '🎵', '🌟', '🔥',
  '💎', '🌈', '🎯', '🚀', '🌸', '⭐', '🌊', '🎪', '🎲', '🎹'
];

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
  
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data
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

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    return Object.keys(formData).some(key => 
      JSON.stringify(formData[key as keyof typeof formData]) !== 
      JSON.stringify(original[key as keyof typeof original])
    );
  };

  const handleAvatarUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    try {
      const optimizedDataUrl = await optimizeImage(file);
      updateField('avatar', optimizedDataUrl);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          const maxSize = 256;
          const size = Math.min(maxSize, Math.max(img.width, img.height));
          canvas.width = size;
          canvas.height = size;
          
          const scale = size / Math.max(img.width, img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (size - scaledWidth) / 2;
          const y = (size - scaledHeight) / 2;
          
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Character name is required');
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

      <div className="character-editor-form">
        <div className="character-editor-content">
          {/* Basic Info */}
          <div className="character-editor-section">
            <h4 className="character-editor-section-title">Basic Information</h4>
            
            <div className="character-editor-row">
              <FormField label="Name" required>
                <TextInput
                  value={formData.name}
                  onChange={(value) => updateField('name', value)}
                  placeholder="Character name"
                  required
                />
              </FormField>

              <FormField label="Avatar" required>
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
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => updateField('avatar', emoji)}
                          className={`character-emoji-option ${
                            formData.avatar === emoji ? 'selected' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    
                    <FileUpload
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="character-avatar-upload"
                    >
                      <div className="character-avatar-upload-label">
                        📁 Upload Image
                      </div>
                    </FileUpload>
                  </div>
                </div>
              </FormField>
            </div>

            <FormField label="Description">
              <TextArea
                value={formData.description}
                onChange={(value) => updateField('description', value)}
                placeholder="Brief description of the character"
                rows={3}
              />
            </FormField>

            <FormField label="Personality" description="If left empty, will use the description">
              <TextArea
                value={formData.personality}
                onChange={(value) => updateField('personality', value)}
                placeholder="Character's personality traits and behavior"
                rows={3}
              />
            </FormField>
          </div>

          {/* Tags */}
          <div className="character-editor-section">
            <h4 className="character-editor-section-title">Tags</h4>
            <FormField>
              <TagInput
                tags={formData.tags}
                onAddTag={(tag) => updateField('tags', [...formData.tags, tag])}
                onRemoveTag={(tag) => updateField('tags', formData.tags.filter(t => t !== tag))}
                placeholder="Add a tag"
              />
            </FormField>
          </div>

          {/* Advanced Settings */}
          <div className="character-editor-section">
            <h4 className="character-editor-section-title">Advanced Settings</h4>
            
            <div className="character-editor-row">
              <FormField label="Creator">
                <TextInput
                  value={formData.creator}
                  onChange={(value) => updateField('creator', value)}
                  placeholder="Character creator name"
                />
              </FormField>

              <FormField label="Version">
                <TextInput
                  value={formData.character_version}
                  onChange={(value) => updateField('character_version', value)}
                  placeholder="1.0"
                />
              </FormField>
            </div>

            <FormField label="Creator Notes">
              <TextArea
                value={formData.creator_notes}
                onChange={(value) => updateField('creator_notes', value)}
                placeholder="Notes for character creators or users"
                rows={3}
              />
            </FormField>

            <FormField 
              label="System Prompt" 
              description="Advanced: Custom system prompt will override default AI behavior"
            >
              <TextArea
                value={formData.system_prompt}
                onChange={(value) => updateField('system_prompt', value)}
                placeholder="Custom system prompt for this character"
                rows={4}
              />
            </FormField>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="character-editor-footer">
          <Button
            onClick={handleClose}
            variant="secondary"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={!formData.name.trim() || isSaving}
          >
            {isSaving ? '⏳ Saving...' : (isEditing ? 'Update Character' : 'Create Character')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CharacterEditor;