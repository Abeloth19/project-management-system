import React, { useEffect, useState } from 'react';

interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: 'fade-in' | 'slide-up' | 'bounce-in' | 'slide-in-right' | 'slide-in-left' | 'scale-in' | 'fade-in-up';
  delay?: number;
  duration?: number;
  className?: string;
  trigger?: boolean;
  stagger?: boolean;
  staggerDelay?: number;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 300,
  className = '',
  trigger = true,
  stagger = false,
  staggerDelay = 100
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (trigger && !hasAnimated) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay, hasAnimated]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    return animation;
  };

  const getCustomStyles = () => {
    return {
      animationDuration: `${duration}ms`,
      animationFillMode: 'both'
    };
  };

  if (stagger && React.Children.count(children) > 1) {
    return (
      <div className={className}>
        {React.Children.map(children, (child, index) => (
          <AnimatedContainer
            key={index}
            animation={animation}
            delay={delay + (index * staggerDelay)}
            duration={duration}
            trigger={trigger}
            className="stagger-item"
          >
            {child}
          </AnimatedContainer>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${getAnimationClass()} ${className}`}
      style={getCustomStyles()}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;