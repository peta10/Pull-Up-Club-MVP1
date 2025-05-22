import * as React from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  underline?: boolean;
}

export const Link: React.FC<LinkProps> = ({ 
  href, 
  children, 
  className = '', 
  underline = false,
  ...props 
}) => {
  // Base styles
  const baseStyles = "transition-colors duration-200";
  const underlineStyles = underline ? "underline-offset-4 hover:underline" : "";
  
  // Combine base styles with any additional classes
  const combinedStyles = `${baseStyles} ${underlineStyles} ${className}`;
  
  return (
    <a href={href} className={combinedStyles} {...props}>
      {children}
    </a>
  );
};