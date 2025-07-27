import React from 'react';

interface SettingFieldProps {
  label?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingField: React.FC<SettingFieldProps> = ({ 
  label, 
  description, 
  children, 
  className = '' 
}) => (
  <div className={`setting-field ${className}`}>
    {label && <label className="setting-label">{label}</label>}
    {children}
    {description && (
      <small className="setting-description">{description}</small>
    )}
  </div>
);

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value, onChange, min, max, step = 1
}) => (
  <input
    type="number"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value))}
    className="setting-input"
  />
);

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export const SelectInput: React.FC<SelectInputProps> = ({
  value, onChange, options
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="setting-input setting-select"
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

interface CheckboxInputProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
}

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  checked, onChange, label, id
}) => (
  <div className="checkbox-container">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="setting-checkbox"
    />
    <label htmlFor={id} className="checkbox-label">{label}</label>
  </div>
);

interface RangeInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
}

export const RangeInput: React.FC<RangeInputProps> = ({
  value, onChange, min, max, step, minLabel, maxLabel
}) => (
  <div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="setting-range"
    />
    <div className="range-labels">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  </div>
);

export const ResetButton: React.FC<{
  onClick: () => void;
  loading: boolean;
  type: string;
}> = ({ onClick, loading, type }) => (
  <div className="reset-section">
    <button
      onClick={onClick}
      disabled={loading}
      className="reset-button"
    >
      {loading ? '⏳ Resetting...' : `🔄 Reset ${type} to Defaults`}
    </button>
    <small className="setting-description">
      This will immediately reset and save the {type.toLowerCase()} settings
    </small>
  </div>
);