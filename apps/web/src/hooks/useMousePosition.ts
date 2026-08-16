"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });
  const rafRef = useRef<number | undefined>(undefined);
  const targetRef = useRef<MousePosition>({ x: 0, y: 0, normalizedX: 0, normalizedY: 0 });
  const currentRef = useRef<MousePosition>({ x: 0, y: 0, normalizedX: 0, normalizedY: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    targetRef.current = {
      x: e.clientX,
      y: e.clientY,
      normalizedX: (e.clientX / innerWidth) * 2 - 1,
      normalizedY: (e.clientY / innerHeight) * 2 - 1,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.1;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.1;
      currentRef.current.normalizedX += (targetRef.current.normalizedX - currentRef.current.normalizedX) * 0.1;
      currentRef.current.normalizedY += (targetRef.current.normalizedY - currentRef.current.normalizedY) * 0.1;

      setPosition({ ...currentRef.current });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return position;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reduced;
}