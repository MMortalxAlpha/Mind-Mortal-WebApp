import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface FloatingObjectProps {
  children: React.ReactNode;
  interactiveDistance?: number;
  delay?: number;
  size?: number;
  color?: string;
  speed?: number;
  x?: number;
  y?: number;
}

const FloatingObject: React.FC<FloatingObjectProps> = ({
  children,
  interactiveDistance = 100,
  delay = 0,
  size = 40,
  color = "rgba(255, 255, 255, 0.1)",
  speed = 2,
  x = 0,
  y = 0,
}) => {
  const [position, setPosition] = useState({ x, y });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const distanceX = mousePosition.x - position.x;
    const distanceY = mousePosition.y - position.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < interactiveDistance) {
      setIsHovered(true);
      // Create a stronger repulsion effect
      const angle = Math.atan2(distanceY, distanceX);
      const force = (interactiveDistance - distance) / interactiveDistance;
      const moveX = -Math.cos(angle) * force * 30; // Increased force
      const moveY = -Math.sin(angle) * force * 30; // Increased force

      setPosition((prev) => ({
        x: prev.x + moveX,
        y: prev.y + moveY,
      }));
    } else {
      setIsHovered(false);
      // Return slowly to original position
      setPosition((prev) => ({
        x: prev.x + (x - prev.x) * 0.05,
        y: prev.y + (y - prev.y) * 0.05,
      }));
    }
  }, [mousePosition, interactiveDistance, x, y]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isHovered ? 1 : 0.7,
        scale: isHovered ? 1.2 : 1,
        x: position.x,
        y: position.y,
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        rotate: {
          duration: speed * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
        scale: {
          duration: 0.3,
        },
      }}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isHovered ? "0 0 25px rgba(255, 255, 255, 0.5)" : "none", // Brighter glow
        cursor: "pointer",
        zIndex: 1,
      }}
      whileHover={{ scale: 1.5 }} // More dramatic scale effect
      whileTap={{ scale: 0.8 }} // Add tap effect
    >
      {children}
    </motion.div>
  );
};

interface DashboardAnimatedBackgroundProps {
  children: React.ReactNode;
  objectCount?: number;
}

const DashboardAnimatedBackground: React.FC<
  DashboardAnimatedBackgroundProps
> = ({
  children,
  objectCount = 12, // Increased default object count
}) => {
  // const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

  // TODO: Will clean the page later. Kept for future reference.

  // useEffect(() => {
  //   const updateDimensions = () => {
  //     setDimensions({
  //       width: window.innerWidth,
  //       height: window.innerHeight,
  //     });
  //   };

  //   updateDimensions();
  //   window.addEventListener("resize", updateDimensions);

  //   return () => {
  //     window.removeEventListener("resize", updateDimensions);
  //   };
  // }, []);

  // More vibrant colors for floating objects
  // const colors = [
  //   "rgba(155, 135, 245, 0.4)", // Brighter purple
  //   "rgba(249, 115, 22, 0.3)", // Brighter orange
  //   "rgba(204, 255, 0, 0.3)", // Brighter yellow-green
  //   "rgba(51, 195, 240, 0.3)", // Brighter blue
  //   "rgba(255, 149, 0, 0.3)", // Brighter amber
  //   "rgba(236, 72, 153, 0.3)", // Pink
  //   "rgba(16, 185, 129, 0.3)", // Green
  // ];

  // Create objects with more random variety
  // const objects = Array.from({ length: objectCount }).map((_, index) => ({
  //   id: index,
  //   x: Math.random() * dimensions.width * 0.9,
  //   y: Math.random() * dimensions.height * 0.9,
  //   size: Math.random() * 50 + 15, // More varied sizes
  //   color: colors[index % colors.length],
  //   delay: Math.random() * 3,
  //   speed: Math.random() * 4 + 1, // Increased speed range
  //   symbol: ["✨", "•", "○", "◇", "⬤", "◌", "◦"][Math.floor(Math.random() * 7)], // Different symbols
  // }));

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background blur gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/80 to-background/60 backdrop-blur-[2px] z-0" />

      {/* Grid overlay for tech effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIwLjIiPjxwYXRoIGQ9Ik0zMCAwdjYwTTYwIDMwSDBNNDUgMTVMNjAgME0xNSAxNUwwIDBNMTUgNDVMMCA2ME00NSA0NUw2MCA2MCIvPjwvZz48L2c+PC9zdmc+')] opacity-5 z-0"></div>

      {/* Floating objects with enhanced interactivity */}
      {/* {objects.map(obj => (
        <FloatingObject
          key={obj.id}
          x={obj.x}
          y={obj.y}
          size={obj.size}
          color={obj.color}
          delay={obj.delay}
          speed={obj.speed}
          interactiveDistance={120} // Increased interaction distance
        >
          <span className="text-xs text-white/90">{obj.symbol}</span>
        </FloatingObject>
      ))} */}

      {/* Main content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default DashboardAnimatedBackground;
