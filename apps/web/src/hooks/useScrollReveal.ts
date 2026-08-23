"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";

type MarginType = string | { top?: number; right?: number; bottom?: number; left?: number };

interface UseScrollRevealOptions {
  amount?: number;
  margin?: MarginType;
  once?: boolean;
  triggerOnce?: boolean;
}

interface UseScrollRevealReturn<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T | null>;
  isInView: boolean;
}

/**
 * Hook for bidirectional scroll-triggered animations.
 * 
 * @param options - Configuration options
 * @param options.amount - Minimum amount of element visible to trigger (0-1)
 * @param options.margin - Root margin for intersection observer (e.g., "0px 0px -100px")
 * @param options.once - If true, animation only plays once and stays visible
 * @param options.triggerOnce - Deprecated, use once instead
 * 
 * @returns Object with ref and isInView state
 * 
 * Usage:
 * const { ref, isInView } = useScrollReveal<HTMLDivElement>({ amount: 0.15 });
 * 
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial="hidden"
 *     animate={isInView ? "visible" : "hidden"}
 *     variants={variants}
 *   />
 * );
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options: UseScrollRevealOptions = {}): UseScrollRevealReturn<T> {
  const { amount = 0.15, margin = "0px", once = false } = options;
  
  const ref = useRef<T | null>(null);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  
  const isInView = useInView(ref, {
    amount,
    margin: margin as any,
    once: once || false,
  });
  
  // Track if element has ever been in view (for once: true behavior)
  const hasBeenInViewRef = useRef(false);
  
  useEffect(() => {
    if (isInView && !hasBeenInViewRef.current) {
      hasBeenInViewRef.current = true;
      setHasBeenInView(true);
    }
  }, [isInView]);
  
  // Determine if element should be animated
  // If once is true, stay visible after first view
  // Otherwise, animate based on current viewport state (reversible)
  const shouldAnimate = once ? (isInView || hasBeenInView) : isInView;
  
  return { ref, isInView: shouldAnimate };
}

/**
 * Variant definitions for common scroll animations
 */
export const scrollVariants = {
  // Fade + slide up + blur
  fadeSlideBlur: {
    hidden: {
      opacity: 0,
      y: 30,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  
  // Fade + slide up (no blur)
  fadeSlide: {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  
  // Fade only
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
  
  // Scale + fade
  scaleFade: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  
  // Slide from left
  slideLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  
  // Slide from right
  slideRight: {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  
  // Stagger container for children
  staggerContainer: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },
  
  // Stagger child item
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

/**
 * Hook for staggered children animations
 * Returns variants for parent and children
 */
export function useStaggeredChildren(
  staggerDelay: number = 0.08,
  delayChildren: number = 0.1
) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };
  
  return { containerVariants, itemVariants };
}

/**
 * Hook for reduced motion support
 * Returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);
  
  return prefersReduced;
}