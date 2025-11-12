import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  objectCount?: number;
  density?: number;
  speed?: number;
  color?: string;
  mouseInteraction?: boolean;
  interactionStrength?: number;
  particleSize?: 'small' | 'medium' | 'large' | 'mixed';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  objectCount = 40, // Added this prop
  density = 40,
  speed = 25,
  color = 'primary',
  mouseInteraction = true,
  interactionStrength = 100,
  particleSize = 'mixed',
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    shape: 'circle' | 'square' | 'triangle' | 'hexagon';
    color: string;
    duration: number;
    delay: number;
  }>>([]);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Tech-inspired colors for particles
  const particleColors = [
    'bg-[#F97316]/15',
    'bg-[#CCFF00]/15',
    'bg-[#33C3F0]/15',
    'bg-[#FF9500]/15',
    'bg-[#FF2D55]/15',
  ];

  // Initialize particles
  useEffect(() => {
    // Set window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Create particles based on objectCount (updated from density)
    const newParticles = Array.from({ length: objectCount }, (_, i) => {
      let size = 0;
      
      // Set particle size based on the particleSize prop
      if (particleSize === 'small') {
        size = Math.random() * 15 + 5;
      } else if (particleSize === 'large') {
        size = Math.random() * 50 + 20;
      } else if (particleSize === 'mixed') {
        // Create a mix of different sizes with more variation
        const sizeGroup = Math.random();
        if (sizeGroup < 0.5) {
          size = Math.random() * 15 + 5; // Small
        } else if (sizeGroup < 0.8) {
          size = Math.random() * 30 + 15; // Medium
        } else {
          size = Math.random() * 50 + 30; // Large
        }
      } else {
        // Medium is default
        size = Math.random() * 30 + 10;
      }
      
      // Randomly assign shapes
      const shapes: Array<'circle' | 'square' | 'triangle' | 'hexagon'> = ['circle', 'square', 'triangle', 'hexagon'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        shape,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        duration: Math.random() * speed + 10,
        delay: Math.random() * 5,
      };
    });
    
    setParticles(newParticles);

    // Handle window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [objectCount, speed, particleSize]);

  // Mouse move event handler
  useEffect(() => {
    if (!mouseInteraction) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
      setIsHovering(true);
      
      // Reset hover state after mouse stops moving
      clearTimeout((window as any).mouseTimeout);
      (window as any).mouseTimeout = setTimeout(() => {
        setIsHovering(false);
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout((window as any).mouseTimeout);
    };
  }, [mouseInteraction]);

  // Calculate distance from mouse to particle
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    const xDist = x1 - x2;
    const yDist = y1 - y2;
    return Math.sqrt(xDist * xDist + yDist * yDist);
  };
  
  // Render a shape based on the shape prop
  const renderShape = (shape: 'circle' | 'square' | 'triangle' | 'hexagon', isNearCursor: boolean) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return 'rounded-md';
      case 'triangle':
        return 'clip-path-triangle';
      case 'hexagon':
        return 'clip-path-hexagon';
      default:
        return 'rounded-full';
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-background via-background to-background/90">
      {/* Grid overlay for tech effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIwLjIiPjxwYXRoIGQ9Ik0zMCAwdjYwTTYwIDMwSDBNNDUgMTVMNjAgME0xNSAxNUwwIDBNMTUgNDVMMCA2ME00NSA0NUw2MCA2MCIvPjwvZz48L2c+PC9zdmc+')] opacity-5"></div>
      
      {/* Background particles */}
      {particles.map((particle) => {
        // Convert percentage position to pixels
        const particleX = (particle.x / 100) * windowSize.width;
        const particleY = (particle.y / 100) * windowSize.height;
        
        // Calculate distance from mouse
        const distance = getDistance(
          mousePosition.x, 
          mousePosition.y, 
          particleX, 
          particleY
        );
        
        // Mouse repulsion effect - stronger when closer
        const maxDistance = interactionStrength * 3;
        const repulsionFactor = (mouseInteraction && distance < maxDistance) 
          ? ((maxDistance - distance) / maxDistance) * interactionStrength 
          : 0;
        
        // Direction vector from particle to mouse (normalized)
        const dirX = distance > 0 ? (particleX - mousePosition.x) / distance : 0;
        const dirY = distance > 0 ? (particleY - mousePosition.y) / distance : 0;
        
        // Calculate repulsion offset
        const offsetX = dirX * repulsionFactor;
        const offsetY = dirY * repulsionFactor;

        // Determine if particle is near cursor for glow effect
        const isNearCursor = isHovering && distance < maxDistance / 2;
        
        const shapeClass = renderShape(particle.shape, isNearCursor);

        return (
          <motion.div
            key={particle.id}
            className={`absolute ${particle.color} backdrop-blur-sm ${shapeClass} ${
              isNearCursor ? 'shadow-lg shadow-primary/30' : ''
            }`}
            style={{ 
              width: particle.size, 
              height: particle.size,
              left: `${particle.x}vw`,
              top: `${particle.y}vh`,
            }}
            animate={{
              x: mouseInteraction ? [0, offsetX, 0] : [0, 20, 0],
              y: mouseInteraction ? [0, offsetY, 0] : [0, 20, 0],
              scale: isNearCursor 
                ? [1, 1 + ((maxDistance - distance) / maxDistance) * 0.5, 1] 
                : [1, 1.1, 1],
              opacity: isNearCursor ? [0.8, 1, 0.8] : undefined,
              boxShadow: isNearCursor 
                ? ['0px 0px 0px rgba(249, 115, 22, 0)', '0px 0px 15px rgba(249, 115, 22, 0.5)', '0px 0px 0px rgba(249, 115, 22, 0)'] 
                : undefined
            }}
            transition={{
              duration: isNearCursor ? 1 : particle.duration * 0.1,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        );
      })}
      
      {/* Mouse trail effect */}
      {mouseInteraction && isHovering && (
        <>
          <motion.div
            className="absolute pointer-events-none w-20 h-20 rounded-full bg-[#F97316]/10 backdrop-blur-sm"
            style={{
              left: mousePosition.x - 40,
              top: mousePosition.y - 40,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0],
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
          />
          <motion.div
            className="absolute pointer-events-none w-6 h-6 rounded-full bg-[#CCFF00]/30"
            style={{
              left: mousePosition.x - 3,
              top: mousePosition.y - 3,
            }}
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </>
      )}
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
