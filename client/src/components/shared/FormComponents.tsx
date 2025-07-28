import React from 'react';
import { Button } from './Button';

// Base form field wrapper
interface FormFieldProps {
  label?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  description, 
  required, 
  children, 
  className = '' 
}) => (
  <div className={`form-field ${className}`}>
    {label && (
      <label className="form-field-label">
        {label}
        {required && <span className="form-field-required">*</span>}
      </label>
    )}
    {children}
    {description && (
      <small className="form-field-description">{description}</small>
    )}
  </div>
);

// Text input
interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  value, onChange, placeholder, required, disabled, className = ''
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    className={`form-input ${className}`}
  />
);

// Textarea input
interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  value, onChange, placeholder, rows = 3, required, disabled, className = ''
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    required={required}
    disabled={disabled}
    className={`form-input form-textarea ${className}`}
  />
);

// Tag input component
interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags, onAddTag, onRemoveTag, placeholder = "Add a tag"
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleAdd = () => {
    const tag = inputValue.trim();
    if (tag && !tags.includes(tag)) {
      onAddTag(tag);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="tag-input-container">
      <div className="tag-input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="form-input"
          placeholder={placeholder}
        />
        <Button onClick={handleAdd} variant="secondary">
          Add
        </Button>
      </div>
      
      {tags.length > 0 && (
        <div className="tag-list">
          {tags.map((tag) => (
            <span key={tag} className="tag-item">
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="tag-remove"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// File upload component
interface FileUploadProps {
  accept: string;
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
  children: React.ReactNode;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept, multiple, onChange, children, className = ''
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => onChange(e.target.files)}
        style={{ display: 'none' }}
      />
      <div onClick={handleClick} className={`file-upload ${className}`}>
        {children}
      </div>
    </>
  );
};

// Modal footer with action buttons
interface ModalFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  onCancel, onSubmit, submitText = "Save", cancelText = "Cancel", 
  isSubmitting = false, canSubmit = true
}) => (
  <div className="modal-footer">
    <Button
      onClick={onCancel}
      variant="secondary"
      disabled={isSubmitting}
    >
      {cancelText}
    </Button>
    <Button
      onClick={onSubmit}
      variant="primary"
      disabled={!canSubmit || isSubmitting}
    >
      {isSubmitting ? '⏳ Saving...' : submitText}
    </Button>
  </div>
);