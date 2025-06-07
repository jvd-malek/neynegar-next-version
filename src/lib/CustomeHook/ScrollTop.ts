"use client"
import { animateScroll } from 'react-scroll';
import { useCallback, useEffect, useState } from 'react';

const useSmoothScroll = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollTo = useCallback((position: number, options = { duration: 500 }) => {
    if (!isMounted) return;
    animateScroll.scrollTo(position, {
      duration: options.duration,
      smooth: true,
    });
  }, [isMounted]);

  const scrollToTop = useCallback((options = { duration: 500 }) => {
    if (!isMounted) return;
    animateScroll.scrollToTop({
      duration: options.duration,
      smooth: true,
    });
  }, [isMounted]);

  return { scrollTo, scrollToTop };
};

export default useSmoothScroll;