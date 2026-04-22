/**
 * USE IN VIEW HOOK
 * 
 * Detects when an element enters the viewport using IntersectionObserver.
 * Useful for lazy loading, impression tracking, and animations.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseInViewReturn {
  ref: React.RefObject<HTMLElement>;
  inView: boolean;
  entry?: IntersectionObserverEntry;
}

export function useInView({
  threshold = 0,
  rootMargin = '0px',
  triggerOnce = false,
}: UseInViewOptions = {}): UseInViewReturn {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>();
  const hasTriggered = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      setEntry(entry);
      setInView(entry.isIntersecting);

      // If triggerOnce is enabled and element has been in view, don't update again
      if (triggerOnce && entry.isIntersecting) {
        hasTriggered.current = true;
      }
    },
    [triggerOnce]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Don't observe if triggerOnce already triggered
    if (triggerOnce && hasTriggered.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, handleIntersection]);

  return { ref: ref as React.RefObject<HTMLElement>, inView, entry };
}
