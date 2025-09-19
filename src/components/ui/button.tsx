// Minimal button component for compatibility with other UI components
// Uses CSS classes from index.css instead of React variants

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'hero' | 'glass' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
  asChild?: boolean
}

// Export buttonVariants for compatibility with other UI components
export const buttonVariants = (props: { variant?: string; size?: string; className?: string } = {}) => {
  const { variant = 'default', size = 'default', className } = props
  
  // Map variants to CSS classes
  const variantClasses = {
    default: 'btn-default',
    primary: 'btn-primary',
    hero: 'btn-hero',
    glass: 'btn-glass',
    destructive: 'btn-destructive',
    outline: 'btn-outline', 
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    link: 'btn-link'
  }
  
  // Map sizes to CSS classes  
  const sizeClasses = {
    default: '',
    sm: 'btn-sm',
    lg: 'btn-lg',
    xl: 'btn-xl',
    icon: 'btn-icon'
  }
  
  return cn(
    variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
    sizeClasses[size as keyof typeof sizeClasses],
    className
  )
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"