import React from 'react';
import { Button } from './shared';

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
  <div className={`form-group ${className}`}>
    {label && <label className="form-label">{label}</label>}
    {children}
    {description && (
      <small className="form-description">{description}</small>
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
    className="form-input"
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
    className="form-input form-select"
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
  <div className="checkbox-group">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="form-checkbox"
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
      className="form-range"
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
    <Button
      onClick={onClick}
      disabled={loading}
      variant="secondary"
    >
      {loading ? '⏳ Resetting...' : `🔄 Reset ${type} to Defaults`}
    </Button>
    <small className="form-description">
      This will immediately reset and save the {type.toLowerCase()} settings
    </small>
  </div>
);