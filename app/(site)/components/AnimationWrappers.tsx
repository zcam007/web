'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// Fade in animation wrapper
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = "",
  ...props 
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide in from left animation
export function SlideInLeft({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = "",
  ...props 
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide in from right animation
export function SlideInRight({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = "",
  ...props 
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale animation for emphasis
export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = "",
  ...props 
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scroll-triggered animation wrapper
export function ScrollAnimation({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = "",
  threshold = 0.1,
  ...props 
}: { 
  children: ReactNode; 
  delay?: number; 
  duration?: number;
  className?: string;
  threshold?: number;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Staggered children animation
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = "",
  ...props 
}: { 
  children: ReactNode; 
  staggerDelay?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Individual staggered item
export function StaggerItem({ 
  children, 
  className = "",
  ...props 
}: { 
  children: ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scroll-triggered stagger container
export function ScrollStagger({ 
  children, 
  staggerDelay = 0.1,
  className = "",
  threshold = 0.1,
  ...props 
}: { 
  children: ReactNode; 
  staggerDelay?: number;
  className?: string;
  threshold?: number;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Hover scale animation
export function HoverScale({ 
  children, 
  scale = 1.05,
  className = "",
  ...props 
}: { 
  children: ReactNode; 
  scale?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Tap/click animation
export function TapScale({ 
  children, 
  scale = 0.95,
  className = "",
  ...props 
}: { 
  children: ReactNode; 
  scale?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}