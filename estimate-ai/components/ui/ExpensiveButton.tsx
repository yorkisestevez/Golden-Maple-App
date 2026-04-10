'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ExpensiveButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ExpensiveButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ExpensiveButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
  };

  const variants = {
    primary: 'accent-gradient text-white shadow-xl shadow-blue-500/20',
    secondary: 'success-gradient text-white shadow-xl shadow-emerald-500/20',
    outline: 'bg-white text-slate-900 border border-slate-200 hover:border-blue-300 hover:bg-slate-50',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01, translateY: -1 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'group relative overflow-hidden rounded-xl font-bold tracking-tight transition-all duration-300',
        sizeClasses[size],
        variants[variant],
        'light-sweep-wrap card-shadow',
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Subtle internal glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
    </motion.button>
  );
}
