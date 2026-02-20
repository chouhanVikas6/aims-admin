import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    className = "",
    id,
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-colors ${error
                        ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
                        : ""
                    } ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-error-500">{error}</p>
            )}
        </div>
    );
};

export default Input;
