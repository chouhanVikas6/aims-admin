import React from "react";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
    label,
    error,
    options,
    placeholder,
    className = "",
    id,
    ...props
}) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors appearance-none ${error
                        ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
                        : ""
                    } ${className}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1.5 text-sm text-error-500">{error}</p>
            )}
        </div>
    );
};

export default Select;
