import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
    variant: 'buy' | 'sell' | 'default';
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ variant, children, onClick, disabled = false }) => {
    const variantClass = styles[variant];

    return (
        <button
            className={`${styles.button} ${variantClass} ${disabled ? styles.disabled : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
