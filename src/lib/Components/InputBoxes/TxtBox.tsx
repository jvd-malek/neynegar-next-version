import React from 'react';

type ErrorType = {
  type: string;
  state: boolean;
  message?: string;
};

interface TxtBoxProps {
  id: string;
  type: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: boolean;
  errorMessage?: string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  autoComplete?: string;
}

const TxtBox: React.FC<TxtBoxProps> = ({
  id,
  type,
  value,
  onChange,
  label,
  error = false,
  errorMessage = `لطفا ${label} را به درستی وارد نمایید`,
  readOnly = false,
  disabled = false,
  className = '',
  inputMode = 'text',
  autoComplete = 'off',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        disabled={disabled}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={`
          peer px-4 py-5 block w-full rounded-lg text-sm placeholder:text-transparent 
          outline-none border-[3px] border-solid
          focus:pt-7 focus:pb-3 
          [&:not(:placeholder-shown)]:pt-7 
          [&:not(:placeholder-shown)]:pb-3 
          autofill:pt-7 autofill:pb-3
          ${
            error
              ? 'focus:border-rose-600 border-rose-500 bg-rose-300 text-rose-700'
              : 'focus:border-slate-700 bg-slate-400 border-transparent text-neutral-800 focus:ring-slate-600'
          }
          ${readOnly || disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
        placeholder=" "
      />

      <label
        htmlFor={id}
        className={`
          absolute top-0 start-0 px-4 py-5 h-full text-sm truncate 
          pointer-events-none transition ease-in-out duration-100 
          border border-transparent origin-[0_0] 
          peer-disabled:opacity-50 peer-disabled:pointer-events-none 
          peer-focus:scale-90 peer-focus:translate-x-0.5 peer-focus:-translate-y-3 
          peer-focus:text-neutral-700 
          peer-[:not(:placeholder-shown)]:scale-90 
          peer-[:not(:placeholder-shown)]:translate-x-0.5 
          peer-[:not(:placeholder-shown)]:-translate-y-3 
          peer-[:not(:placeholder-shown)]:text-neutral-700
          ${error ? 'text-rose-600 peer-focus:text-rose-700' : 'text-neutral-700'}
        `}
      >
        {label}
      </label>

      {error && (
        <p 
          className="text-xs text-rose-200 leading-none mt-1 transition-all duration-200"
          role="alert"
          aria-live="polite"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default TxtBox;