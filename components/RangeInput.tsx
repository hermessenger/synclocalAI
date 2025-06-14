
import React from 'react';

interface RangeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  className?: string;
}

export const RangeInput: React.FC<RangeInputProps> = ({
  id,
  label,
  className = "",
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="range"
        {...props}
        className="mt-1 block w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 accent-sky-600"
      />
    </div>
  );
};
