import React from 'react';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  placeholder,
  options = [],
  children,
  className = '',
  helpText,
  icon: IconComponent,
  'aria-describedby': ariaDescribedBy
}) => {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  
  const describedBy = [
    error ? errorId : null,
    helpText ? helpId : null,
    ariaDescribedBy
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    const newValue = type === 'checkbox' ? e.target.checked : e.target.value;
    onChange(name, newValue);
  };

  const getFieldClasses = () => {
    const baseClasses = 'luna-form-field';
    const stateClasses = [
      error && 'luna-form-field--error',
      disabled && 'luna-form-field--disabled',
      required && 'luna-form-field--required'
    ].filter(Boolean);
    
    return [baseClasses, ...stateClasses, className].filter(Boolean).join(' ');
  };

  const renderInput = () => {
    const baseProps = {
      id: fieldId,
      name,
      value: type === 'checkbox' ? undefined : (value || ''),
      checked: type === 'checkbox' ? value : undefined,
      onChange: handleChange,
      onBlur: () => onBlur && onBlur(name),
      disabled,
      placeholder,
      required,
      'aria-invalid': error ? 'true' : 'false',
      'aria-describedby': describedBy || undefined,
    };

    switch (type) {
      case 'select':
        return (
          <div className="luna-form-select-wrapper">
            <select {...baseProps} className="luna-form-select">
              <option value="">Choose an option</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="luna-form-select-icon">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <textarea 
            {...baseProps} 
            rows={4}
            className="luna-form-textarea"
          />
        );

      case 'checkbox':
        return (
          <div className="luna-form-checkbox-wrapper">
            <input {...baseProps} type="checkbox" className="luna-form-checkbox" />
            <label htmlFor={fieldId} className="luna-form-checkbox-label">
              <span className="luna-form-checkbox-text">{label}</span>
              {required && <span className="luna-form-required-mark" aria-label="required">*</span>}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="luna-form-radio-group">
            {options.map((option) => (
              <label key={option.value} className="luna-form-radio-wrapper">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  onBlur={() => onBlur && onBlur(name)}
                  disabled={disabled}
                  required={required}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={describedBy || undefined}
                  className="luna-form-radio"
                />
                <span className="luna-form-radio-label">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <div className="luna-form-input-wrapper">
            {IconComponent && (
              <div className="luna-form-input-icon">
                <IconComponent aria-hidden="true" />
              </div>
            )}
            <input 
              {...baseProps} 
              type={type} 
              className={`luna-form-input ${IconComponent ? 'luna-form-input--with-icon' : ''}`}
            />
          </div>
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={getFieldClasses()}>
        {renderInput()}
        {error && (
          <p id={errorId} className="luna-form-error" role="alert">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={helpId} className="luna-form-help">
            {helpText}
          </p>
        )}
        {children}

        <style jsx>{`
          .luna-form-field {
            margin-bottom: var(--luna-space-4);
          }

          .luna-form-checkbox-wrapper {
            display: flex;
            align-items: flex-start;
            gap: var(--luna-space-3);
          }

          .luna-form-checkbox {
            width: 16px;
            height: 16px;
            border-radius: var(--luna-radius-sm);
            border: 1px solid var(--luna-grey-400);
            background-color: var(--luna-bg-primary);
            cursor: pointer;
            transition: all var(--luna-transition-fast);
            flex-shrink: 0;
            margin-top: 2px;
          }

          .luna-form-checkbox:checked {
            background-color: var(--luna-pink);
            border-color: var(--luna-pink);
            background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
            background-position: center;
            background-repeat: no-repeat;
          }

          .luna-form-checkbox:focus {
            outline: 2px solid var(--luna-pink);
            outline-offset: 2px;
          }

          .luna-form-checkbox:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .luna-form-checkbox-label {
            cursor: pointer;
            flex: 1;
          }

          .luna-form-checkbox-text {
            font-size: var(--luna-font-size-sm);
            color: var(--luna-text-primary);
            line-height: var(--luna-line-height-relaxed);
          }

          .luna-form-required-mark {
            color: var(--luna-red-500);
            margin-left: var(--luna-space-1);
          }

          .luna-form-error {
            margin-top: var(--luna-space-2);
            font-size: var(--luna-font-size-sm);
            color: var(--luna-red-600);
            display: flex;
            align-items: flex-start;
            gap: var(--luna-space-1);
          }

          .luna-form-help {
            margin-top: var(--luna-space-2);
            font-size: var(--luna-font-size-sm);
            color: var(--luna-text-muted);
            line-height: var(--luna-line-height-relaxed);
          }

          .luna-form-field--error .luna-form-checkbox {
            border-color: var(--luna-red-400);
          }

          .luna-form-field--disabled .luna-form-checkbox-text {
            color: var(--luna-text-disabled);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={getFieldClasses()}>
      <label htmlFor={fieldId} className="luna-form-label">
        {label}
        {required && <span className="luna-form-required-mark" aria-label="required">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <p id={errorId} className="luna-form-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zM7.002 11v2h2v-2h-2zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 4.005a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={helpId} className="luna-form-help">
          {helpText}
        </p>
      )}
      
      {children}

      <style jsx>{`
        .luna-form-field {
          margin-bottom: var(--luna-space-4);
        }

        .luna-form-label {
          display: block;
          font-size: var(--luna-font-size-sm);
          font-weight: var(--luna-font-weight-medium);
          color: var(--luna-text-primary);
          margin-bottom: var(--luna-space-2);
          line-height: var(--luna-line-height-snug);
        }

        .luna-form-required-mark {
          color: var(--luna-red-500);
          margin-left: var(--luna-space-1);
        }

        .luna-form-input-wrapper {
          position: relative;
        }

        .luna-form-input {
          display: block;
          width: 100%;
          padding: var(--luna-space-3);
          font-size: var(--luna-font-size-base);
          line-height: var(--luna-line-height-snug);
          color: var(--luna-text-primary);
          background-color: var(--luna-bg-primary);
          border: 1px solid var(--luna-grey-300);
          border-radius: var(--luna-radius-md);
          transition: all var(--luna-transition-fast);
          box-shadow: var(--luna-shadow-xs);
        }

        .luna-form-input--with-icon {
          padding-left: var(--luna-space-10);
        }

        .luna-form-input:focus {
          outline: none;
          border-color: var(--luna-pink);
          box-shadow: 0 0 0 3px var(--luna-pink-100);
        }

        .luna-form-input:disabled {
          background-color: var(--luna-grey-50);
          color: var(--luna-text-disabled);
          cursor: not-allowed;
        }

        .luna-form-input::placeholder {
          color: var(--luna-text-placeholder);
        }

        .luna-form-input-icon {
          position: absolute;
          left: var(--luna-space-3);
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: var(--luna-text-muted);
          pointer-events: none;
          z-index: 1;
        }

        .luna-form-select-wrapper {
          position: relative;
        }

        .luna-form-select {
          display: block;
          width: 100%;
          padding: var(--luna-space-3);
          padding-right: var(--luna-space-10);
          font-size: var(--luna-font-size-base);
          line-height: var(--luna-line-height-snug);
          color: var(--luna-text-primary);
          background-color: var(--luna-bg-primary);
          border: 1px solid var(--luna-grey-300);
          border-radius: var(--luna-radius-md);
          transition: all var(--luna-transition-fast);
          box-shadow: var(--luna-shadow-xs);
          appearance: none;
          cursor: pointer;
        }

        .luna-form-select:focus {
          outline: none;
          border-color: var(--luna-pink);
          box-shadow: 0 0 0 3px var(--luna-pink-100);
        }

        .luna-form-select:disabled {
          background-color: var(--luna-grey-50);
          color: var(--luna-text-disabled);
          cursor: not-allowed;
        }

        .luna-form-select-icon {
          position: absolute;
          right: var(--luna-space-3);
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: var(--luna-text-muted);
          pointer-events: none;
        }

        .luna-form-textarea {
          display: block;
          width: 100%;
          padding: var(--luna-space-3);
          font-size: var(--luna-font-size-base);
          line-height: var(--luna-line-height-relaxed);
          color: var(--luna-text-primary);
          background-color: var(--luna-bg-primary);
          border: 1px solid var(--luna-grey-300);
          border-radius: var(--luna-radius-md);
          transition: all var(--luna-transition-fast);
          box-shadow: var(--luna-shadow-xs);
          resize: vertical;
          min-height: 100px;
        }

        .luna-form-textarea:focus {
          outline: none;
          border-color: var(--luna-pink);
          box-shadow: 0 0 0 3px var(--luna-pink-100);
        }

        .luna-form-textarea:disabled {
          background-color: var(--luna-grey-50);
          color: var(--luna-text-disabled);
          cursor: not-allowed;
          resize: none;
        }

        .luna-form-textarea::placeholder {
          color: var(--luna-text-placeholder);
        }

        .luna-form-radio-group {
          display: flex;
          flex-direction: column;
          gap: var(--luna-space-3);
        }

        .luna-form-radio-wrapper {
          display: flex;
          align-items: center;
          gap: var(--luna-space-3);
          cursor: pointer;
        }

        .luna-form-radio {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid var(--luna-grey-400);
          background-color: var(--luna-bg-primary);
          cursor: pointer;
          transition: all var(--luna-transition-fast);
          flex-shrink: 0;
        }

        .luna-form-radio:checked {
          background-color: var(--luna-pink);
          border-color: var(--luna-pink);
          background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
          background-position: center;
          background-repeat: no-repeat;
        }

        .luna-form-radio:focus {
          outline: 2px solid var(--luna-pink);
          outline-offset: 2px;
        }

        .luna-form-radio:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .luna-form-radio-label {
          font-size: var(--luna-font-size-sm);
          color: var(--luna-text-primary);
          cursor: pointer;
        }

        .luna-form-error {
          margin-top: var(--luna-space-2);
          font-size: var(--luna-font-size-sm);
          color: var(--luna-red-600);
          display: flex;
          align-items: flex-start;
          gap: var(--luna-space-1);
        }

        .luna-form-help {
          margin-top: var(--luna-space-2);
          font-size: var(--luna-font-size-sm);
          color: var(--luna-text-muted);
          line-height: var(--luna-line-height-relaxed);
        }

        /* Error states */
        .luna-form-field--error .luna-form-input,
        .luna-form-field--error .luna-form-select,
        .luna-form-field--error .luna-form-textarea {
          border-color: var(--luna-red-400);
        }

        .luna-form-field--error .luna-form-input:focus,
        .luna-form-field--error .luna-form-select:focus,
        .luna-form-field--error .luna-form-textarea:focus {
          border-color: var(--luna-red-500);
          box-shadow: 0 0 0 3px var(--luna-red-100);
        }

        .luna-form-field--error .luna-form-radio {
          border-color: var(--luna-red-400);
        }

        /* Disabled states */
        .luna-form-field--disabled .luna-form-label {
          color: var(--luna-text-disabled);
        }

        .luna-form-field--disabled .luna-form-radio-label {
          color: var(--luna-text-disabled);
        }

        .luna-form-field--disabled .luna-form-radio-wrapper {
          cursor: not-allowed;
        }

        /* Dark mode: keep LUNA light form fields for readability */
        @media (prefers-color-scheme: dark) {
          .luna-form-input,
          .luna-form-select,
          .luna-form-textarea {
            background-color: var(--luna-bg-primary);
            border-color: var(--luna-grey-300);
            color: var(--luna-text-primary);
          }

          .luna-form-input:disabled,
          .luna-form-select:disabled,
          .luna-form-textarea:disabled {
            background-color: var(--luna-grey-100);
          }

          .luna-form-checkbox,
          .luna-form-radio {
            background-color: var(--luna-bg-primary);
            border-color: var(--luna-grey-300);
          }
        }

        /* High contrast */
        @media (prefers-contrast: high) {
          .luna-form-input,
          .luna-form-select,
          .luna-form-textarea,
          .luna-form-checkbox,
          .luna-form-radio {
            border-width: 2px;
          }

          .luna-form-input:focus,
          .luna-form-select:focus,
          .luna-form-textarea:focus {
            box-shadow: 0 0 0 3px var(--luna-text-primary);
          }
        }
      `}</style>
    </div>
  );
};

export default FormField;