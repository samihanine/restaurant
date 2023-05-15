import React, { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      style={{ display: isVisible ? 'inline' : 'none' }}
      className="fixed bottom-7 right-7 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg"
      aria-label="Scroll to top"
    >
      <div className="flex justify-center">
        <FiArrowUp className="text-[50px]" />
      </div>
    </button>
  );
};

export { ScrollToTopButton };
