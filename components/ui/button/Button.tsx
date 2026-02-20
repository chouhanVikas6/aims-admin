import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "md",
    children,
    startIcon,
    endIcon,
    className = "",
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
        primary:
            "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600",
        secondary:
            "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
        outline:
            "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
        danger:
            "bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 dark:bg-error-500 dark:hover:bg-error-600",
    };

    const sizeStyles = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            {...props}
        >
            {startIcon && <span>{startIcon}</span>}
            {children}
            {endIcon && <span>{endIcon}</span>}
        </button>
    );
};

export default Button;
