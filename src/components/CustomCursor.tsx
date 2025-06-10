
import { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, input, [role="button"], .interactive')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    const handleKeyDown = () => {
      setIsVisible(false);
    };

    const handleMouseMove = () => {
      setIsVisible(true);
    };

    document.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`custom-cursor ${isHovering ? 'hover' : ''}`}
      style={{
        left: position.x - 12,
        top: position.y - 12,
      }}
    />
  );
};
