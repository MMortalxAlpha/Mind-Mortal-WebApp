import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface BlobLogoProps {
  interactive?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "light" | "dark";
}

const BlobLogo: React.FC<BlobLogoProps> = ({
  interactive = true,
  size = "md",
  className = "",
  variant = "default",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const navigate = useNavigate();
  const logoSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  // Logo variants
  const colorVariants = {
    default: {
      textColor: "text-white",
      logoColor: "#FFFFFF",
    },
    light: {
      textColor: "text-[#F97316]",
      logoColor: "#F97316",
    },
    dark: {
      textColor: "text-white",
      logoColor: "#FFFFFF",
    },
  };

  const currentVariant = colorVariants[variant];

  // Handle tap/click effects
  useEffect(() => {
    if (isTapped) {
      const timer = setTimeout(() => {
        setIsTapped(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isTapped]);

  return (
    <motion.div
      className={`relative flex items-center justify-center rounded-full shadow-md bg-gradient-to-br ${currentVariant.logoColor} ${logoSizes[size]} ${className} hover:cursor-pointer`}
      onHoverStart={interactive ? () => setIsHovered(true) : undefined}
      onHoverEnd={interactive ? () => setIsHovered(false) : undefined}
      onTapStart={interactive ? () => setIsTapped(true) : undefined}
      animate={{
        scale: isTapped ? 0.95 : isHovered ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 10,
      }}
      onClick={() => {
        navigate("/dashboard");
      }}
    >
      {/* Fixed logo with proper sizing and centered */}
      <div className="w-3/4 h-3/4 relative flex items-center justify-center">
        <img
          src="/Assets/Orange_icon.png"
          alt="MMortal Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {interactive && isHovered && (
        <motion.div
          className="absolute inset-0 rounded-full bg-white opacity-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

export default BlobLogo;
