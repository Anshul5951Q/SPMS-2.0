import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  selected?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = false,
  selected = false,
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-sm border p-4';
  const hoverStyles = hover ? 'transition-all duration-200 hover:shadow-md cursor-pointer' : '';
  const selectedStyles = selected ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200';
  const clickableStyles = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${selectedStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;