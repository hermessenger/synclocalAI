
import React from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  options: { value: string | number; label: string }[];
  className?: string;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>; // Added Icon prop
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  label,
  options,
  className = "",
  required,
  Icon, // Destructure Icon prop
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="flex items-center text-sm font-medium text-slate-700 mb-1">
        {Icon && <Icon className="w-4 h-4 mr-2 text-slate-500" />} {/* Render Icon if provided */}
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        name={id}
        required={required}
        {...props}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md shadow-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
